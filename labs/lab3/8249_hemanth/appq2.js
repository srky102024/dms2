document.getElementById('generate').addEventListener('click', generateAndStoreObjects);

function generateAndStoreObjects() {
    const dbRequest = indexedDB.open('myDatabase', 1);
    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('myObjectStore', { keyPath: 'uuid' });
    };

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('myObjectStore', 'readwrite');
        const objectStore = transaction.objectStore('myObjectStore');

        for (let i = 0; i < 1000; i++) {
            const obj = {
                uuid: generateUUID(),
                source_db: 'IndexedDB',
                created_at: new Date(),
                updated_at: new Date(),
                attribute1: 'value1',
                attribute2: 'value2',
                attribute3: 'value3'
            };
            objectStore.add(obj);
        }

        transaction.oncomplete = function() {
            console.log('Successfully stored 1000 objects in IndexedDB');
        };

        transaction.onerror = function(event) {
            console.error('Transaction failed: ', event.target.error);
        };
    };

    dbRequest.onerror = function(event) {
        console.error('Database error: ', event.target.error);
    };
}

function generateUUID() {
    // Generate a UUID for the objects
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
