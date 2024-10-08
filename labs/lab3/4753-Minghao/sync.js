const { MongoClient } = require('mongodb');
const fakeIndexedDB = require('fake-indexeddb');
const { v4: uuidv4 } = require('uuid');

const MONGO_URI = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3?tlsAllowInvalidCertificates=true';
const DB_NAME = 'lab3';
const COLLECTION_NAME = '4753_Minghao';

// Initialize IndexedDB
const indexedDB = fakeIndexedDB.indexedDB;
const dbName = 'ObjectDatabase';
const storeName = 'objects';

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            const objectStore = db.createObjectStore(storeName, { keyPath: "uuid" });
            objectStore.createIndex("source_database", "source_database", { unique: false });
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            reject("Error opening IndexedDB: " + event.target.errorCode);
        };
    });
}

async function syncMongoToIndexedDB() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const mongoData = await collection.find({}).toArray();
        const indexedDBInstance = await initIndexedDB();

        const transaction = indexedDBInstance.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);

        mongoData.forEach((obj) => {
            objectStore.put(obj);
        });

        transaction.oncomplete = () => {
            console.log("Sync completed from MongoDB to IndexedDB.");
        };

        transaction.onerror = (event) => {
            console.error("Error syncing to IndexedDB: ", event.target.errorCode);
        };

    } catch (error) {
        console.error("Error syncing data: ", error);
    } finally {
        await client.close();
    }
}

async function checkCounts() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const mongoCount = await collection.countDocuments();
        console.log(`MongoDB document count: ${mongoCount}`);

        const indexedDBInstance = await initIndexedDB();
        const transaction = indexedDBInstance.transaction([storeName], "readonly");
        const objectStore = transaction.objectStore(storeName);
        const countRequest = objectStore.count();

        countRequest.onsuccess = function() {
            console.log(`IndexedDB object count: ${countRequest.result}`);
        };

    } catch (error) {
        console.error("Error checking counts: ", error);
    } finally {
        await client.close();
    }
}

syncMongoToIndexedDB()
    .then(() => checkCounts())
    .catch(console.error);
