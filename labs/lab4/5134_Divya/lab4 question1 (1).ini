<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Status Chart Example</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f4f4f4;
        }

        .chart-container {
            text-align: center;
        }

        svg {
            background-color: white;
            border: 1px solid #ccc;
        }

        .axis-label {
            font-size: 12px;
            fill: #666;
        }

        .bar-label {
            font-size: 14px;
            fill: #333;
        }

        h1 {
            font-size: 24px;
            margin-bottom: 20px;
            color: #333;
        }
    </style>
</head>
<body>

    <div class="chart-container">
        <h1>Task Status Overview</h1>
        <svg id="statusChart" width="400" height="300">
            <!-- X Axis -->
            <line x1="50" y1="250" x2="350" y2="250" stroke="black"/>
            <!-- Y Axis -->
            <line x1="50" y1="50" x2="50" y2="250" stroke="black"/>
        </svg>
    </div>

    <script>

        const dbRequest = indexedDB.open("TodoListDB", 1);

        dbRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore("todos", { keyPath: "id" });
        };

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction("todos", "readwrite");
            const objectStore = transaction.objectStore("todos");

            
            objectStore.count().onsuccess = function(countEvent) {
                if (countEvent.target.result === 0) {
                    for (let i = 1; i <= 1000; i++) {
                        const todoItem = { id: i, status: i % 3 === 0 ? "Completed" : (i % 3 === 1 ? "In Progress" : "Other") };
                        objectStore.add(todoItem);
                    }
                }
            };

            transaction.oncomplete = function() {
                console.log("Sample to-do items added.");
                fetchDataAndUpdateChart(db); // Fetch data and update the chart after adding items
            };
        };

        function fetchDataAndUpdateChart(db) {
            const transaction = db.transaction("todos", "readonly");
            const objectStore = transaction.objectStore("todos");
            const taskCounts = { "Completed": 0, "In Progress": 0, "Other": 0 };

            objectStore.openCursor().onsuccess = function(event) {
                const cursor = event.target.result;
                if (cursor) {
                    taskCounts[cursor.value.status]++;
                    cursor.continue();
                } else {
                    
                    updateChart(taskCounts);
                }
            };
        }

        function updateChart(taskCounts) {
            const svg = document.getElementById('statusChart');
            svg.innerHTML = ""; // Clear existing chart
            const chartHeight = 250;
            const barWidth = 50;
            const barSpacing = 80;
            const startX = 80;
            const maxTaskCount = Math.max(...Object.values(taskCounts));

            
            Object.entries(taskCounts).forEach(([status, count], index) => {
                const barHeight = (count / maxTaskCount) * 200;

                
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", startX + index * barSpacing);
                rect.setAttribute("y", chartHeight - barHeight);
                rect.setAttribute("width", barWidth);
                rect.setAttribute("height", barHeight);
                rect.setAttribute("fill", status === "Completed" ? "green" : (status === "In Progress" ? "orange" : "gray"));
                svg.appendChild(rect);

                
                const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
                label.setAttribute("x", startX + index * barSpacing + 10);
                label.setAttribute("y", chartHeight + 20);
                label.setAttribute("class", "bar-label");
                label.textContent = status;
                svg.appendChild(label);

                
                const countLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
                countLabel.setAttribute("x", startX + index * barSpacing + 15);
                countLabel.setAttribute("y", chartHeight - barHeight - 10);
                countLabel.setAttribute("class", "bar-label");
                countLabel.textContent = count;
                svg.appendChild(countLabel);
            });

            
            for (let i = 0; i <= maxTaskCount; i += 50) {
                const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
                yLabel.setAttribute("x", 20);
                yLabel.setAttribute("y", chartHeight - (i / maxTaskCount) * 200);
                yLabel.setAttribute("class", "axis-label");
                yLabel.textContent = i;
                svg.appendChild(yLabel);
            }

            
            const xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            xAxisLabel.setAttribute("x", 180);
            xAxisLabel.setAttribute("y", 290);
            xAxisLabel.setAttribute("class", "axis-label");
            xAxisLabel.textContent = "Task Status";
            svg.appendChild(xAxisLabel);

            
            const yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            yAxisLabel.setAttribute("x", 10);
            yAxisLabel.setAttribute("y", 30);
            yAxisLabel.setAttribute("class", "axis-label");
            yAxisLabel.setAttribute("transform", "rotate(-90 20,100)");
            yAxisLabel.textContent = "Number of Tasks";
            svg.appendChild(yAxisLabel);
        }
    </script>

</body>
</html>