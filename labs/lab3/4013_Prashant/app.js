// Open or create IndexedDB
const dbName = 'ObjectStoreDB';
const storeName = 'objects';
let db;

function openDatabase() {
    const request = indexedDB.open(dbName, 1);

    request.onerror = (event) => {
        console.error('Database error:', event.target.errorCode);
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log('Database opened successfully');
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;

        // Create an object store if it doesn't already exist
        if (!db.objectStoreNames.contains(storeName)) {
            const objectStore = db.createObjectStore(storeName, { keyPath: 'uuid' });
            objectStore.createIndex('source', 'source', { unique: false });
            objectStore.createIndex('created_at', 'created_at', { unique: false });
            objectStore.createIndex('updated_at', 'updated_at', { unique: false });
            console.log('Object store and indexes created');
        }
    };
}

// Generate 1000 objects with attributes and store them in IndexedDB
function generateObjects() {
    if (!db) {
        console.error('Database is not open yet. Please try again later.');
        return;
    }

    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);

    transaction.oncomplete = () => {
        console.log('All objects added successfully');
        document.getElementById('status').innerText = '1000 objects generated and stored successfully!';
    };

    transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.errorCode);
    };

    for (let i = 0; i < 1000; i++) {
        const uuid = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const object = {
            uuid: uuid,
            source: 'IndexedDB',
            created_at: timestamp,
            updated_at: timestamp,
            attribute1: 'value1',
            attribute2: 'value2',
            attribute3: 'value3'
        };

        // Log the object being added
        console.log(`Adding object ${i + 1}:`, object);

        const request = objectStore.add(object);
        request.onsuccess = () => {
            console.log(`Object ${i + 1} added successfully`);
        };
        request.onerror = (event) => {
            console.error(`Error adding object ${i + 1}:`, event.target.errorCode);
        };
    }
}

document.getElementById('generateBtn').addEventListener('click', () => {
    if (db) {
        generateObjects();
    } else {
        console.error('Database is not ready yet.');
    }
});

// Open the database when the page loads
window.onload = openDatabase;
