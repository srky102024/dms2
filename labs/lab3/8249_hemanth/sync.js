const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { IDBFactory } = require('fake-indexeddb');
const IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const dbName = "lab3";
const collectionName = " 8249_hemanth";

const names = ["Alice", "Bob", "Charlie", "David", "Eva", "Fay", "George", "Hannah", "Ivan", "Julia"];
const genders = ["Male", "Female", "Other"];

function createObject() {
    return {
        uuid: uuidv4(),
        source_database: "MongoDB",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: names[Math.floor(Math.random() * names.length)],
        age: Math.floor(Math.random() * (65 - 18 + 1)) + 18,
        gender: genders[Math.floor(Math.random() * genders.length)]
    };
}

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to MongoDB API</title>
            <style>
                /* ... (same CSS as in your Flask version) ... */
            </style>
        </head>
        <body>
            <h1>Welcome to the MongoDB API</h1>
            <div class="button-container">
                <button class="fetch-button" onclick="window.location.href='/api/mongodb'">Fetch Data from MongoDB</button>
            </div>
            <p>This API allows you to fetch and sync data between MongoDB and IndexedDB.</p>
            <footer>
                &copy; 2024 MongoDB API | Powered by Node.js & MongoDB
            </footer>
        </body>
        </html>
    `);
});

app.post('/api/mongodb/post', async (req, res) => {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const objects = Array.from({ length: 1000 }, createObject);
        await collection.insertMany(objects);
        
        res.status(201).json({ message: "Successfully inserted 1000 objects!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

app.get('/api/mongodb', async (req, res) => {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        const data = await collection.find({}).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await client.close();
    }
});

async function syncDatabases() {
    const client = new MongoClient(mongoUri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Set up IndexedDB
        const indexedDB = new IDBFactory();
        const idbName = 'localdb';
        const storeName = 'users';
        
        const idb = await new Promise((resolve, reject) => {
            const request = indexedDB.open(idbName, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                db.createObjectStore(storeName, { keyPath: 'uuid' });
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        // Sync MongoDB to IndexedDB
        const mongoData = await collection.find({}).toArray();
        const transaction = idb.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        for (const doc of mongoData) {
            await new Promise((resolve, reject) => {
                const request = store.put(doc);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        console.log('Synced MongoDB to IndexedDB');

        // Sync IndexedDB to MongoDB
        const indexedDBData = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        for (const doc of indexedDBData) {
            await collection.updateOne(
                { uuid: doc.uuid },
                { $set: doc },
                { upsert: true }
            );
        }

        console.log('Synced IndexedDB to MongoDB');

    } catch (error) {
        console.error('Sync error:', error);
    } finally {
        await client.close();
    }
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Perform initial sync
    syncDatabases();
    // Set up periodic sync (every 5 minutes)
    setInterval(syncDatabases, 5 * 60 * 1000);
});
