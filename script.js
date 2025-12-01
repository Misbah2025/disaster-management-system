document.addEventListener('DOMContentLoaded', () => {
    //  Starting  Dijkstra's Algorithm 
    const nodes = {
        'Sylhet': { x: 70, y: 5 },
        'Sunamganj': { x: 55, y: 15 },
        'Moulvibazar': { x: 70, y: 25 },
        'Habiganj': { x: 55, y: 35 },
        'Netrokona': { x: 30, y: 20 },
        'Noakhali': { x: 60, y: 55 },
        'Bhola': { x: 45, y: 75 },
        'Khagrachari': { x: 75, y: 65 },
        'Bandarban': { x: 65, y: 85 },
        'Rangamati': { x: 85, y: 75 }
    };

    //  connections and distance (weight)
    const graph = {
        'Sylhet': { 'Sunamganj': 15, 'Moulvibazar': 20 },
        'Sunamganj': { 'Sylhet': 15, 'Netrokona': 35, 'Habiganj': 10 },
        'Moulvibazar': { 'Sylhet': 20, 'Habiganj': 10, 'Khagrachari': 40 },
        'Habiganj': { 'Sunamganj': 10, 'Moulvibazar': 10, 'Netrokona': 30, 'Noakhali': 35 },
        'Netrokona': { 'Sunamganj': 35, 'Habiganj': 30, 'Noakhali': 50 },
        'Noakhali': { 'Habiganj': 35, 'Netrokona': 50, 'Khagrachari': 20, 'Bhola': 25 },
        'Bhola': { 'Noakhali': 25, 'Bandarban': 45 },
        'Khagrachari': { 'Moulvibazar': 40, 'Noakhali': 20, 'Rangamati': 10, 'Bandarban': 20 },
        'Bandarban': { 'Bhola': 45, 'Khagrachari': 20, 'Rangamati': 15 },
        'Rangamati': { 'Khagrachari': 10, 'Bandarban': 15 }
    };
//event handling
    const mapEdgesSvg = document.getElementById('map-edges');
    const mapContainer = document.getElementById('red-zone-map');
    const startNodeSelect = document.getElementById('start-node');
    
    //select node and end node
    const endNodeSelect = document.createElement('select');
    endNodeSelect.id = 'end-node';
    endNodeSelect.className = 'p-3 border border-gray-300 rounded-lg shadow-md focus:ring-primary-blue focus:border-primary-blue w-full md:w-1/3';
    endNodeSelect.innerHTML = '<option value="">-- Select Ending Node --</option>';
    
   //find the container for start node and end node
    const pathFormContainer = document.querySelector('#path-finder > .flex.flex-col.md\\:flex-row.gap-4.mt-6.items-center.justify-center');
    if (pathFormContainer && !document.getElementById('end-node')) {
         startNodeSelect.parentNode.insertBefore(endNodeSelect, startNodeSelect.nextSibling);
    }
    const finalEndNodeSelect = document.getElementById('end-node') || endNodeSelect;
    const findPathBtn = document.getElementById('find-path-btn');
    const pathResultDiv = document.getElementById('path-result');

    // drop down section
    Object.keys(nodes).forEach(nodeName => {
        const option1 = document.createElement('option');
        option1.value = nodeName;
        option1.textContent = nodeName;
        startNodeSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = nodeName;
        option2.textContent = nodeName;
        finalEndNodeSelect.appendChild(option2);
    });
    
   
    function drawEdges() {
        mapEdgesSvg.innerHTML = ''; 
        const containerRect = mapContainer.getBoundingClientRect();

        for (const [nodeA, connections] of Object.entries(graph)) {
            const nodeAData = nodes[nodeA];
            const x1 = (nodeAData.x / 100) * containerRect.width;
            const y1 = (nodeAData.y / 100) * containerRect.height;

            for (const [nodeB, distance] of Object.entries(connections)) {
                if (nodeA < nodeB) { 
                    const nodeBData = nodes[nodeB];
                    const x2 = (nodeBData.x / 100) * containerRect.width;
                    const y2 = (nodeBData.y / 100) * containerRect.height;
                    
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('stroke', '#4b5563'); 
                    line.setAttribute('stroke-width', '2');
                    line.setAttribute('data-nodes', `${nodeA}-${nodeB}`); 
                    
                    //  obstacle
                    if ((nodeA === 'Habiganj' && nodeB === 'Moulvibazar') || (nodeA === 'Moulvibazar' && nodeB === 'Habiganj')) {
                         line.setAttribute('stroke', '#dc2626'); 
                         line.setAttribute('stroke-dasharray', '5 5'); 
                    }

                    mapEdgesSvg.appendChild(line);
                }
            }
        }
    }
    
 
    window.addEventListener('resize', drawEdges);
    drawEdges();


    // Dijkstra's Algorithm for function calling
    function dijkstra(startNode, endNode) {
        let distances = {};
        let visited = new Set();
        let predecessors = {};
        let path = [];

        // Initialize distances
        for (let node in graph) {
            distances[node] = Infinity;
            predecessors[node] = null;
        }
        distances[startNode] = 0;

       //priorityqueue
        function findMinDistanceNode() {
            let minDistance = Infinity;
            let minNode = null;
            for (let node in distances) {
                if (distances[node] < minDistance && !visited.has(node)) {
                    minDistance = distances[node];
                    minNode = node;
                }
            }
            return minNode;
        }

        let currentNode = findMinDistanceNode();
        while (currentNode !== null) {
            let distance = distances[currentNode];
            let neighbors = graph[currentNode];

            for (let neighbor in neighbors) {
                //  obstacle checking
                const isObstacle = 
                    (currentNode === 'Habiganj' && neighbor === 'Moulvibazar') || 
                    (currentNode === 'Moulvibazar' && neighbor === 'Habiganj');

                if (isObstacle) continue; 

                let newDistance = distance + neighbors[neighbor];
                if (newDistance < distances[neighbor]) {
                    distances[neighbor] = newDistance;
                    predecessors[neighbor] = currentNode;
                }
            }
            visited.add(currentNode);
            if (currentNode === endNode) break;  
            currentNode = findMinDistanceNode();
        }

        // Reconstruct the way
        let crawl = endNode;
        while (crawl) {
            path.unshift(crawl);
            if (crawl === startNode) break; 
            crawl = predecessors[crawl];
        }
        
        
        if (path[0] !== startNode) {
             return { distance: Infinity, path: [] };
        }

        return { distance: distances[endNode], path };
    }


    
    findPathBtn.addEventListener('click', () => {
        const startNode = startNodeSelect.value;
        const endNode = finalEndNodeSelect.value; 
        
        if (!startNode || !endNode) {
            alert("Please select both a Starting Node and an Ending Node.");
            return;
        }
        if (startNode === endNode) {
            alert("Starting Node and Ending Node must be different.");
            return;
        }
        
        
        document.querySelectorAll('.shortest-path').forEach(line => line.classList.remove('shortest-path'));
        pathResultDiv.classList.add('hidden');
        
    
        const obstacleInPath = (startNode === 'Habiganj' && endNode === 'Moulvibazar') || 
                               (startNode === 'Moulvibazar' && endNode === 'Habiganj');
        
        if (obstacleInPath) {
            alert(`⛔ OBSTACLE DETECTED! The direct route between ${startNode} and ${endNode} is blocked. Finding the shortest *alternative* route.`);
        }

    
        const { distance, path } = dijkstra(startNode, endNode);
        
        // Result
        if (distance === Infinity || path.length < 2) {
            pathResultDiv.innerHTML = `<p class="text-accent-red font-bold">❌ No path found from ${startNode} to ${endNode}.</p>`;
        } else {
            const pathString = path.join(' → ');
            pathResultDiv.innerHTML = `
                <p><strong>Start Node:</strong> ${startNode}</p>
                <p><strong>Destination:</strong> ${endNode}</p>
                <p><strong>Shortest Path:</strong> <span class="text-primary-blue">${pathString}</span></p>
                <p><strong>Total Distance:</strong> ${distance} km.</p>
            `;
            
           
            highlightPath(path);
        }
        pathResultDiv.classList.remove('hidden');
    });
    
    function highlightPath(path) {
        if (path.length < 2) return;
        
      
        drawEdges(); 
        
        for (let i = 0; i < path.length - 1; i++) {
            const nodeA = path[i];
            const nodeB = path[i+1];
            
            
            const n1 = nodeA.localeCompare(nodeB) < 0 ? nodeA : nodeB;
            const n2 = nodeA.localeCompare(nodeB) < 0 ? nodeB : nodeA;

            const selector = `[data-nodes="${n1}-${n2}"]`;
            const line = mapEdgesSvg.querySelector(selector);
            
            if (line) {
                line.classList.add('shortest-path');
                line.setAttribute('stroke', '#10b981'); 
                line.setAttribute('stroke-width', '4');
                line.removeAttribute('stroke-dasharray'); 
            }
        }
    }


    //knapsack algorithm start
    const allowedDryFood = ['chira', 'muri', 'rice','biscuits'];
    const allowedPureWater = ['pure water', 'bottled water'];
    const allowedMedicine = ['saline', 'paracetamol','bleaching powder']; 
    
    let items = [];

    const itemForm = document.getElementById('item-form');
    const addItemBtn = document.getElementById('add-item-btn');
    const allocateItemsBtn = document.getElementById('allocate-items-btn');
    const itemTableBody = document.getElementById('item-table-body');
    const truckCapacityInput = document.getElementById('truck-capacity');
    const allocationResultDiv = document.getElementById('allocation-result');
    const bestItemsDetails = document.getElementById('best-items-details');

    
    function getItemType(name) {
        const lowerName = name.toLowerCase();
        if (allowedDryFood.includes(lowerName)) return 'Dry Food 🍚';
        if (allowedPureWater.includes(lowerName)) return 'Pure Water 💧';
        if (allowedMedicine.includes(lowerName)) return 'Medicine 💊';
        return 'Invalid';
    }

    //  Handler
    addItemBtn.addEventListener('click', () => {
        const name = document.getElementById('item-name').value.trim();
        const weight = parseInt(document.getElementById('item-weight').value);
        const value = parseInt(document.getElementById('item-value').value);
        const quantity = parseInt(document.getElementById('item-quantity').value);

        if (!name || isNaN(weight) || isNaN(value) || isNaN(quantity) || weight <= 0 || value <= 0 || quantity <= 0) {
            alert("Please fill in all item fields with valid positive numbers.");
            return;
        }

        const type = getItemType(name);
        if (type === 'Invalid') {
            alert(`Invalid item: "${name}". Allowed items are: Dry Food (Chira, Muri, Rice), Pure Water, Medicine (Saline, Paracetamol).`);
            return;
        }
        
      //0/1 knapsack started
        for (let i = 0; i < quantity; i++) {
            items.push({ 
                name: name, 
                type: type, 
                weight: weight, 
                value: value 
            });
        }
        
        renderItemTable();
       
        itemForm.reset();
    });

    
    function renderItemTable() {
        itemTableBody.innerHTML = '';
        
       
        const aggregatedItems = items.reduce((acc, item) => {
            const key = `${item.name}-${item.weight}-${item.value}`;
            if (!acc[key]) {
                acc[key] = { ...item, quantity: 0 };
            }
            acc[key].quantity += 1;
            return acc;
        }, {});

        Object.values(aggregatedItems).forEach(item => {
            const row = itemTableBody.insertRow();
            row.classList.add('hover:bg-gray-50');
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${item.name}</td>
                <td class="py-2 px-4 border-b">${item.type}</td>
                <td class="py-2 px-4 border-b">${item.weight}</td>
                <td class="py-2 px-4 border-b">${item.value}</td>
                <td class="py-2 px-4 border-b">${item.quantity}</td>
            `;
        });
    }

    // 0/1 Knapsack Algorithm
    function knapsack(items, capacity) {
        const N = items.length;
     
        const K = Array(N + 1).fill(0).map(() => Array(capacity + 1).fill(0));

        for (let i = 1; i <= N; i++) {
            const item = items[i - 1]; 
            for (let w = 1; w <= capacity; w++) {
                if (item.weight <= w) {
                    
                    const include = item.value + K[i - 1][w - item.weight];
                    const exclude = K[i - 1][w];
                    K[i][w] = Math.max(include, exclude);
                } else {
                   
                    K[i][w] = K[i - 1][w];
                }
            }
        }
        
      
        const selectedItems = [];
        let w = capacity;
        for (let i = N; i > 0 && w > 0; i--) {
            if (K[i][w] !== K[i - 1][w]) {
             
                selectedItems.push(items[i - 1]);
                w -= items[i - 1].weight;
            }
        }
        
        return { maxValue: K[N][capacity], selectedItems };
    }

    //  Items Handler
    allocateItemsBtn.addEventListener('click', () => {
        const capacity = parseInt(truckCapacityInput.value);

        if (isNaN(capacity) || capacity <= 0) {
            alert("Please enter a valid positive Truck Max Capacity.");
            return;
        }

        if (items.length === 0) {
            alert("⚠️ No items have been added to the list. Please add items before allocation.");
            return;
        }
        
        
        const { maxValue, selectedItems } = knapsack(items, capacity);

        if (selectedItems.length === 0) {
            allocationResultDiv.classList.remove('border-green-600');
            allocationResultDiv.classList.add('border-accent-red');
            allocationResultDiv.innerHTML = `<h4 class="text-lg font-bold text-accent-red">❌ Allocation Failed</h4><p>No item combination fits the truck capacity.</p>`;
        } else {
           
            const aggregatedSelection = selectedItems.reduce((acc, item) => {
                const key = `${item.name} (${item.type})`;
                if (!acc[key]) {
                    acc[key] = { count: 0, totalWeight: 0, totalValue: 0 };
                }
                acc[key].count += 1;
                acc[key].totalWeight += item.weight;
                acc[key].totalValue += item.value;
                return acc;
            }, {});
            
            let detailsHtml = `<ul class="list-disc ml-5 space-y-1">`;
            let totalWeight = 0;

            Object.keys(aggregatedSelection).forEach(key => {
                const item = aggregatedSelection[key];
                detailsHtml += `<li><strong>${key}</strong>: ${item.count} units (Total Weight: ${item.totalWeight} kg)</li>`;
                totalWeight += item.totalWeight;
            });

            detailsHtml += `</ul>`;

            allocationResultDiv.classList.remove('border-accent-red');
            allocationResultDiv.classList.add('border-green-600');
            allocationResultDiv.innerHTML = `
                <h4 class="text-lg font-bold text-green-700 mb-2">✅ Best Items to Carry:</h4>
                <p class="font-bold">Total Max Value (Priority): ${maxValue}</p>
                <p class="font-bold">Total Weight Carried: ${totalWeight} kg (Remaining Capacity: ${capacity - totalWeight} kg)</p>
                <div id="best-items-details" class="mt-2">${detailsHtml}</div>
            `;
        }
        
        allocationResultDiv.classList.remove('hidden');
    });
    
    
    drawEdges(); 
});