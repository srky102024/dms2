// Setup IndexedDB without recreating it on rerun
function setupIndexedDB(dbName, storeName, storeNameCompleted, callback) {
    let request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
        let db = event.target.result;

        // Create object stores if they don't already exist
        if (!db.objectStoreNames.contains(storeName)) {
            let objectStore = db.createObjectStore(storeName, { keyPath: "id" });
            objectStore.createIndex("status", "status", { unique: false });
        }

        if (!db.objectStoreNames.contains(storeNameCompleted)) {
            db.createObjectStore(storeNameCompleted, { keyPath: "id" });
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

// Function to add 100k objects with random tasks and statuses
function add100kObjects(db, storeName, callback) {
    let transaction = db.transaction(storeName, "readwrite");
    let objectStore = transaction.objectStore(storeName);

    for (let i = 0; i < 100000; i++) {
        let object = {
            id: i,
            task: `Task_${i}`,
            status: (i < 1000) ? "completed" : "in progress",  // First 1000 completed, others in progress
            dueDate: new Date(Date.now() + Math.floor(Math.random() * 10000000000)).toISOString()  // Random future date
        };
        objectStore.add(object);
    }

    transaction.oncomplete = function () {
        console.log("100k objects added.");
        callback();
    };

    transaction.onerror = function (event) {
        console.error("Error adding objects:", event);
    };
}

// Function f1: Reading completed tasks
function f1(db, storeName, performanceResults, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let start = performance.now();
    let request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                count++;
            }
            cursor.continue();
        } else {
            let end = performance.now();
            performanceResults.push({
                Operation: "Read completed tasks (f1)",
                TimeTakenMs: (end - start).toFixed(2),
                TotalCompleted: count
            });
            callback(count);
        }
    };
}

// Function f2: Reading completed tasks using an index
function f2(db, storeName, performanceResults, callback) {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let index = objectStore.index("status");
    let count = 0;

    let start = performance.now();
    let request = index.openCursor(IDBKeyRange.only("completed"));

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            let end = performance.now();
            performanceResults.push({
                Operation: "Read completed tasks using index (f2)",
                TimeTakenMs: (end - start).toFixed(2),
                TotalCompleted: count
            });
            callback(count);
        }
    };
}

// Function f3: Reading completed tasks from the completed store
function f3(db, storeNameCompleted, performanceResults, callback) {
    let transaction = db.transaction(storeNameCompleted, "readonly");
    let objectStore = transaction.objectStore(storeNameCompleted);
    let count = 0;

    let start = performance.now();
    let request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                count++;
            }
            cursor.continue();
        } else {
            let end = performance.now();
            performanceResults.push({
                Operation: "Read completed tasks from completed store (f3)",
                TimeTakenMs: (end - start).toFixed(2),
                TotalCompleted: count
            });
            callback(count);
        }
    };
}

// Function to copy completed tasks to a new object store
function copyCompletedTasks(db, storeNameCompleted, performanceResults, callback) {
    let transaction = db.transaction("TodoList", "readonly");
    let objectStore = transaction.objectStore("TodoList");
    let count = 0;

    let start = performance.now();
    let request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                // Create a new transaction for adding to the completed store
                let completedTransaction = db.transaction(storeNameCompleted, "readwrite");
                let completedObjectStore = completedTransaction.objectStore(storeNameCompleted);
                completedObjectStore.add(cursor.value);
                count++;
            }
            cursor.continue();
        } else {
            let end = performance.now();
            performanceResults.push({
                Operation: "Copy completed tasks to new store",
                TimeTakenMs: (end - start).toFixed(2),
                TotalCopied: count
            });
            callback(count);
        }
    };
}

// Measure performance of each operation
function measurePerformance() {
    const dbName = "TestDB";
    const storeName = "TodoList";
    const storeNameCompleted = "TodoListCompleted";
    const performanceResults = [];

    setupIndexedDB(dbName, storeName, storeNameCompleted, function (db) {
        add100kObjects(db, storeName, function () {
            // Measure performance of f1
            f1(db, storeName, performanceResults, function (countF1) {
                // Measure performance of f2
                f2(db, storeName, performanceResults, function (countF2) {
                    // Measure performance of copying completed tasks
                    copyCompletedTasks(db, storeNameCompleted, performanceResults, function (countF3) {
                        // Measure performance of reading from the new store
                        f3(db, storeNameCompleted, performanceResults, function (countF3Read) {
                            console.table(performanceResults); // Display performance results in table format
                        });
                    });
                });
            });
        });
    });
}

// Call the function to measure and display performance
measurePerformance();
