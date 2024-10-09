<div id="console-log"></div<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB to IndexedDB Sync</title>
</head>
<body>
    <h1>MongoDB to IndexedDB Sync Simulation</h1>
    <button id="syncButton">Sync Data</button>
    <div id="result"></div>

    <script>
        const dbName = "MyDatabase";
        const storeName = "MyObjectStore";
        let db;

        
        const mongoDBData = [
            {
                "_id": "1",
                "uuid": "a1b2c3d4-e5f6-7890-ghij-klmnopqrstuv",
                "source": "MongoDB",
                "createdAt": new Date().toISOString(),
                "updatedAt": new Date().toISOString(),
                "attribute1": "attribute_value_1",
                "attribute2": "attribute_value_2",
                "attribute3": "attribute_value_3"
            },
            
        ];

        
        const request = indexedDB.open(dbName, 2);

        request.onerror = (event) => {
            console.error("Database error: ", event.target.errorCode);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const objectStore = db.createObjectStore(storeName, { keyPath: "uuid" });
            objectStore.createIndex("createdAt", "createdAt", { unique: false });
            objectStore.createIndex("updatedAt", "updatedAt", { unique: false });
            objectStore.createIndex("attribute1", "attribute1", { unique: false });
            objectStore.createIndex("attribute2", "attribute2", { unique: false });
            objectStore.createIndex("attribute3", "attribute3", { unique: false });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database initialized");
        };

        
        function syncMongoToIndexedDB() {
            const transaction = db.transaction([storeName], "readwrite");
            const objectStore = transaction.objectStore(storeName);

            
            mongoDBData.forEach(async (mongoDoc) => {
                const getRequest = objectStore.get(mongoDoc.uuid);
                getRequest.onsuccess = (event) => {
                    const existing = event.target.result;
                    if (!existing) {
                        
                        objectStore.add(mongoDoc);
                    } else {
                        
                        objectStore.put(mongoDoc);
                    }
                };
            });

            transaction.oncomplete = () => {
                console.log("Sync completed.");
                document.getElementById('result').innerText = "Sync completed!";
            };

            transaction.onerror = (event) => {
                console.error("Transaction error: ", event.target.errorCode);
            };
        }

        
        document.getElementById("syncButton").addEventListener("click", () => {
            syncMongoToIndexedDB();
        });
    </script>
</body>
</html>