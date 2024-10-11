const dbName = "TodoDB";
const storeName = "TodoList";
const completedStoreName = "TodoListCompleted"; // New store for completed tasks
const openRequest = indexedDB.open(dbName, 2); // Incremented version to trigger onupgradeneeded

openRequest.onupgradeneeded = function (event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore(storeName, { keyPath: "id" });
    objectStore.createIndex("status", "status", { unique: false }); // Re-added index creation

    // Create new object store for completed tasks
    const completedObjectStore = db.createObjectStore(completedStoreName, { keyPath: "id" });
    console.log("Object store and index created");
};

openRequest.onsuccess = function (event) {
    const db = event.target.result;
    console.log("Database opened successfully");
    populateStore(db); // Start populating the store

    // Read completed tasks with read-only flag after all tasks are populated
    db.onversionchange = function () {
        db.close();
        console.log("Database closed due to version change");
    };
};

openRequest.onerror = function (event) {
    console.error("Database error: ", event.target.error);
};

// Function to generate random tasks
function generateRandomTask(id, status) {
    const tasks = [
        "Finish the monthly report",
        "Update website content",
        "Prepare for client presentation",
        "Review team feedback",
        "Organize office meeting",
    ];
    const dueDate = new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    return {
        id: id,
        task: tasks[Math.floor(Math.random() * tasks.length)],
        status: status,  // Status will be passed as an argument
        dueDate: dueDate,
    };
}

// Function to populate the store with 100,000 tasks, 1000 "completed", and the rest "in progress"
function populateStore(db) {
    let completedCount = 0;
    let currentId = 1;

    function addTasksChunk() {
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);

        for (let i = 0; i < 10000 && currentId <= 100000; i++, currentId++) {
            let task;
            if (completedCount < 1000) {
                task = generateRandomTask(currentId, "completed");  // First 1000 tasks set to "completed"
                completedCount++;
            } else {
                task = generateRandomTask(currentId, "in progress"); // Remaining tasks set to "in progress"
            }

            const addRequest = objectStore.add(task);

            addRequest.onerror = function (event) {
                console.error(`Error adding task with ID ${task.id}:`, event.target.error);
            };
        }

        transaction.oncomplete = function () {
            console.log(`Added ${currentId - 1} tasks so far`);

            if (currentId <= 100000) {
                addTasksChunk(); // Continue adding tasks in chunks
            } else {
                console.log("All tasks added successfully");
                readCompletedTasksWithReadOnlyFlag(db); // First read completed tasks with read-only flag
                readCompletedTasksWithIndex(db); // Read completed tasks using index
                copyCompletedTasksToNewStore(db); // Copy completed tasks to new store
            }
        };

        transaction.onerror = function (event) {
            console.error("Transaction error:", event.target.error);
        };
    }

    addTasksChunk(); // Start adding tasks in chunks
}

// Function to copy completed tasks to the new store
function copyCompletedTasksToNewStore(db) {
    const transaction = db.transaction([storeName, completedStoreName], "readwrite");
    const sourceStore = transaction.objectStore(storeName);
    const destinationStore = transaction.objectStore(completedStoreName);

    const startTime = performance.now(); // Start time measurement
    const request = sourceStore.openCursor();

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                const addRequest = destinationStore.add(cursor.value);
                addRequest.onerror = function (event) {
                    console.error(`Error adding completed task with ID ${cursor.value.id}:`, event.target.error);
                };
            }
            cursor.continue();
        } else {
            const endTime = performance.now(); // End time measurement
            console.log("Completed tasks copied to new store successfully");
            console.log("Time taken to copy completed tasks:", endTime - startTime, "ms");

            // Read completed tasks from the new store
            readCompletedTasksFromCompletedStore(db);
        }
    };

    request.onerror = function () {
        console.error("Error reading tasks from source store");
    };
}

// Function to read completed tasks from the new store and measure time taken
function readCompletedTasksFromCompletedStore(db) {
    const transaction = db.transaction(completedStoreName, "readonly");
    const objectStore = transaction.objectStore(completedStoreName);

    const startTime = performance.now(); // Start time measurement

    const completedTasks = [];
    const request = objectStore.openCursor(); // Reading from new store

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            completedTasks.push(cursor.value);
            cursor.continue();
        } else {
            const endTime = performance.now(); // End time measurement
            console.log("Completed tasks read from completed store:", completedTasks.length);
            console.log("Time taken to read completed tasks from new store:", endTime - startTime, "ms");
        }
    };

    request.onerror = function () {
        console.error("Error reading completed tasks from completed store");
    };
}

// Function to read and time reading all completed tasks with read-only flag
function readCompletedTasksWithReadOnlyFlag(db) {
    const transaction = db.transaction(storeName, "readonly");
    const objectStore = transaction.objectStore(storeName);

    const startTime = performance.now(); // Start time measurement

    const completedTasks = [];
    const request = objectStore.openCursor(); // Reading without index

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                completedTasks.push(cursor.value);
            }
            cursor.continue();
        } else {
            const endTime = performance.now(); // End time measurement
            console.log("Completed tasks read:", completedTasks.length);
            console.log("Time taken to read completed tasks with read-only flag:", endTime - startTime, "ms");

            // Repeat the operation to confirm results
            readCompletedTasksWithReadOnlyFlagRepeat(db);
        }
    };

    request.onerror = function () {
        console.error("Error reading completed tasks with read-only flag");
    };
}

// Function to repeat the read operation and measure time again
function readCompletedTasksWithReadOnlyFlagRepeat(db) {
    const transaction = db.transaction(storeName, "readonly");
    const objectStore = transaction.objectStore(storeName);

    const startTime = performance.now(); // Start time measurement

    const completedTasks = [];
    const request = objectStore.openCursor(); // Reading without index

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                completedTasks.push(cursor.value);
            }
            cursor.continue();
        } else {
            const endTime = performance.now(); // End time measurement
            console.log("Repeated read: Completed tasks read:", completedTasks.length);
            console.log("Time taken to read completed tasks with read-only flag (Repeated):", endTime - startTime, "ms");
        }
    };

    request.onerror = function () {
        console.error("Error reading completed tasks with read-only flag");
    };
}

// New function to read completed tasks using the index and measure time taken
function readCompletedTasksWithIndex(db) {
    const transaction = db.transaction(storeName, "readonly");
    const objectStore = transaction.objectStore(storeName);
    const index = objectStore.index("status");

    const startTime = performance.now(); // Start time measurement

    const completedTasks = [];
    const request = index.openCursor(IDBKeyRange.only("completed")); // Reading using index

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            completedTasks.push(cursor.value);
            cursor.continue();
        } else {
            const endTime = performance.now(); // End time measurement
            console.log("Completed tasks read using index:", completedTasks.length);
            console.log("Time taken to read completed tasks using index:", endTime - startTime, "ms");
        }
    };

    request.onerror = function () {
        console.error("Error reading completed tasks using index");
    };
}
