// Import MongoDB client and fake IndexedDB
const { MongoClient } = require('mongodb');
const FDBFactory = require('fake-indexeddb/lib/FDBFactory');

// MongoDB connection details
const mongoUrl = 'mongodb://localhost:27017'; // Ensure MongoDB is running
const dbName = 'syncDB'; // Name of your MongoDB database

// Connect to MongoDB
async function connectMongoDB() {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(dbName);
}

// Simulate IndexedDB connection using fake-indexeddb
async function connectIndexedDB() {
    const indexedDB = new FDBFactory();
    
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('fakeDB', 1);

        dbRequest.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore('items', { keyPath: '_id' });
        };

        dbRequest.onsuccess = function(event) {
            console.log("Connected to IndexedDB");
            resolve(dbRequest.result);
        };

        dbRequest.onerror = function(event) {
            console.error("Failed to connect to IndexedDB", event.target.error);
            reject(dbRequest.error);
        };
    });
}

// Sync data between MongoDB and IndexedDB
async function syncData(mongoDB, indexedDB) {
    const collection = mongoDB.collection('items'); // Access MongoDB collection

    // Fetch documents from MongoDB
    const mongoDocs = await collection.find({}).toArray();

    // Create a transaction for IndexedDB
    const transaction = indexedDB.transaction('items', 'readwrite');
    const objectStore = transaction.objectStore('items');

    // Sync each document from MongoDB to IndexedDB
    for (let doc of mongoDocs) {
        const request = objectStore.put(doc);
        request.onsuccess = () => {
            console.log(`Synced document with ID: ${doc._id}`);
        };
        request.onerror = (event) => {
            console.error(`Failed to sync document: ${event.target.error}`);
        };
    }

    // Wait for the transaction to complete
    transaction.oncomplete = async () => {
        console.log("All documents synced to IndexedDB.");

        // Log MongoDB document count
        const mongoCount = await collection.countDocuments();
        console.log(`MongoDB document count: ${mongoCount}`);

        // Open a new transaction for counting objects in IndexedDB
        const countTransaction = indexedDB.transaction('items', 'readonly');
        const countStore = countTransaction.objectStore('items');

        const countRequest = countStore.count();
        countRequest.onsuccess = function() {
            console.log(`IndexedDB object count: ${countRequest.result}`);
        };

        countRequest.onerror = function(event) {
            console.error("Error counting objects in IndexedDB:", event.target.error);
        };
    };

    transaction.onerror = function(event) {
        console.error("Transaction error:", event.target.error);
    };
}

// Main function to run the syncing process
async function main() {
    try {
        const mongoDB = await connectMongoDB();
        const indexedDB = await connectIndexedDB();
        await syncData(mongoDB, indexedDB);
    } catch (error) {
        console.error("Error during the sync process: ", error);
    }
}

// Run the main function
main();
