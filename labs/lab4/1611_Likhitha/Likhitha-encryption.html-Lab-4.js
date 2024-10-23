[00:13, 10/23/2024] Shounak Palnitkar: <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encryption/Decryption Performance</title>
</head>
<body>


<h2>Encrypt/Decrypt To-Do Items</h2>


<button onclick="generateTasks()">Generate Tasks</button>
<button onclick="storeTasks()">Store Encrypted Tasks</button>
<button onclick="readTasks()">Read and Decrypt Tasks</button>


<p><strong>Encryption Time:</strong> <span id="encryptionTime"></span> ms</p>
<p><strong>Decryption Time:</strong> <span id="decryptionTime"></span> ms</p>


<p><strong>Encrypted Data:</strong> <span id="encryptedData"></span></p>
<p><strong>Decrypted Data:</strong> <span id="decryptedData"></span></p>


<script>
    let encryptedArray = null;
    let key = null;
    let iv = null;
    const dbName = 'todoDB';
    const storeName = 'tasks';
    const todoItems = [];
    async function generateKey() {
        key = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        iv = crypto.getRandomValues(new Uint8Array(12));
        console.log("Key and IV generated:", key, iv);
    }
    function generateTasks() {
        todoItems.length = 0;
        for (let i = 1; i <= 1000; i++) {
            todoItems.push({ uuid: crypto.randomUUID(), task: Task ${i}, status: "progress" });
        }
        alert("Generated 1000 tasks!");
        console.log("Generated tasks:", todoItems);
    }
    async function encryptData() {
        if (!key) await generateKey();


        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(todoItems));


        const start = performance.now();  


        try {
            encryptedArray = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                encodedData
            );


            const end = performance.now();  
            document.getElementById('encryptionTime').textContent = (end - start).toFixed(2);
            document.getElementById('encryptedData').textContent = new Uint8Array(encryptedArray).toString();
            console.log("Encryption successful:", new Uint8Array(encryptedArray));
        } catch (error) {
            console.error("Encryption failed:", error);
        }
    }
    async function storeTasks() {
        if (todoItems.length === 0) {
            alert("Please generate the tasks first!");
            return;
        }


        await encryptData();
        if (!encryptedArray) {
            alert("Encryption failed! Please try again.");
            return;
        }


        const db = await openDatabase();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();


        const start = performance.now();  
        const encryptedDataArray = new Uint8Array(encryptedArray);
        for (let i = 0; i < encryptedDataArray.length; i++) {
            store.add({ id: i + 1, task: encryptedDataArray[i] });
        }


        store.onsuccess = () => {
            const end = performance.now();  
            alert("Tasks stored in IndexedDB!");
            console.log("Storage time:", (end - start).toFixed(2));
        };
    }
    async function readTasks() {
        const db = await openDatabase();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();


        request.onsuccess = async (event) => {
            const encryptedDataArray = event.target.result.map(item => item.task);
            console.log("Retrieved encrypted data:", encryptedDataArray);
            const encryptedBuffer = new Uint8Array(encryptedDataArray).buffer;


            const start = performance.now();  


            try {
                const decryptedArrayBuffer = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    encryptedBuffer
                );


                const end = performance.now();  
                document.getElementById('decryptionTime').textContent = (end - start).toFixed(2);


                const decoder = new TextDecoder();
                const decryptedData = decoder.decode(decryptedArrayBuffer);
                document.getElementById('decryptedData').textContent = decryptedData;
                console.log("Decryption successful:", decryptedData);
            } catch (error) {
                console.error("Decryption failed:", error);
            }
        };


        request.onerror = (event) => {
            console.error("Error reading from IndexedDB:", event.target.error);
        };
    }
    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(storeName, { keyPath: 'id' });
            };
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject(event.target.error);
            };
        });
    }


</script>


</body>
</html>
[00:21, 10/23/2024] Shounak Palnitkar: 