// IndexedDB Setup
const dbName = 'IndexedDB_App';
const dbVersion = 1;
let db;

// Open IndexedDB and create object store
function openDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function(event) {
        console.error("Database error: ", event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Database opened successfully.");
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('objectsStore', { keyPath: 'uuid' });
        objectStore.createIndex('uuid', 'uuid', { unique: true });
        console.log("Object store created.");
    };
}

// Generate a single object
function generateObject() {
    return {
        uuid: crypto.randomUUID(),
        source_database: 'IndexedDB',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Additional attributes
        price: (Math.random() * 100).toFixed(2),  // Random price value
        stock_quantity: Math.floor(Math.random() * 100),  // Random stock quantity
        category: ['Electronics', 'Books', 'Clothing'][Math.floor(Math.random() * 3)]  // Random category
    };
}

// Generate and store 1000 objects in IndexedDB
function storeData() {
    openDB();

    const transaction = db.transaction(['objectsStore'], 'readwrite');
    const objectStore = transaction.objectStore('objectsStore');

    for (let i = 0; i < 1000; i++) {
        const newObject = generateObject();
        const request = objectStore.add(newObject);

        request.onsuccess = function() {
            console.log("Object added: ", newObject);
        };

        request.onerror = function(event) {
            console.error("Error adding object: ", event.target.error);
        };
    }

    transaction.oncomplete = function() {
        console.log("All 1000 objects added successfully.");
        alert("1000 Objects stored in IndexedDB.");
    };
}
