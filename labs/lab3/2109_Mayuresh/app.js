// Function to generate random objects
function generateObject() {
    return {
        uuid: crypto.randomUUID(), // Generates a unique UUID
        source_database: "IndexedDB", // Database identifier
        created_at: new Date().toISOString(), // Creation timestamp
        updated_at: new Date().toISOString(), // Update timestamp
        attribute1: `Attribute_${Math.floor(Math.random() * 1000)}`, // Random attribute 1
        attribute2: Math.floor(Math.random() * 100), // Random attribute 2
        attribute3: (Math.random() * 100).toFixed(2) // Random attribute 3
    };
}

// Initialize IndexedDB
function initializeIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ObjectDatabase", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const objectStore = db.createObjectStore("objects", { keyPath: "uuid" });
            resolve(db);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject("Error opening IndexedDB: " + event.target.errorCode);
        };
    });
}

// Generate and store 1000 objects in IndexedDB
async function generateAndStoreObjects() {
    try {
        document.getElementById("status").innerText = "Generating 1000 objects...";

        const db = await initializeIndexedDB();
        const transaction = db.transaction("objects", "readwrite");
        const objectStore = transaction.objectStore("objects");

        for (let i = 0; i < 1000; i++) {
            const obj = generateObject();
            objectStore.add(obj);
        }

        transaction.oncomplete = () => {
            document.getElementById("status").innerText = "Successfully stored 1000 objects in IndexedDB.";
        };

        transaction.onerror = () => {
            document.getElementById("status").innerText = "Error storing objects in IndexedDB.";
        };
    } catch (error) {
        document.getElementById("status").innerText = "Error: " + error;
    }
}

// Export IndexedDB data to a JSON file
async function exportIndexedDBData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ObjectDatabase', 1);

        request.onsuccess = async (event) => {
            const db = event.target.result;
            const transaction = db.transaction('objects', 'readonly');
            const objectStore = transaction.objectStore('objects');
            const allData = objectStore.getAll();

            allData.onsuccess = function () {
                const data = allData.result;

                // Convert IndexedDB data to JSON string
                const jsonData = JSON.stringify(data, null, 2);

                // Create a Blob from the JSON string
                const blob = new Blob([jsonData], { type: "application/json" });

                // Create a link to download the JSON file
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "indexeddb_export.json"; // The name of the file

                // Programmatically trigger the download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                resolve();
            };

            allData.onerror = function () {
                reject('Failed to retrieve data from IndexedDB.');
            };
        };

        request.onerror = function (event) {
            reject('Error opening IndexedDB: ' + event.target.errorCode);
        };
    });
}

// Attach export function to button click
document.getElementById('exportButton').addEventListener('click', async () => {
    await exportIndexedDBData();
    alert('IndexedDB data has been exported to a JSON file.');
});
