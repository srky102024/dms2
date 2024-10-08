const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const mongoUri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const dbName = "lab3";
const collectionName = "8154_Pavan_Naik";

// Simulated IndexedDB database using an in-memory JavaScript object
let indexedDBData = {};

// Function to generate initial data for the simulated IndexedDB
function initializeIndexedDBData() {
    for (let i = 0; i < 1000; i++) {
        const uuid = `uuid-${i}`;
        indexedDBData[uuid] = {
            uuid: uuid,
            sourceDatabase: "IndexedDB",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            name: `Name_${i}`,
            age: Math.floor(Math.random() * (65 - 18 + 1)) + 18, // Random age between 18 and 65
            gender: i % 2 === 0 ? "Male" : "Female"
        };
    }
    console.log(`Initialized IndexedDB with ${Object.keys(indexedDBData).length} entries.`);
}

// Function to fetch data from MongoDB and sync with simulated IndexedDB
async function syncMongoDBToIndexedDB() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let recordsAddedToIndexedDB = 0;

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const mongoData = await collection.find({}).toArray();

        mongoData.forEach((doc) => {
            if (!indexedDBData[doc.uuid]) {
                // Add new data to simulated IndexedDB
                indexedDBData[doc.uuid] = doc;
                recordsAddedToIndexedDB++;
            } else {
                // Update existing data in simulated IndexedDB
                indexedDBData[doc.uuid] = { ...indexedDBData[doc.uuid], ...doc };
            }
        });

        console.log(`MongoDB to IndexedDB Sync Summary: ${recordsAddedToIndexedDB} records added to IndexedDB`);
    } catch (error) {
        console.error("Error syncing MongoDB to IndexedDB:", error);
    } finally {
        await client.close();
    }
}

// Function to sync data from IndexedDB to MongoDB
async function syncIndexedDBToMongoDB() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let recordsAddedToMongoDB = 0;

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const indexedDBEntries = Object.values(indexedDBData);
        const mongoData = await collection.find({}).toArray();

        const newDataToMongoDB = indexedDBEntries.filter(
            (indexedDoc) => !mongoData.some((mongoDoc) => mongoDoc.uuid === indexedDoc.uuid)
        );

        if (newDataToMongoDB.length > 0) {
            await collection.insertMany(newDataToMongoDB);
            recordsAddedToMongoDB = newDataToMongoDB.length;
        }

        console.log(`IndexedDB to MongoDB Sync Summary: ${recordsAddedToMongoDB} records added to MongoDB`);
    } catch (error) {
        console.error("Error syncing IndexedDB to MongoDB:", error);
    } finally {
        await client.close();
    }

    return recordsAddedToMongoDB;
}

// Function to count total entries in MongoDB
async function countMongoDBEntries() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const count = await collection.countDocuments();
        return count;
    } catch (error) {
        console.error("Error counting MongoDB entries:", error);
        return 0;
    } finally {
        await client.close();
    }
}

// Combined function to handle the two-way sync process and display total data entries
async function performTwoWaySync() {
    console.log("====== Two-Way Synchronization Process Started ======");

    // Initialize IndexedDB with 1000 entries before starting sync
    initializeIndexedDBData();

    // Display total entries before synchronization
    const initialMongoDBCount = await countMongoDBEntries();
    const initialIndexedDBCount = Object.keys(indexedDBData).length;
    console.log(`Initial Data Counts => MongoDB: ${initialMongoDBCount}, IndexedDB: ${initialIndexedDBCount}`);

    // Sync data from MongoDB to IndexedDB
    await syncMongoDBToIndexedDB();

    // Sync data from IndexedDB to MongoDB
    const recordsAddedToMongoDB = await syncIndexedDBToMongoDB();

    // Display total entries after synchronization
    const finalMongoDBCount = await countMongoDBEntries();
    const finalIndexedDBCount = Object.keys(indexedDBData).length;

    console.log(`Final Data Counts => MongoDB: ${finalMongoDBCount}, IndexedDB: ${finalIndexedDBCount}`);
    console.log(`Records Added During Sync => MongoDB: ${recordsAddedToMongoDB}, IndexedDB: ${finalIndexedDBCount - initialIndexedDBCount}`);

    console.log("====== Two-Way Synchronization Process Completed ======");
}

// Run the two-way sync process
performTwoWaySync();
