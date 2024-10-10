const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const IndexedDB = require('fake-indexeddb');
const FDBFactory = require('fake-indexeddb/lib/FDBFactory');
const FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

// MongoDB connection details
const mongoUri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const dbName = "lab3";
const collectionName = "9404_jace";  // Update with your student ID

// Simulating IndexedDB setup for Node.js
let indexedDB = new FDBFactory();
let db;

// Connect to MongoDB
async function connectMongoDB() {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    return { client, collection: db.collection(collectionName) };
}

// Setup IndexedDB
async function setupIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("SyncDB", 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            const objectStore = db.createObjectStore("objects", { keyPath: "uuid" });
            console.log("IndexedDB setup complete.");
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            console.log("IndexedDB opened.");
            resolve(db);
        };

        request.onerror = function (event) {
            console.error("Error opening IndexedDB: ", event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

// Generate sample data for MongoDB
async function generateMongoData(collection, count = 1000) {
    const data = [];
    for (let i = 0; i < count; i++) {
        const newObj = {
            uuid: uuidv4(),
            source_db: "MongoDB",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            attribute1: `Sample Data 1 - ${i}`,
            attribute2: `Sample Data 2 - ${i}`,
            attribute3: `Sample Data 3 - ${i}`
        };
        data.push(newObj);
    }

    await collection.insertMany(data);
    console.log(`${count} documents inserted into MongoDB.`);
}

// Sync MongoDB data to IndexedDB
async function syncMongoToIndexedDB(mongoCollection) {
    const cursor = mongoCollection.find({});
    const transaction = db.transaction(["objects"], "readwrite");
    const objectStore = transaction.objectStore("objects");

    await cursor.forEach(async (document) => {
        const getRequest = objectStore.get(document.uuid);
        getRequest.onsuccess = function (event) {
            const existingObject = event.target.result;
            if (!existingObject || new Date(document.updated_at) > new Date(existingObject.updated_at)) {
                const putRequest = objectStore.put(document);
                putRequest.onsuccess = function () {
                    console.log(`Document with UUID ${document.uuid} synced to IndexedDB.`);
                };
            }
        };
    });

    transaction.oncomplete = function () {
        console.log("Sync operation complete.");
    };

    transaction.onerror = function (event) {
        console.error("Transaction error: ", event.target.errorCode);
    };
}

// Count documents in MongoDB and IndexedDB
async function countDocuments(mongoCollection) {
    const mongoCount = await mongoCollection.countDocuments();
    const transaction = db.transaction(["objects"], "readonly");
    const objectStore = transaction.objectStore("objects");

    let indexedDBCount = 0;
    const countRequest = objectStore.count();
    countRequest.onsuccess = function (event) {
        indexedDBCount = event.target.result;
        console.log(`MongoDB Document Count: ${mongoCount}`);
        console.log(`IndexedDB Object Count: ${indexedDBCount}`);
    };

    countRequest.onerror = function (event) {
        console.error("Error counting IndexedDB objects: ", event.target.errorCode);
    };
}

// Main function to execute sync
async function main() {
    try {
        // Connect to MongoDB
        const { client, collection } = await connectMongoDB();

        // Generate data in MongoDB (if needed)
        await generateMongoData(collection);

        // Setup IndexedDB
        await setupIndexedDB();

        // Sync data from MongoDB to IndexedDB
        await syncMongoToIndexedDB(collection);

        // Count documents in both databases
        await countDocuments(collection);

        // Close MongoDB connection
        await client.close();
        console.log("MongoDB connection closed.");
    } catch (error) {
        console.error("Error during sync: ", error);
    }
}

main();
