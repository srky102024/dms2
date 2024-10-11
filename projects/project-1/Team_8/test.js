// Setup IndexedDB without recreating it on rerun
function setupIndexedDB(dbName, storeName, callback) {
    let request = indexedDB.open(dbName, 2);

    request.onupgradeneeded = function (event) {
        let db = event.target.result;

        // Create object store and index if they don't already exist
        if (!db.objectStoreNames.contains(storeName)) {
            let objectStore = db.createObjectStore(storeName, { keyPath: "id" });
            objectStore.createIndex("task", "task", { unique: false });
            objectStore.createIndex("status", "status", { unique: false });
            objectStore.createIndex("dueDate", "dueDate", { unique: false });
        }
        if (!db.objectStoreNames.contains("TodoListCompleted")) {
            const copyStore = db.createObjectStore("TodoListCompleted", { keyPath: "id", autoIncrement:false});
            copyStore.createIndex("task",  "task", { unique: false });
            copyStore.createIndex("status",  "status", { unique: false });
            copyStore.createIndex("dueDate",   "dueDate", { unique: false });
        }
    };

    request.onsuccess = function (event) {
        let db = event.target.result;
        callback(db);
    };

    request.onerror = function (event) {
        console.error("Error opening IndexedDB:", event);
    };
}

function generateRandomDueDate() {
  return new Date(
        new Date().getTime() + Math.random() * 10000000000
).toISOString().split("T")[0];
}
// Function to add 100k objects only if they don't already exist
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
                let object = { id: i, task: `Task_${i}`, status: Math.random()<0.5 ? 'inprogress' : 'completed', dueDate: generateRandomDueDate()};
                writeObjectStore.add(object);
            }

            writeTransaction.oncomplete = function () {
                console.log("100k objects added.");
                callback();
            };

            writeTransaction.onerror = function (event) {
                console.error("Error adding objects:", event);
            };
        } else {
            console.log("Objects already exist, skipping insertion.");
            callback();
        }
    };

    countRequest.onerror = function (event) {
        console.error("Error counting objects:", event);
    };
}
function updateThousand(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readwrite");
    let objectStore = transaction.objectStore(storeName);

    objectStore.getAll().onsuccess = function(event) {
        let tasks = event.target.result;
        let updatedTasks = tasks.map((task, index) => {
            task.status = index < 1000 ? 'completed' : 'progress';
            return task;
        });
        updatedTasks.forEach(task => objectStore.put(task));
        console.log(`Updated tasks`);
        callback(db);
    };

    objectStore.getAll().onerror = function(event) {
        console.error("Error updating tasks:", event);
    };
}
// Function readAll: Reading 100k object names
function readAll(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readwrite");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            callback(count);
        }
    };
}

// Function readIndex: Reading 100k object names using an index
function readIndex(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let index = objectStore.index("status");
    let count = 0;

    let request = index.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            callback(count);
        }
    };
}

// Function readOnly: Reading 100k objects with readonly transaction
function readOnly(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if(cursor.value.status==='completed'){
                count++;
            }
            cursor.continue();
        } else {
            callback(count);
        }
    };
}

function transferCompletedRecords(db, fromStore, toStore, callback) {
    // Initiate a transaction involving both the source and target object stores
    const transaction = db.transaction([fromStore, toStore], "readwrite");
    const source = transaction.objectStore(fromStore);
    const target = transaction.objectStore(toStore);

    // Open a cursor on the "status" index to find records marked as 'completed'
    const statusIndex = source.index("status");
    const cursorRequest = statusIndex.openCursor(IDBKeyRange.only('completed'));

    cursorRequest.onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            const dataRecord = cursor.value;

            // Attempt to insert the current record into the target store
            const insertRequest = target.add(dataRecord);
            insertRequest.onsuccess = function () {
                // Move to the next record in the cursor
                cursor.continue();
            };
            insertRequest.onerror = function (errorEvent) {
                console.error("Failed to insert into target store:", errorEvent.target.errorCode);
            };
        } else {
            console.log(`Successfully transferred all 'completed' records from ${fromStore} to ${toStore}.`);
            callback(db);
        }
    };
}
// Function to measure performance of each operation
function measurePerformance() {
    const dbName = "TodoDb";
    const storeName = "TodoList";
    setupIndexedDB(dbName, storeName, function (db) {
        add100kObjects(db, storeName, function () {
            const performanceResults = [];
            let start = performance.now();
            updateThousand(db, storeName, function(){
                let end = performance.now();
                performanceResults.push({
                    Operation: "update (update 1000 objects)",
                    TimeTakenMs: (end - start).toFixed(2)
                });
                // Measure performance of readAll
                start = performance.now();
                readAll(db, storeName, function (count) {
                    let end = performance.now();
                    performanceResults.push({
                        Operation: "readAll (Read 100k objects)",
                        TimeTakenMs: (end - start).toFixed(2)
                    });

                    // Measure performance of readIndex
                    start = performance.now();
                    readIndex(db, storeName, function (count) {
                        end = performance.now();
                        performanceResults.push({
                            Operation: "readIndex (Index read 100k objects)",
                            TimeTakenMs: (end - start).toFixed(2)
                        });

                        // Measure performance of readOnly
                        start = performance.now();
                        readOnly(db, storeName, function (count) {
                            end = performance.now();
                            performanceResults.push({
                                Operation: "readOnly (Readonly read 100k objects)",
                                TimeTakenMs: (end - start).toFixed(2)
                            });
                                start = performance.now();
                            transferCompletedRecords(db, storeName, 'TodoListCompleted',function(){
                                end = performance.now();
                                performanceResults.push({
                                    Operation: "copyRecords",
                                    TimeTakenMs: (end - start).toFixed(2)
                                });
                                readAll(db, 'TodoListCompleted', function (count) {
                                    let end = performance.now();
                                    performanceResults.push({
                                        Operation: "readAll (Read 1000 objects)",
                                        TimeTakenMs: (end - start).toFixed(2)
                                    });

                                    // Display results in table format
                                    console.table(performanceResults);
                                });
                            });
                        });
                    });
                });
            });

        });
    });
}

// Call the function to measure and display performance
measurePerformance();
