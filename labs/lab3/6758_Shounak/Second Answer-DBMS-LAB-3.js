<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IndexedDB Example</title>
</head>
<body>
    <h1>IndexedDB Object Generator</h1>
    <button id="generate">Generate 1000 Objects</button>
    <div id="result"></div>

    <script>
        const dbName = "MyDatabase";
        const storeName = "MyObjectStore";
        let db;

        // Open (or create) the database with version 2
        const request = indexedDB.open(dbName, 2);

        request.onerror = (event) => {
            console.error("Database error: ", event.target.errorCode);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const objectStore = db.createObjectStore(storeName, { keyPath: "uuid" });
            objectStore.createIndex("source", "source", { unique: false });
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

        document.getElementById("generate").addEventListener("click", () => {
            generateAndStoreObjects(1000);
        });

        function generateAndStoreObjects(count) {
            const transaction = db.transaction([storeName], "readwrite");
            const objectStore = transaction.objectStore(storeName);

            for (let i = 0; i < count; i++) {
                const object = {
                    uuid: generateUUID(),
                    source: "IndexedDB",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    attribute1: `Attribute 1 Value ${i}`,
                    attribute2: `Attribute 2 Value ${i}`,
                    attribute3: `Attribute 3 Value ${i}`
                };

                objectStore.add(object);
            }

            transaction.oncomplete = () => {
                document.getElementById("result").innerText = "1000 objects generated and stored in IndexedDB.";
                console.log("All objects have been added to the database.");
            };

            transaction.onerror = (event) => {
                console.error("Transaction error: ", event.target.error);
            };
        }

        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    </script>
</body>
</html>