// Initialize IndexedDB
let db;
const request = window.indexedDB.open("MyDatabase", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("myObjects", { keyPath: "uuid" });
    objectStore.createIndex("source", "source", { unique: false });
    objectStore.createIndex("createdAt", "createdAt", { unique: false });
    objectStore.createIndex("updatedAt", "updatedAt", { unique: false });
    objectStore.createIndex("extra1", "extra1", { unique: false });
    objectStore.createIndex("extra2", "extra2", { unique: false });
    objectStore.createIndex("extra3", "extra3", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    document.getElementById('generate-data').addEventListener('click', generateAndStoreData);
};

request.onerror = function (event) {
    console.error("IndexedDB Error:", event.target.errorCode);
};

// Function to generate a UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to generate and store 1000 objects in IndexedDB
function generateAndStoreData() {
    const transaction = db.transaction(["myObjects"], "readwrite");
    const objectStore = transaction.objectStore("myObjects");
    
    for (let i = 0; i < 1000; i++) {
        const newObject = {
            uuid: generateUUID(),
            source: "IndexedDB",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            extra1: `Attribute1-${i}`,
            extra2: `Attribute2-${i}`,
            extra3: `Attribute3-${i}`
        };

        const request = objectStore.add(newObject);
        request.onerror = function (event) {
            console.error("Error storing object:", event.target.errorCode);
        };
    }

    transaction.oncomplete = function () {
        document.getElementById('status').innerText = "1000 objects have been added to IndexedDB!";
    };

    transaction.onerror = function () {
        console.error("Transaction failed");
    };
}
