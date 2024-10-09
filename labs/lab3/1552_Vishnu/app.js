// Initialize IndexedDB
const dbName = "MyDatabase";
const dbVersion = 1;
let db;

// Open IndexedDB and create object store
function openDB() {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function(event) {
        console.error("Database error:", event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Database opened successfully.");
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("objectsStore", { keyPath: "uuid" });
        objectStore.createIndex("uuid", "uuid", { unique: true });
        console.log("Object store created.");
    };
}

// Function to generate a single object
function generateObject() {
    return {
        uuid: crypto.randomUUID(), // Unique identifier
        source_database: "IndexedDB", // Source database identifier
        created_at: new Date().toISOString(), // Creation timestamp
        updated_at: new Date().toISOString(), // Update timestamp
        // Additional attributes
        temperature: (Math.random() * 50).toFixed(2),  // Random temperature
        humidity: (Math.random() * 100).toFixed(2),    // Random humidity percentage
        location: ["Field 1", "Field 2", "Field 3"][Math.floor(Math.random() * 3)] // Random location
    };
}

// Generate and store 1000 objects in IndexedDB
function generateAndStoreObjects() {
    openDB();
    const transaction = db.transaction(["objectsStore"], "readwrite");
    const objectStore = transaction.objectStore("objectsStore");

    for (let i = 0; i < 1000; i++) {
        const newObj = generateObject();
        const request = objectStore.add(newObj);

        request.onsuccess = function() {
            console.log("Object added:", newObj);
        };

        request.onerror = function(event) {
            console.error("Error adding object:", event.target.error);
        };
    }

    transaction.oncomplete = function() {
        console.log("All 1000 objects added successfully.");
        alert("1000 Objects stored in IndexedDB.");
    };
}
