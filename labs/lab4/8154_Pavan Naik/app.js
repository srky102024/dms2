const newDbName = 'DashboardToDoDB';  // New Database name
const newDbVersion = 1;

// Function to initialize the new IndexedDB with fresh data
function initializeNewIndexedDB() {
    const request = indexedDB.open(newDbName, newDbVersion);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('todoList', { keyPath: 'uuid' });

        // Add 1,000 items to the new IndexedDB
        for (let i = 0; i < 1000; i++) {
            const uuid = `uuid-${i}`;
            const taskData = {
                uuid: uuid,
                task: `Task ${i + 1}`,
                status: i % 2 === 0 ? 'complete' : 'incomplete',
                createdAt: new Date().toISOString(),
            };
            objectStore.add(taskData);
        }
        console.log('1,000 to-do items added to the new IndexedDB');
    };

    request.onsuccess = function(event) {
        console.log(`New database '${newDbName}' initialized successfully.`);
        getNewToDoDataFromIndexedDB();  // Fetch data and update the dashboard
    };

    request.onerror = function(event) {
        console.error('Error initializing new IndexedDB:', event.target.errorCode);
    };
}

// Function to retrieve data from the new IndexedDB and ensure ordered display
function getNewToDoDataFromIndexedDB() {
    const request = indexedDB.open(newDbName, newDbVersion);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('todoList', 'readonly');
        const store = transaction.objectStore('todoList');

        const toDoItems = [];
        store.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                toDoItems.push(cursor.value);
                cursor.continue();
            } else {
                // Once all data is fetched, sort and update the dashboard
                toDoItems.sort((a, b) => parseInt(a.uuid.split('-')[1]) - parseInt(b.uuid.split('-')[1]));
                updateDashboardWithNewData(toDoItems);
            }
        };
    };

    request.onerror = function(event) {
        console.error('Error retrieving data from new IndexedDB:', event.target.errorCode);
    };
}

// Function to update the dashboard stats and bar chart with data from the new IndexedDB
function updateDashboardWithNewData(toDoItems) {
    const totalTasks = toDoItems.length;
    const completedTasks = toDoItems.filter(item => item.status === 'complete').length;
    const incompleteTasks = totalTasks - completedTasks;

    // Update the stats in the dashboard
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('incomplete-tasks').textContent = incompleteTasks;

    // Update the bar chart
    const ctx = document.getElementById('myBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Completed Tasks', 'Pending Tasks'],
            datasets: [{
                label: 'Tasks Status',
                data: [completedTasks, incompleteTasks],
                backgroundColor: ['#27ae60', '#e74c3c'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display : false,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Task Completion Status'
                }
            }
        }
    });

    // Populate the to-do list items in the dashboard
    const todoList = document.getElementById('todo-items');
    toDoItems.forEach(item => {
        const li = document.createElement('li');
        li.classList.add(item.status === 'complete' ? 'complete' : 'incomplete');
        li.innerHTML = `<span>${item.task}</span> <span>${item.status === 'complete' ? 'Complete' : 'Pending'}</span>`;
        todoList.appendChild(li);
    });
}

// Initialize the new database and populate the dashboard on page load
window.onload = function() {
    initializeNewIndexedDB();
};
