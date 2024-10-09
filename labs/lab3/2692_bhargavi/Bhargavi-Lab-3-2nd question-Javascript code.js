function initializeDB() {
    const request = indexedDB.open("SampleDB", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("objectsStore")) {
            db.createObjectStore("objectsStore", { keyPath: "UUID" });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        console.log("Database initialized");
        storeObjects(db);
    };

    request.onerror = function(event) {
        console.error("Database error:", event.target.errorCode);
    };
}

function storeObjects(db) {
    const transaction = db.transaction("objectsStore", "readwrite");
    const objectStore = transaction.objectStore("objectsStore");

    for (let i = 0; i < 1000; i++) {
        const object = {
            UUID: crypto.randomUUID(),
            source: "IndexedDB",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attribute1: `Value1_${i}`,
            attribute2: `Value2_${i}`,
            attribute3: `Value3_${i}`
        };
        objectStore.add(object);
    }

    transaction.oncomplete = function() {
        console.log("All objects have been stored in IndexedDB.");
    };

    transaction.onerror = function(event) {
        console.error("Transaction error:", event.target.errorCode);
    };
}
