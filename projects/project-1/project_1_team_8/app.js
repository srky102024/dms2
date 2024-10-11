const dbName = "TodoDatabase";
const todoStore = "TodoList";
const completedStore = "TodoListCompleted";

let db;
let performanceData = [];

function setupIndexedDB(callback) {
    let request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains(todoStore)) {
            let objectStore = db.createObjectStore(todoStore, { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("status", "status", { unique: false });
        }
        if (!db.objectStoreNames.contains(completedStore)) {
            db.createObjectStore(completedStore, { keyPath: "id", autoIncrement: true });
        }
        updateStatus("Database initialized and object stores created.");
    };
    request.onsuccess = function (event) {
        db = event.target.result;
        if (callback) callback();
    };
    request.onerror = function (event) {
        updateStatus("Error opening IndexedDB: " + event.target.error);
    };
}

function populateTodoList() {
    let transaction = db.transaction([todoStore], "readonly");
    let objectStore = transaction.objectStore(todoStore);
    let countRequest = objectStore.count();
    countRequest.onsuccess = function () {
        if (countRequest.result === 0) {
            let writeTransaction = db.transaction([todoStore], "readwrite");
            let writeObjectStore = writeTransaction.objectStore(todoStore);
            for (let i = 0; i < 100000; i++) {
                let status = i < 1000 ? "completed" : "in progress";
                let taskObj = {
                    task: `Task ${i + 1}`,
                    status: status,
                    dueDate: new Date(2024, Math.floor(i / 3333), (i % 31) + 1).toISOString()
                };
                writeObjectStore.add(taskObj);
            }
            writeTransaction.oncomplete = function () {
                updateStatus("100,000 tasks successfully added.");
            };
            writeTransaction.onerror = function (event) {
                updateStatus("Error adding tasks: " + event.target.error);
            };
        } else {
            updateStatus("Tasks already exist, skipping insertion.");
        }
    };
    countRequest.onerror = function (event) {
        updateStatus("Error counting tasks: " + event.target.error);
    };
}

function readObjects(useIndex, readOnly = false) {
    let mode = readOnly ? "readonly" : "readwrite";
    let transaction = db.transaction([todoStore], mode);
    let objectStore = transaction.objectStore(todoStore);
    let request = useIndex ? objectStore.index("status").openCursor(IDBKeyRange.only("completed")) : objectStore.openCursor();
    let count = 0;
    let start = performance.now();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            let stop = performance.now();
            let timeTaken = stop - start;
            performanceData.push({ task: `Read ${useIndex ? 'Using Index' : 'All'} ${readOnly ? 'ReadOnly' : ''}`, timeTaken });
            updateStatus(`Read complete: ${count} tasks. Time: ${timeTaken} ms.`);
        }
    };

    transaction.onerror = function (event) {
        updateStatus("Error reading tasks: " + event.target.error);
    };
}

function copyCompletedTasksToNewStore() {
    let transaction = db.transaction([todoStore, completedStore], 'readwrite');
    let sourceObjectStore = transaction.objectStore(todoStore);
    let targetObjectStore = transaction.objectStore(completedStore);
    let count = 0;
    let start = performance.now();
    let request = sourceObjectStore.index("status").openCursor(IDBKeyRange.only("completed"));

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let addRequest = targetObjectStore.add(cursor.value);
            addRequest.onsuccess = function () {
                count++;
                cursor.continue();
            };
            addRequest.onerror = function (err) {
                console.error("Error copying task to new store:", err.target.error);
                cursor.continue();
            };
        } else {
            let end = performance.now();
            let timeTaken = end - start;
            performanceData.push({ task: 'Copy to New Store', timeTaken });
            updateStatus(`${count} completed tasks successfully copied to new store in ${timeTaken.toFixed(2)} ms.`);
        }
    };

    request.onerror = function (event) {
        updateStatus("Error copying tasks: " + event.target.error);
    };
}

function readCompletedTasksFromNewStore() {
    let transaction = db.transaction([completedStore], 'readonly');
    let objectStore = transaction.objectStore(completedStore);
    let request = objectStore.openCursor();
    let count = 0;
    let start = performance.now();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            count++;
            cursor.continue();
        } else {
            let end = performance.now();
            let timeTaken = end - start;
            performanceData.push({ task: 'Read from New Store', timeTaken });
            updateStatus(`Read ${count} tasks from new completed tasks store. Time: ${timeTaken.toFixed(2)} ms.`);
        }
    };

    request.onerror = function (event) {
        updateStatus("Error reading from new completed tasks store: " + event.target.error);
    };
}

function drawChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const labels = performanceData.map(data => data.task);
    const times = performanceData.map(data => data.timeTaken);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Time (ms) per Operation',
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgb(75, 192, 192)',
            data: times,
            fill: false
        }]
    };
    const config = {
        type: 'line',
        data: data,
        options: {}
    };
    new Chart(ctx, config);
}

function updateStatus(message) {
    const statusElement = document.getElementById("results");
    statusElement.innerHTML += `<p>${message}</p>`;
}

document.addEventListener("DOMContentLoaded", function() {
    setupIndexedDB();
});
