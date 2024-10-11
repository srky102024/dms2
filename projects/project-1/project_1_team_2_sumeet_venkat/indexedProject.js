/**
 * Initializes the IndexedDB database for the project.
 * 
 * This function sets up the IndexedDB with two object stores: 'todo_list' and 'todo_list_completed'.
 * Each object store has an index on the 'status' field.
 * 
 * @param {Function} callback - A callback function that is called with the database instance once the setup is complete.
 * 
 * @example
 * setupIndexedDB(db => {
 *   // Perform operations with the db instance
 * });
 * 
 * @throws Will log an error message if there is an issue opening the IndexedDB.
 */
const setupIndexedDB = callback => {
  let dbRequest = indexedDB.open('project_1', 1)
  console.log('Setting up IndexedDB...')
  dbRequest.onupgradeneeded = event => {
    let db = event.target.result
    if (!db.objectStoreNames.contains('todo_list')) {
      let todo_objectStore = db.createObjectStore('todo_list', {
        keyPath: 'id',
        autoIncrement: true
      })
      todo_objectStore.createIndex('status', 'status', { unique: false })
    }
    if (!db.objectStoreNames.contains('todo_list_completed')) {
      let todo_completed_objectStore = db.createObjectStore(
        'todo_list_completed',
        { keyPath: 'id', autoIncrement: true }
      )
      todo_completed_objectStore.createIndex('status', 'status', {
        unique: false
      })
    } else {
      console.log('Object store already exists')
    }
  }

  dbRequest.onsuccess = event => {
    let db = event.target.result
    console.log('Success opening IndexedDB')
    callback(db)
  }

  dbRequest.onerror = event => {
    console.error('Error opening IndexedDB:', event)
  }
}

/**
 * An array of strings representing various random tasks.
 * 
 * @constant {string[]}
 * @default
 * @example
 * [
 *   'Finish the monthly report',
 *   'Update website content',
 *   'Prepare for client presentation',
 *   'Review team feedback',
 *   'Organize office meeting',
 *   'Complete project plan',
 *   'Prepare for team training',
 *   'Review project budget',
 *   'Update project schedule',
 *   'Prepare for project kickoff'
 * ]
 */
const randomTaskEnum = [
  'Finish the monthly report',
  'Update website content',
  'Prepare for client presentation',
  'Review team feedback',
  'Organize office meeting',
  'Complete project plan',
  'Prepare for team training',
  'Review project budget',
  'Update project schedule',
  'Prepare for project kickoff'
]

/**
 * Enum for task statuses.
 * @enum {string}
 * @readonly
 */
const randomTaskStatueEnum = ['Pending', 'In Progress', 'Completed']

/**
 * Generates a random date between September 15, 2024, and October 20, 2024.
 *
 * @returns {Date} A random date within the specified range.
 */
const generateRandomDate = () => {
  const startDate = new Date('2024-09-15')
  const endDate = new Date('2024-10-20')
  const randomDate = new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  )
  return randomDate
}

/**
 * Generates a randomized task data object.
 *
 * @returns {Object} An object containing a random task, status, and date.
 * @returns {string} return.task - A random task from the randomTaskEnum.
 * @returns {string} return.status - A random status from the randomTaskStatueEnum.
 * @returns {Date} return.date - A randomly generated date.
 */
const CreateRandomizedTaskData = () => {
  const getRandomTask = Math.floor(Math.random() * randomTaskEnum.length)
  const getRandomTaskStatus = Math.floor(
    Math.random() * randomTaskStatueEnum.length
  )
  const getRandomDate = generateRandomDate()
  return {
    task: randomTaskEnum[getRandomTask],
    status: randomTaskStatueEnum[getRandomTaskStatus],
    date: getRandomDate
  }
}

/**
 * Adds 100,000 objects to the 'todo_list' object store in IndexedDB if it is empty.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {Function} callback - The callback function to execute after the operation completes.
 */
const add100kObjects = (db, callback) => {
  console.log('Adding 100k objects to IndexedDB...')
  let transaction = db.transaction('todo_list', 'readonly')
  let objectStore = transaction.objectStore('todo_list')
  let countRequest = objectStore.count()

  countRequest.onsuccess = () => {
    if (countRequest.result === 0) {
      let writeTransaction = db.transaction('todo_list', 'readwrite')
      let writeObjectStore = writeTransaction.objectStore('todo_list')
      for (let i = 0; i < 100000; i++) {
        let task = CreateRandomizedTaskData()

        writeObjectStore.add(task)
      }
      writeTransaction.oncomplete = event => {
        console.log('Transaction complete')
        console.log('Added 100k objects to IndexedDB')
        callback()
      }
      writeTransaction.onerror = event => {
        console.error('Error adding objects to IndexedDB')
      }
    } else {
      callback()
      console.log('Objects already exist in IndexedDB')
        
    }
  }
  transaction.onerror = event => {
    console.error('Transaction error')
  }
}

/**
 * Updates the status of the first 1000 items in the 'todo_list' object store to 'Completed'.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 */
const updateValuesToCompleted = db => {
  let transaction = db.transaction('todo_list', 'readwrite')
  let objectStore = transaction.objectStore('todo_list')

  for (let count = 0; count < 1001; count++) {
    let res = objectStore.get(count)
    res.onsuccess = event => {
      let data = event.target.result
      if (data) {
        data.status = 'Completed'
        objectStore.put(data)
      }
    }
  }
}

/**
 * Updates the status of items in the 'todo_list' object store to 'In Progress'.
 * 
 * This function iterates over a range of IDs (from 1001 to 99999) in the 'todo_list' object store
 * and updates the status of each item to 'In Progress' if the item exists.
 * 
 * @param {IDBDatabase} db - The IndexedDB database instance.
 */
const updateValuesToInProgress = db => {
    let transaction = db.transaction('todo_list', 'readwrite')
  let objectStore = transaction.objectStore('todo_list')

  for (let count = 1001; count < 100000; count++) {
    let res = objectStore.get(count)
    res.onsuccess = event => {
      let data = event.target.result
      if (data) {
        data.status = 'In Progress'
        objectStore.put(data)
      }
    }
  }
}

/**
 * Processes a database transaction on the specified object store and counts the number of records with a value of "Completed".
 * If a record with a value other than "Completed" is encountered, the provided callback function is called.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} storeName - The name of the object store to be accessed.
 * @param {function} callback - The callback function to be executed if a record with a value other than "Completed" is encountered.
 */
const f1 = (db, storeName, callback) => {
    let transaction = db.transaction(storeName, "readwrite");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor.value === "Completed") {
            count++;
            cursor.continue();
        } else {
            callback(db);
        }
    };
}

/**
 * Processes a read-only transaction on the specified object store and counts the entries with a value of "Completed".
 * If an entry does not have the value "Completed", the provided callback is invoked with the database instance.
 *
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} storeName - The name of the object store to be accessed.
 * @param {function} callback - The callback function to be called with the database instance if an entry does not have the value "Completed".
 */
const f2= (db, storeName, callback) => {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let count = 0;

    let request = objectStore.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor.value === "Completed") {
            count++;
            cursor.continue();
        } else {
            callback(db);
        }
    };
}

/**
 * Retrieves the count of entries with the status "Completed" from the specified object store index.
 * 
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} storeName - The name of the object store to query.
 * @param {function} callback - The callback function to execute once the count is retrieved.
 */
const f3 = (db, storeName, callback) => {
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let index = objectStore.index("status");
    let count = 0;

    let request = index.openCursor();
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor.value === "Completed") {
            count++;
            cursor.continue();
        } else {
            callback(db);
        }
    };
}

/**
 * Retrieves all completed tasks from the specified object store in the database.
 * 
 * @param {IDBDatabase} db - The IndexedDB database instance.
 * @param {string} storeName - The name of the object store to query.
 * @returns {Array<Object>} An array of completed task objects.
 */
const getAllCompletedTasks = (db, storeName) => {
    let completedTasks = [];
    let transaction = db.transaction(storeName, "readonly");
    let objectStore = transaction.objectStore(storeName);
    let index = objectStore.index("status");
    let request = index.getAll();
    request.onsuccess = function (event) {
        let result = event.target.result;
        let copy_todo_list_completed = db.transaction("todo_list_completed", "readwrite").objectStore("todo_list_completed");
        for (let i = 0; i < result.length; i++) {
            if (result[i].status === "Completed") {
                copy_todo_list_completed.add(result[i]);
                completedTasks.push(result[i]);
            }
        }
    };
    return completedTasks;
}

/**
 * Displays a performance graph using Chart.js based on the provided performance results.
 *
 * @param {Array<Object>} performanceResults - An array of performance result objects.
 * @param {string} performanceResults[].function - The name of the function whose performance is measured.
 * @param {string} performanceResults[].TimeTakenMs - The time taken by the function in milliseconds.
 */
function displayPerformanceGraph(performanceResults) {
  console.log(performanceResults);
  
  const labels = performanceResults.map(result => result.function);
  console.log(labels);
  
  const data = performanceResults.map(result => parseFloat(result.TimeTakenMs));
  console.log(data);
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
                          if (value == 1 || value == 0 || value === 10 || value === 100 || value === 1000) {
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



/**
 * Measures the performance of various IndexedDB operations and logs the results.
 * 
 * The function performs the following steps:
 * 1. Sets up the IndexedDB and adds 100,000 objects.
 * 2. Updates values to 'Completed' and 'In Progress'.
 * 3. Measures the time taken for various read operations on the 'todo_list' and 'todo_list_completed' object stores.
 * 4. Logs the performance results in a table and displays a performance graph.
 * 
 * The performance measurements include:
 * - Reading completed values.
 * - Reading completed task values (readonly).
 * - Reading completed task values (indexing).
 * - Reading todo_completed values.
 * - Reading todo_completed values (readonly).
 * - Reading todo_completed values (indexing).
 * 
 * @function measurePerformance
 */
const measurePerformance = () => {
  console.time('IndexedDB setup time')
  setupIndexedDB(db => {
    const performanceResults = []
    add100kObjects(db, () => {
      console.log('IndexedDB setup time')
      updateValuesToCompleted(db);
      updateValuesToInProgress(db);
      console.log('Taking performance measurements...');
      
      let start = performance.now()
      f1(db, 'todo_list', (count) => {
        let end = performance.now()
        performanceResults.push({
          function: 'Reading completed values',
          TimeTakenMs: (end - start).toFixed(2)
        })
        
        start = performance.now()
        f2(db, 'todo_list', (count) => {
            let end = performance.now()
            performanceResults.push({
                function: 'Reading completed task values (readonly)',
                TimeTakenMs: (end - start).toFixed(2)
            })
            start = performance.now()
            f3(db, 'todo_list', (count) => {
                let end = performance.now()
                performanceResults.push({
                    function: 'Reading completed task values (indexing)',
                    TimeTakenMs: (end - start).toFixed(2)
                })
                const completedTasksList = getAllCompletedTasks(db, 'todo_list');
                start = performance.now()
                f1(db, 'todo_list_completed', (count) => {
                    let end = performance.now()
                    performanceResults.push({
                        function: 'Reading todo_completed values',
                        TimeTakenMs: (end - start).toFixed(2)
                    })

                    start = performance.now()
                    f2(db, 'todo_list_completed', (count) => {
                        let end = performance.now()
                        performanceResults.push({
                            function: 'Reading todo_completed values (readonly)',
                            TimeTakenMs: (end - start).toFixed(2)
                        })

                        start = performance.now()
                        f3(db, 'todo_list_completed', (count) => {
                            let end = performance.now()
                            performanceResults.push({
                                function: 'Reading todo_completed values (indexing)',
                                TimeTakenMs: (end - start).toFixed(2)
                            })
                            console.table(performanceResults)
                            displayPerformanceGraph(performanceResults);
                        })
                    });
                });
            })
        })
      })
    })
  })
}

measurePerformance()
