let db;
let readTimes = []; // Array to store read times for the graph
let chart = null; // Variable to hold the chart instance

// IndexedDB setup
const request = indexedDB.open("TodoListDatabase", 2);

// Ensure buttons are disabled until the database is ready
document.getElementById("task1Button").disabled = true;
document.getElementById("task2Button").disabled = true;
document.getElementById("task3Button").disabled = true;
document.getElementById("task4Button").disabled = true;
document.getElementById("task5Button").disabled = true;

request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Create TodoList store with keyPath 'id'
    if (!db.objectStoreNames.contains('TodoList')) {
        const todoStore = db.createObjectStore("TodoList", { keyPath: "id", autoIncrement: true });
        // Create index on 'status' for Task 4
        todoStore.createIndex("status", "status", { unique: false });
    }

    // Create a new store for Task 5 if it doesn't exist
    if (!db.objectStoreNames.contains('TodoListCompleted')) {
        db.createObjectStore("TodoListCompleted", { keyPath: "id" });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;

    // Enable the first task button when the database is ready
    document.getElementById("task1Button").disabled = false;
};

request.onerror = function (event) {
    console.error("Database error: " + event.target.errorCode);
};

// Task 1: Populate the Object Store with 100,000 tasks
document.getElementById("task1Button").addEventListener("click", function () {
    populateDatabase().then(() => {
        console.log("Task 1 completed: Object Store populated with 100,000 tasks.");
        document.getElementById("task2Button").disabled = false;
    });
    this.disabled = true;
});

// Task 2: Measure and Read All Completed Tasks
document.getElementById("task2Button").addEventListener("click", function () {
    readCompletedTasks().then((timeTaken) => {
        console.log(`Task 2 completed: Read completed tasks in ${timeTaken} ms.`);
        addTimeToGraph(timeTaken);
        document.getElementById("task3Button").disabled = false;
    });
    this.disabled = true;
});

// Task 3: Apply Read-Only Mode and Measure Time
document.getElementById("task3Button").addEventListener("click", function () {
    readCompletedTasksReadOnly().then((timeTaken) => {
        console.log(`Task 3 completed: Read completed tasks (readonly) in ${timeTaken} ms.`);
        addTimeToGraph(timeTaken);
        document.getElementById("task4Button").disabled = false;
    });
    this.disabled = true;
});

// Task 4: Create an Index on `status` and Measure Time
document.getElementById("task4Button").addEventListener("click", function () {
    measureReadWithIndex().then((timeTaken) => {
        console.log(`Task 4 completed: Read completed tasks using index in ${timeTaken} ms.`);
        addTimeToGraph(timeTaken);
        document.getElementById("task5Button").disabled = false;
    });
    this.disabled = true;
});

// Task 5: Copy Completed Tasks to New Store and Measure Time
document.getElementById("task5Button").addEventListener("click", function () {
    copyToNewStore().then((timeTaken) => {
        console.log(`Task 5 completed: Time to read completed tasks from 'TodoListCompleted' is ${timeTaken} ms.`);
        addTimeToGraph(timeTaken);
    });
    this.disabled = true;
});

// Function to populate the database with 100,000 tasks (1,000 completed, rest in progress)
function populateDatabase() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database connection is not ready.");
            return;
        }

        const transaction = db.transaction(["TodoList"], "readwrite");
        const objectStore = transaction.objectStore("TodoList");

        // Populate 100,000 tasks: 1,000 completed, 99,000 in progress
        for (let i = 1; i <= 100000; i++) {
            const task = {
                id: i,
                task: `Task ${i}`,
                status: i <= 1000 ? "completed" : "in progress",
                dueDate: `2024-09-${Math.floor(Math.random() * 30) + 1}`
            };
            objectStore.add(task);
        }

        transaction.oncomplete = function () {
            resolve();
        };

        transaction.onerror = function () {
            reject("Transaction failed");
        };
    });
}

// Task 2: Read all completed tasks and measure time
function readCompletedTasks() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database connection is not ready.");
            return;
        }

        const transaction = db.transaction(["TodoList"], "readonly");
        const objectStore = transaction.objectStore("TodoList");

        const startTime = performance.now();
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            const tasks = event.target.result.filter(task => task.status === "completed");
            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            resolve(timeTaken);
        };

        request.onerror = function () {
            reject("Failed to read completed tasks");
        };
    });
}

// Task 3: Read completed tasks in read-only mode
function readCompletedTasksReadOnly() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database connection is not ready.");
            return;
        }

        const transaction = db.transaction(["TodoList"], "readonly");
        const objectStore = transaction.objectStore("TodoList");

        const startTime = performance.now();
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            const tasks = event.target.result.filter(task => task.status === "completed");
            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            resolve(timeTaken);
        };

        request.onerror = function () {
            reject("Failed to read completed tasks in read-only mode");
        };
    });
}

// Task 4: Measure reading completed tasks with an index on `status`
function measureReadWithIndex() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database connection is not ready.");
            return;
        }

        const transaction = db.transaction(["TodoList"], "readonly");
        const objectStore = transaction.objectStore("TodoList");
        const index = objectStore.index("status");

        const startTime = performance.now();
        const request = index.getAll("completed");

        request.onsuccess = function (event) {
            const endTime = performance.now();
            const timeTaken = endTime - startTime;
            resolve(timeTaken);
        };

        request.onerror = function () {
            reject("Failed to read tasks using index");
        };
    });
}

// Task 5: Copy completed tasks to 'TodoListCompleted' and measure read time
function copyToNewStore() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject("Database connection is not ready.");
            return;
        }

        const transaction = db.transaction(["TodoList"], "readonly");
        const objectStore = transaction.objectStore("TodoList");
        const index = objectStore.index("status");

        const request = index.getAll("completed");

        request.onsuccess = function (event) {
            const completedTasks = event.target.result;

            const newTransaction = db.transaction(["TodoListCompleted"], "readwrite");
            const newStore = newTransaction.objectStore("TodoListCompleted");

            for (const task of completedTasks) {
                newStore.add(task);
            }

            newTransaction.oncomplete = function () {
                const readTransaction = db.transaction(["TodoListCompleted"], "readonly");
                const newObjectStore = readTransaction.objectStore("TodoListCompleted");

                const startTime = performance.now();
                const readRequest = newObjectStore.getAll();

                readRequest.onsuccess = function () {
                    const endTime = performance.now();
                    const timeTaken = endTime - startTime;
                    resolve(timeTaken);
                };

                readRequest.onerror = function () {
                    reject("Failed to read tasks from 'TodoListCompleted'");
                };
            };

            newTransaction.onerror = function () {
                reject("Error copying tasks to 'TodoListCompleted'");
            };
        };

        request.onerror = function () {
            reject("Error reading tasks from 'TodoList'");
        };
    });
}

// Function to add time to the graph
function addTimeToGraph(time) {
    readTimes.push(time);
    updateGraph();
}

// Function to update the graph with y-axis scale of 1500ms and increments of 100ms
function updateGraph() {
    const ctx = document.getElementById('timeChart').getContext('2d');
    const labels = readTimes.map((_, index) => `Run ${index + 1}`);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Read Time (ms)',
                data: readTimes,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,  // Maintain aspect ratio
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1500,  // Set max to 1500 ms
                    ticks: {
                        stepSize: 100  // Set step size to 100 ms
                    },
                    title: {
                        display: true,
                        text: 'Time (ms)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Runs'
                    }
                }
            }
        }
    });
}
