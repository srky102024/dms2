/*
COMP 293F - Project 1
What this program does:
Step 0: Set up IndexedDB & Add 100,000 objects in batches of 10,000
Step 1: Set 1,000 objects to status "Completed"
Step 2: Measure the time to read all objects with status set to "Completed"
Step 3: Same as step 2 but with Read-Only flag
Step 4: Same as step 2 but using index on the 'status' field
*/

// STEP 0: SET UP INDEXEDDB
function setupIndexedDB(dbName, itemStoreName, onComplete) {
    let request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function (event) {
        let db = event.target.result;
        
        // Create the main object store if it doesn't exist
        if (!db.objectStoreNames.contains(itemStoreName)) {
            let itemStore = db.createObjectStore(itemStoreName, { keyPath: "id" });
            
            // STEP 4: CREATE AN INDEX ON THE 'STATUS' FIELD
            itemStore.createIndex("statusField", "status", { unique: false });
        }

        // Create the completed tasks object store if it doesn't exist
        if (!db.objectStoreNames.contains("TodoListCompleted")) {
            db.createObjectStore("TodoListCompleted", { keyPath: "id" });
        }
    };

    // If database is opened successfully
    request.onsuccess = function (event) {
        let db = event.target.result;
        console.log("IndexedDB setup successful!");
        onComplete(db);
    };

    // If database fails to open
    request.onerror = function (event) {
        console.error("Error opening IndexedDB:", event.target.error);
    };
}


// STEP 0: ADD 100,000 OBJECTS IN BATCHES OF 10,000
function add100kObjects(db, itemStoreName, onComplete) {
    const batchSize = 10000;
    let currentBatch = 0;

    // Recursive function to add objects
    function addBatch() {
        if (currentBatch >= 100000) {
            onComplete();
            return;
        }
        // Create a new transaction in readwrite mode
        let transaction = db.transaction(itemStoreName, "readwrite");
        let itemStore = transaction.objectStore(itemStoreName);
        // If transaction is successful
        transaction.oncomplete = function () {
            console.log(`Batch ${currentBatch / batchSize + 1} added successfully.`);
            currentBatch += batchSize;
            addBatch();
        };
        // If transaction fails
        transaction.onerror = function (event) {
            console.error("Transaction failed:", event.target.error);
        };

        try {
            // Add a batch
            for (let i = currentBatch; i < currentBatch + batchSize && i < 100000; i++) {
                // STEP 1: Set 1000 objects to status "Completed"
                let status = i < 1000 ? "completed" : "in progress";
                let object = { 
                    id: i,
                    task: `Task_${i}`, 
                    status: status, 
                    dueDate: `2024-09-${(i % 30) + 1}` 
                };
                let addRequest = itemStore.add(object);

                addRequest.onerror = function (event) {
                    console.error(`Error adding object with id ${i}:`, event.target.error); 
                };
            }
        } catch (err) {
            console.error("Unexpected error during object insertion:", err);
        }
    }

    addBatch();
}

// STEP 2: READ ALL COMPLETED TASKS AND MEASURE TIME
function readCompletedTasks(db, itemStoreName, callback, stepName = "Step 2") {
    let transaction = db.transaction(itemStoreName);
    let itemStore = transaction.objectStore(itemStoreName);
    let request = itemStore.openCursor();
    let startTime = performance.now();
    let completedTasks = 0;
    

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                completedTasks++;
            }
            cursor.continue();
        } else {
            let endTime = performance.now();
            let time = (endTime - startTime).toFixed(2);
            console.log(`${stepName}: Read ${completedTasks} completed tasks in ${time} ms.`);
            callback(time);
        }
    };

    request.onerror = function (event) {
        console.error("Error reading completed tasks:", event.target.error);
    };
}

// STEP 3: READ ALL COMPLETED TASKS & MEASURE TIME USING READ-ONLY FLAG
function readCompletedTasksReadOnly(db, itemStoreName, callback) {
    let transaction = db.transaction(itemStoreName, "readonly");
    let itemStore = transaction.objectStore(itemStoreName);
    let request = itemStore.openCursor();
    let startTime = performance.now();
    let completedTasks = 0;

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                completedTasks++;
            }
            cursor.continue();
        } else {
            let endTime = performance.now();
            let time = (endTime - startTime).toFixed(2);
            console.log(`Step 3 (using Read-Only flag): Read ${completedTasks} completed tasks in ${time} ms.`);
            callback(time);
        }
    };

    request.onerror = function (event) {
        console.error("Error reading completed tasks using Read-Only flag:", event.target.error);
    };
}

// STEP 4: READ ALL COMPLETED TASKS AND MEASURE TIME USING THE 'STATUS' INDEX
function readCompletedTasksIndex(db, itemStoreName, callback) {
    let transaction = db.transaction(itemStoreName, "readonly");
    let itemStore = transaction.objectStore(itemStoreName);

    // Open the index on the 'status' field
    let index = itemStore.index("statusField");
    let request = index.openCursor(IDBKeyRange.only("completed")); 
    let startTime = performance.now();
    let completedTasks = 0;

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            completedTasks++;
            cursor.continue();  // Move to the next task
        } else {
            let endTime = performance.now();
            let time = (endTime - startTime).toFixed(2);
            console.log(`Step 4 (using Index): Read ${completedTasks} completed tasks in ${time} ms.`);
            callback(time);  // Pass the time to the callback
        }
    };

    request.onerror = function (event) {
        console.error("Error reading completed tasks using the index:", event.target.error);
    };
}

// STEP 5: COPY COMPLETED TASKS TO "TODOLISTCOMPLETED" AND MEASURE READ TIME
function copyToCompletedStore(db, fromStore, toStore, callback) {
    let transaction = db.transaction([fromStore, toStore], "readwrite");
    let fromItemStore = transaction.objectStore(fromStore);
    let toItemStore = transaction.objectStore(toStore);
    let request = fromItemStore.openCursor();
    let startTime = performance.now();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                toItemStore.add(cursor.value);
            }
            cursor.continue();
        } else {
            let endTime = performance.now();
            readCompletedTasks(db, toStore, function (readTime) {
                console.log(`Step 5: Read completed tasks from ${toStore} in ${readTime} ms.`);
                callback(readTime);
            }, "Step 5");
        }
    };

    request.onerror = function (event) {
        console.error("Error copying tasks to completed store:", event.target.error);
    };
}

// Call the functions to set up the DB and read completed tasks
setupIndexedDB("TodoDB", "TodoList", function (db) {
    add100kObjects(db, "TodoList", function () {
        
        // STEP 2: READ WITHOUT FLAG
         readCompletedTasks(db, "TodoList", function (time) {
            console.log(`Time to read in Step 2: ${time} ms`);

            // STEP 3: READ WITH READ-ONLY FLAG
            readCompletedTasksReadOnly(db, "TodoList", function (timeReadonly) {
                console.log(`Time to read in Step 3: ${timeReadonly} ms`);

                // STEP 4: READ USING 'STATUS' INDEX
                readCompletedTasksIndex(db, "TodoList", function (timeIndex) {
                    console.log(`Time to read in Step 4: ${timeIndex} ms`);
                });
                // STEP 5: READ FROM "TODOLISTCOMPLETED"
                copyToCompletedStore(db, "TodoList", "TodoListCompleted", function (readTime) {
                    readCompletedTasks(db, "TodoListCompleted", function (timeCompleted) {
                        console.log(`Time to read in Step 5: ${timeCompleted} ms`);
                    }, "Step 5");
                }, "Step 5");
           });
        })  
    });
});