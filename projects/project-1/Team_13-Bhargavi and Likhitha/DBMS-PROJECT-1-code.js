let db;
let request = indexedDB.open("TodoDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    let objectStore = db.createObjectStore("TodoList", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("status", "status", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database opened successfully!");
    populateTodoList();
};

request.onerror = function (event) {
    console.error("Database error: " + event.target.errorCode);
};

function populateTodoList() {
    let transaction = db.transaction(["TodoList"], "readwrite");
    let objectStore = transaction.objectStore("TodoList");

    for (let i = 0; i < 100000; i++) {
        let status = i < 1000 ? "completed" : "in progress"; 
        let dueDate = new Date(2024, 8, 15 + (i % 30)).toISOString().slice(0, 10);
        objectStore.add({ task: `Task ${i + 1}`, status: status, dueDate: dueDate });
    }

    transaction.oncomplete = function () {
        console.log("TodoList populated!");
        runPerformanceTests();
    };

    transaction.onerror = function (event) {
        console.error("Transaction error: " + event.target.errorCode);
    };
}

function runPerformanceTests() {
    console.log("Running performance tests...");
    measureWithoutOptimization();
}

function measureWithoutOptimization() {
    let transaction = db.transaction(["TodoList"], "readonly");
    let objectStore = transaction.objectStore("TodoList");
    let startTime = performance.now();
    let completedTasks = [];

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                completedTasks.push(cursor.value);
            }
            cursor.continue();
        } else {
            let endTime = performance.now();
            console.log(`Completed tasks: ${completedTasks.length}`); 
            console.log(`Time without optimization: ${(endTime - startTime).toFixed(2)} ms`);

            measureWithReadOnlyFlag();
        }
    };

    request.onerror = function (event) {
        console.error("Cursor error: " + event.target.errorCode);
    };
}

function measureWithReadOnlyFlag() {
    let transaction = db.transaction(["TodoList"], "readonly");
    let objectStore = transaction.objectStore("TodoList");
    let startTime = performance.now();
    let completedTasks = [];

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                completedTasks.push(cursor.value);
            }
            cursor.continue();
        } else {
            let endTime = performance.now();
            console.log(`Completed tasks with read-only flag: ${completedTasks.length}`); 
            console.log(`Time with read-only flag: ${(endTime - startTime).toFixed(2)} ms`);

            measureWithIndex();
        }
    };

    request.onerror = function (event) {
        console.error("Cursor error: " + event.target.errorCode);
    };
}

function measureWithIndex() {
    let transaction = db.transaction(["TodoList"], "readonly");
    let objectStore = transaction.objectStore("TodoList");
    let index = objectStore.index("status");
    let startTime = performance.now();
    let completedTasks = [];

    let request = index.openCursor(IDBKeyRange.only("completed"));
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            completedTasks.push(cursor.value);
            cursor.continue();
        } else {
            let endTime = performance.now();
            console.log(`Completed tasks with indexing: ${completedTasks.length}`); 
            console.log(`Time with indexing: ${(endTime - startTime).toFixed(2)} ms`);

            createCompletedTasksStore();
        }
    };

    request.onerror = function (event) {
        console.error("Cursor error: " + event.target.errorCode);
    };
}


function createCompletedTasksStore() {
    let versionRequest = indexedDB.open("TodoDB", 2);
    versionRequest.onupgradeneeded = function (event) {
        db = event.target.result;

        
        if (!db.objectStoreNames.contains("TodoListCompleted")) {
            let completedStore = db.createObjectStore("TodoListCompleted", { keyPath: "id", autoIncrement: true });
        }
    };

    versionRequest.onsuccess = function (event) {
        db = event.target.result;
        console.log("Completed tasks store created successfully!");
        copyCompletedTasks();
    };

    versionRequest.onerror = function (event) {
        console.error("Version change error: " + event.target.errorCode);
    };
}

function copyCompletedTasks() {
    let transaction = db.transaction(["TodoList", "TodoListCompleted"], "readwrite");
    let todoStore = transaction.objectStore("TodoList");
    let completedStore = transaction.objectStore("TodoListCompleted");

    let request = todoStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            if (cursor.value.status === "completed") {
                completedStore.add(cursor.value);
            }
            cursor.continue();
        } else {
            transaction.oncomplete = function () {
                console.log("Completed tasks copied to dedicated store!");
                runCompletedStoreTest();
            };
        }
    };

    request.onerror = function (event) {
        console.error("Cursor error: " + event.target.errorCode);
    };
}

function runCompletedStoreTest() {
    let transaction = db.transaction(["TodoListCompleted"], "readonly");
    let completedStore = transaction.objectStore("TodoListCompleted");
    let startTime = performance.now();
    let completedTasks = [];

    let request = completedStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            completedTasks.push(cursor.value);
            cursor.continue();
        } else {
            let endTime = performance.now();
            console.log(`Completed tasks from dedicated store: ${completedTasks.length}`); 
            console.log(`Time with dedicated object store: ${(endTime - startTime).toFixed(2)} ms`);
        }
    };

    request.onerror = function (event) {
        console.error("Cursor error: " + event.target.errorCode);
    };
}
