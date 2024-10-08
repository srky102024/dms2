// Function to open IndexedDB
function openIndexedDB() {
    const request = indexedDB.open("MyDatabase", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore("MyStore", { keyPath: "id" });
        objectStore.createIndex("name", "name", { unique: false });
    };

    return request;
}

// Function to generate 1000 entries
function generateEntries() {
    const dbRequest = openIndexedDB();

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("MyStore", "readwrite");
        const objectStore = transaction.objectStore("MyStore");

        for (let i = 1; i <= 1000; i++) {
            const entry = { id: i, name: `Entry ${i}` };
            objectStore.add(entry);
        }

        alert("1000 entries generated in IndexedDB!");
    };

    dbRequest.onerror = function(event) {
        console.error("Error opening IndexedDB:", event.target.error);
    };
}

// Function to sync data to MongoDB
function syncToMongoDB() {
    const dbRequest = openIndexedDB();

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("MyStore", "readonly");
        const objectStore = transaction.objectStore("MyStore");
        const allEntriesRequest = objectStore.getAll();

        allEntriesRequest.onsuccess = function() {
            const documents = allEntriesRequest.result;
            fetch('http://127.0.0.1:5000/sync/to/mongodb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ documents: documents })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById('message').innerText = data.message || "Data synced!";
                })
                .catch((error) => {
                    console.error("Error syncing to MongoDB:", error);
                    document.getElementById('message').innerText = "Error syncing to MongoDB!";
                });
        };

        allEntriesRequest.onerror = function() {
            console.error("Error fetching entries from IndexedDB:", allEntriesRequest.error);
        };
    };

    dbRequest.onerror = function(event) {
        console.error("Error opening IndexedDB:", event.target.error);
    };
}

// Event listeners for button clicks
document.getElementById("generateEntries").addEventListener("click", generateEntries);
document.getElementById("syncToMongoDB").addEventListener("click", syncToMongoDB);
