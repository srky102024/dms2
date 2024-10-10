let db;
function getRandomDueDate() {
    const today = new Date();
    const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    return new Date(today.getTime() + Math.random() * (oneYearFromNow.getTime() - today.getTime()));
}

function setupIndexedDB(dbName, storeName, targetStoreName, callback) {
    const request = indexedDB.open(dbName, 2);
    request.onupgradeneeded = (event) =>{
        db = event.target.result;

        if (!db.objectStoreNames.contains(storeName)) {
            const objectStore = db.createObjectStore(storeName, { keyPath: "id", autoIncrement:false});
            objectStore.createIndex("task",  "task", { unique: false });
            objectStore.createIndex("status",  "status", { unique: false });
            objectStore.createIndex("dueDate",   "dueDate", { unique: false });
        }
        if (!db.objectStoreNames.contains(targetStoreName)) {
            const copyStore = db.createObjectStore(targetStoreName, { keyPath: "id", autoIncrement:false});
            copyStore.createIndex("task",  "task", { unique: false });
            copyStore.createIndex("status",  "status", { unique: false });
            copyStore.createIndex("dueDate",   "dueDate", { unique: false });
        }

    };
    
    request.onsuccess = function (event) {
        db = event.target.result;
        callback(db);
    };

    request.onerror = function (event) {
        console.error("Error opening IndexedDB:", event);
    };
}

function displayData(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readwrite");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            callback(db);
        }
    };
}

function displayDataIndex(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let index = objectStore.index("status");
        let count = 0;

        let request = index.openCursor(IDBKeyRange.only('completed'));
        request.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                count++;
                cursor.continue();
            } else {
                callback(db);
            }
        };
}

function displayDataRead(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
            if (cursor) {if (cursor.value.status === 'completed') {
                count++;
            }
            cursor.continue();
        } else {
            callback(db);
        }
    };
}


function add100kObjects(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let countRequest = objectStore.count();

    countRequest.onsuccess = function () {
        // Only add objects if the store is empty
        if (countRequest.result === 0) {
            let writeTransaction = db.transaction(storeName, "readwrite");
            let writeObjectStore = writeTransaction.objectStore(storeName);

            for (let i = 0; i < 100000; i++) {
                let object = { id: i, name: `task${i + 1}`, value: 'progress', dueDate: getRandomDueDate() };
                writeObjectStore.add(object);
            }

            writeTransaction.oncomplete = function () {
                console.log("100k objects added.");
                callback(db);
            };

            writeTransaction.onerror = function (event) {
                console.error("Error adding objects:", event);
            };
        } else {
            console.log("Objects already exist, skipping insertion.");
            callback(db);
        }
    };


    transaction.oncomplete = function() {
        console.log('Data added successfully.');
    };
    
    transaction.onerror = function(event) {
        console.error('Error adding data:', event.target.errorCode);
    };
}

function updateFirst1000TasksToCompleted(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readwrite");
    let objectStore = transaction.objectStore(storeName);

    objectStore.getAll().onsuccess = function(event) {
        let tasks = event.target.result;
        let updatedTasks = tasks.map((task, index) => {
            task.status = index < 1000 ? 'completed' : 'progress';
            return task;
        });
        updatedTasks.forEach(task => objectStore.put(task));
        console.log(`Updated tasks: ${updatedTasks.length} total, ${updatedTasks.filter(task => task.status === 'completed').length} completed, ${updatedTasks.filter(task => task.status === 'progress').length} in progress.`);
        callback(db);
    };

    objectStore.getAll().onerror = function(event) {
        console.error("Error updating tasks:", event);
    };
}
function displayPerformanceGraph(performanceResults) {
    const labels = performanceResults.map(result => result.Operation);
    const data = performanceResults.map(result => parseFloat(result.TimeTakenMs));

    const ctx = document.getElementById('performanceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Taken (ms)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                y: {
                    type: 'logarithmic',
                    ticks: {
                        callback: function(value) {
                            // Show values as powers of 10
                            if (value === 10 || value === 100 || value === 1000) {
                                return value;
                            }
                            return ''; // Hide intermediate ticks
                        },
                    },
                    min: 1, // Optional minimum value (logarithmic scale can't start from 0)
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
}

function copyStore(db, sourceStoreName, targetStoreName, callback) {
    // Open a single transaction for both source and target stores
    let transaction = db.transaction([sourceStoreName, targetStoreName], "readwrite");
    let sourceStore = transaction.objectStore(sourceStoreName);
    let targetStore = transaction.objectStore(targetStoreName);

    let index = sourceStore.index("status");
    let completedCursor = index.openCursor(IDBKeyRange.only('completed'));

    completedCursor.onsuccess = function (event) {
        let cursor = event.target.result;

        if (cursor) {
            let record = cursor.value;

            // Add the record to the target store
            let addRequest = targetStore.add(record);
            addRequest.onsuccess = function () {
                // Continue to the next cursor
                cursor.continue();
            };
            addRequest.onerror = function (event) {
                console.error("Error adding record to target store:", event.target.errorCode);
            };
        } else {
            console.log(`All completed records copied from ${sourceStoreName} to ${targetStoreName}`);
            callback(db);
        }
    };

    completedCursor.onerror = function (event) {
        console.error("Cursor error:", event.target.errorCode);
        callback(db);
    };

    // Ensure the transaction completes successfully
    transaction.oncomplete = function () {
        console.log("Transaction completed successfully.");
    };
    
    transaction.onerror = function (event) {
        console.error("Transaction error:", event.target.errorCode);
    };
}


function measurePerformance() {
    const dbName = "ToDoListDB";
    const storeName = "ToDoList";
    const targetStoreName = "TodoListCompleted";

    setupIndexedDB(dbName, storeName,targetStoreName, function (db) {
        add100kObjects(db, storeName, function () {
            const performanceResults = [];

            // Measure performance of updating first 1000 tasks
            let startUpdate = performance.now();
            updateFirst1000TasksToCompleted(db, storeName, function () {
                let endUpdate = performance.now();
                performanceResults.push({
                    Operation: "Update 1000 tasks to 'completed'",
                    TimeTakenMs: (endUpdate - startUpdate).toFixed(2)
                });

                // Measure performance of reading 100k objects
                let startReadAll = performance.now();
                displayData(db, storeName, function (db) {
                    let endReadAll = performance.now();
                    performanceResults.push({
                        Operation: "Read 100k objects",
                        TimeTakenMs: (endReadAll - startReadAll).toFixed(2)
                    });

                    // Measure performance of displaying tasks (readonly)
                    let startReadCompleted = performance.now();
                    displayDataRead(db, storeName, function (db) {
                        let endReadCompleted = performance.now();
                        performanceResults.push({
                            Operation: "Display completed tasks (readonly)",
                            TimeTakenMs: (endReadCompleted - startReadCompleted).toFixed(2),
                        });

                        // Measure performance of reading 1000 objects with index status
                        let startIndexRead = performance.now();
                        displayDataIndex(db, storeName, function (db) {
                            let endIndexRead = performance.now();
                            performanceResults.push({
                                Operation: "Index status read (1000 objects)",
                                TimeTakenMs: (endIndexRead - startIndexRead).toFixed(2)
                            });

                            // Measure performance of copying store
                            let startCopy = performance.now();
                            copyStore(db, storeName, targetStoreName, function (db) {
                                let endCopy = performance.now();
                                performanceResults.push({
                                    Operation: "Copy to new index store",
                                    TimeTakenMs: (endCopy - startCopy).toFixed(2)
                                });
    
    
                                // Measure performance of reading 100k objects from copied store
                                let startReadAllCopied = performance.now();
                                displayData(db, targetStoreName, function (db) {
                                    let endReadAllCopied = performance.now();
                                    performanceResults.push({
                                        Operation: "Read 100k objects from copied store",
                                        TimeTakenMs: (endReadAllCopied - startReadAllCopied).toFixed(2)
                                    });
    
    
                                    // Measure performance of displaying completed tasks from copied store (readonly)
                                    let startReadCompletedCopied = performance.now();
                                    displayDataRead(db, targetStoreName, function (db) {
                                        let endReadCompletedCopied = performance.now();
                                        performanceResults.push({
                                            Operation: "Display completed tasks (readonly, copied store)",
                                            TimeTakenMs: (endReadCompletedCopied - startReadCompletedCopied).toFixed(2),
                                        });
    
                                        // Measure performance of reading 1000 objects with index status from copied store
                                        let startIndexReadCopied = performance.now();
                                        displayDataIndex(db, targetStoreName, function (db) {
                                            let endIndexReadCopied = performance.now();
                                            performanceResults.push({
                                                Operation: "Index status read (1000 objects, copied store)",
                                                TimeTakenMs: (endIndexReadCopied - startIndexReadCopied).toFixed(2)
                                            });
                                            console.log(db.version);
                                            
                                            // Display results in table format
                                            console.table(performanceResults);
    
    
                                            // Visualize the performance in a graph
                                            displayPerformanceGraph(performanceResults);
    
                                        });
                                    });
                                });
                            });        
                        });
                    });
                });
            });
        });
    });
}


measurePerformance();
