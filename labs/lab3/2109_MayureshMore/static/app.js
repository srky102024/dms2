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

// Fetch 1000 objects from MongoDB using the Flask API and store them in IndexedDB
async function fetchDataFromMongoDB() {
    try {
        document.getElementById("status").innerText = "Fetching data from MongoDB...";

        const response = await fetch("/mongodb");
        const data = await response.json();

        const db = await initializeIndexedDB();
        const transaction = db.transaction("objects", "readwrite");
        const objectStore = transaction.objectStore("objects");

        // Store each object from MongoDB into IndexedDB
        for (const obj of data) {
            objectStore.add(obj);
        }

        transaction.oncomplete = () => {
            document.getElementById("status").innerText = "Successfully fetched and stored 1000 objects in IndexedDB.";
        };

        transaction.onerror = () => {
            document.getElementById("status").innerText = "Error storing objects in IndexedDB.";
        };
    } catch (error) {
        document.getElementById("status").innerText = "Error: " + error;
    }
}

// Retrieve data from IndexedDB and post it to MongoDB via the Flask API
async function postDataToMongoDB() {
    try {
        document.getElementById("status").innerText = "Posting data to MongoDB...";

        const db = await initializeIndexedDB();
        const transaction = db.transaction("objects", "readonly");
        const objectStore = transaction.objectStore("objects");
        const allData = objectStore.getAll();

        allData.onsuccess = async function () {
            const indexedDBData = allData.result;

            // Post the data to MongoDB via the Flask API
            const response = await fetch("/mongodb/post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(indexedDBData)
            });

            const result = await response.json();

            if (response.status === 201) {
                document.getElementById("status").innerText = "Successfully posted 1000 objects to MongoDB.";
            } else {
                document.getElementById("status").innerText = "Error posting data: " + result.error;
            }
        };

        allData.onerror = function () {
            document.getElementById("status").innerText = "Failed to retrieve data from IndexedDB.";
        };
    } catch (error) {
        document.getElementById("status").innerText = "Error: " + error;
    }
}
