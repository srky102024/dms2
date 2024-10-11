/*
IndexedDB Project: Todo List Task Handling and Performance Measurement
*/

// Performance metrics to store the results
let performanceMetrics = {
    taskCount: 100000,
    completedTasks: [],
    readTimes: [],
    completedReadTimes: [],
    readOnlyTimes: [],
    indexedReadTimes: [],
    copiedTasks: []
};

// Step 1: Set up IndexedDB and create object stores
function setupDatabase(dbName, storeName, onComplete) {
    let request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
        let db = event.target.result;

        // Create the TodoList store if it doesn't exist
        if (!db.objectStoreNames.contains(storeName)) {
            let store = db.createObjectStore(storeName, { keyPath: 'id' });
            // Create an index on the status field
            store.createIndex('statusIndex', 'status', { unique: false });
        }

        // Create the TodoListCompleted store if it doesn't exist
        if (!db.objectStoreNames.contains('TodoListCompleted')) {
            db.createObjectStore('TodoListCompleted', { keyPath: 'id' });
        }
    };

    request.onsuccess = function (event) {
        let db = event.target.result;
        console.log("Database setup complete.");
        onComplete(db);
    };

    request.onerror = function (event) {
        console.error("Error setting up database:", event.target.error);
    };
}

// Step 2: Populate IndexedDB with 100,000 tasks (1,000 "completed", others "in progress")
function addTasks(db, storeName, onComplete) {
    const totalTasks = performanceMetrics.taskCount;
    const batchSize = 10000;
    let added = 0;

    function addBatch() {
        if (added >= totalTasks) {
            onComplete();
            return;
        }

        let transaction = db.transaction(storeName, 'readwrite');
        let store = transaction.objectStore(storeName);

        transaction.oncomplete = function () {
            console.log(Added batch of ${batchSize} tasks.);
            added += batchSize;
            addBatch();
        };

        transaction.onerror = function (event) {
            console.error('Batch insert error:', event.target.error);
        };

        for (let i = added; i < added + batchSize && i < totalTasks; i++) {
            let task = {
                id: i,
                task: Task_${i},
                status: i < 1000 ? 'completed' : 'in progress',
                dueDate: 2024-09-${(i % 30) + 1}
            };
            store.add(task);
        }
    }

    addBatch();
}

// Step 3: Read all "completed" tasks and measure time
function readCompletedTasks(db, storeName, onComplete) {
    let transaction = db.transaction(storeName);
    let store = transaction.objectStore(storeName);
    let request = store.openCursor();
    let completedTasks = 0;
    let startTime = performance.now();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === 'completed') {
                completedTasks++;
            }
            cursor.continue();
        } else {
            let endTime = performance.now();
            console.log(Read ${completedTasks} completed tasks in ${(endTime - startTime).toFixed(2)} ms.);
            performanceMetrics.completedTasks.push(completedTasks);
            performanceMetrics.readTimes.push(endTime - startTime);
            onComplete();
        }
    };

    request.onerror = function (event) {
        console.error('Error reading tasks:', event.target.error);
    };
}

// Step 4: Apply read-only flag to transaction and measure time to read completed tasks
function readCompletedTasksReadOnly(db, storeName, onComplete) {
    let transaction = db.transaction(storeName, 'readonly');
    let store = transaction.objectStore(storeName);
    let request = store.openCursor();
    let completedTasks = 0;
    let startTime = performance.now();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === 'completed') {
                completedTasks++;
            }
            cursor.continue();
        } else {
            let endTime = performance.now();
            console.log((Read-only) Read ${completedTasks} completed tasks in ${(endTime - startTime).toFixed(2)} ms.);
            performanceMetrics.completedReadTimes.push(completedTasks);
            performanceMetrics.readOnlyTimes.push(endTime - startTime);
            onComplete();
        }
    };

    request.onerror = function (event) {
        console.error('Error reading tasks (read-only):', event.target.error);
    };
}

// Step 5: Use the status index to read completed tasks and measure time
function readCompletedTasksWithIndex(db, storeName, onComplete) {
    let transaction = db.transaction(storeName, 'readonly');
    let store = transaction.objectStore(storeName);
    let index = store.index('statusIndex');
    let request = index.openCursor(IDBKeyRange.only('completed'));
    let completedTasks = 0;
    let startTime = performance.now();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            completedTasks++;
            cursor.continue();
        } else {
            let endTime = performance.now();
            console.log((Using index) Read ${completedTasks} completed tasks in ${(endTime - startTime).toFixed(2)} ms.);
            performanceMetrics.completedTasks.push(completedTasks);
            performanceMetrics.indexedReadTimes.push(endTime - startTime);
            onComplete();
        }
    };

    request.onerror = function (event) {
        console.error('Error reading tasks (index):', event.target.error);
    };
}

// Step 6: Copy completed tasks to TodoListCompleted store and measure read time
function copyCompletedTasks(db, fromStore, toStore, onComplete) {
    let transaction = db.transaction([fromStore, toStore], 'readwrite');
    let fromObjStore = transaction.objectStore(fromStore);
    let toObjStore = transaction.objectStore(toStore);
    let request = fromObjStore.openCursor();
    let copiedTasks = 0;

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === 'completed') {
                toObjStore.add(cursor.value);
                copiedTasks++;
            }
            cursor.continue();
        } else {
            console.log(Copied ${copiedTasks} tasks to 'TodoListCompleted'.);
            performanceMetrics.copiedTasks.push(copiedTasks);
            onComplete();
        }
    };

    request.onerror = function (event) {
        console.error('Error copying tasks:', event.target.error);
    };
}

// Step 7: Draw the chart using Chart.js
function drawChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line', // Line chart
        data: {
            labels: ['Total Tasks', 'Completed Read', 'Read-Only', 'Indexed Read', 'Copied Tasks'],
            datasets: [
                {
                    label: 'Completed Tasks',
                    data: performanceMetrics.completedTasks, // Data for completed tasks
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                },
                {
                    label: 'Read Times (ms)',
                    data: performanceMetrics.readTimes, // Data for read times
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                },
                {
                    label: 'Read-Only Times (ms)',
                    data: performanceMetrics.readOnlyTimes, // Data for read-only read times
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    fill: false,
                },
                {
                    label: 'Indexed Read Times (ms)',
                    data: performanceMetrics.indexedReadTimes, // Data for indexed read times
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: false,
                },
                {
                    label: 'Copied Tasks',
                    data: performanceMetrics.copiedTasks, // Data for copied tasks
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Step 8: Run the full test with all steps
setupDatabase('TodoDB', 'TodoList', function (db) {
    addTasks(db, 'TodoList', function () {
        readCompletedTasks(db, 'TodoList', function () {
            readCompletedTasksReadOnly(db, 'TodoList', function () {
                readCompletedTasksWithIndex(db, 'TodoList', function () {
                    copyCompletedTasks(db, 'TodoList', 'TodoListCompleted', function () {
                        console.log("Project tasks completed successfully.");
                        console.table(performanceMetrics); // Display performance metrics in table format
                        drawChart(); // Draw the chart after all tasks are completed
                    });
                });
            });
        });
    });
});
