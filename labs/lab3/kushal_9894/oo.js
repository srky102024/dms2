// Import necessary modules
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs

// MongoDB connection configuration
const mongoUri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"; // Your MongoDB URI
const dbName = "lab3";
const collectionName = "9894_kushal"; // Your collection name

// Simulated IndexedDB using an in-memory JavaScript object
let indexedDBData = {};

// Function to generate 1000 records in the simulated IndexedDB
function initializeIndexedDBData() {
    for (let i = 0; i < 1000; i++) {
        const uuid = uuidv4();
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

// Function to sync data from MongoDB to IndexedDB
async function syncMongoDBToIndexedDB() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let recordsAdded = 0;

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Fetch all records from MongoDB
        const mongoData = await collection.find({}).toArray();

        // Add MongoDB records to IndexedDB if they don't exist
        mongoData.forEach((doc) => {
            if (!indexedDBData[doc.uuid]) {
                indexedDBData[doc.uuid] = { ...doc, sourceDatabase: "MongoDB" };
                recordsAdded++;
            }
        });

        console.log(`Synced ${recordsAdded} records from MongoDB to IndexedDB.`);
    } catch (error) {
        console.error("Error during MongoDB to IndexedDB sync:", error);
    } finally {
        await client.close();
    }
}

// Function to sync data from IndexedDB to MongoDB
async function syncIndexedDBToMongoDB() {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let recordsAdded = 0;

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Fetch all UUIDs from MongoDB to avoid duplicates
        const mongoData = await collection.find({}).toArray();
        const mongoUUIDs = mongoData.map(doc => doc.uuid);

        // Filter new records from IndexedDB
        const newRecords = Object.values(indexedDBData).filter(record => !mongoUUIDs.includes(record.uuid));

        if (newRecords.length > 0) {
            await collection.insertMany(newRecords);
            recordsAdded = newRecords.length;
        }

        console.log(`Synced ${recordsAdded} records from IndexedDB to MongoDB.`);
    } catch (error) {
        console.error("Error during IndexedDB to MongoDB sync:", error);
    } finally {
        await client.close();
    }
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

// Main function to handle the two-way sync process
async function performTwoWaySync() {
    console.log("Starting Two-Way Sync...");

    // Initialize IndexedDB data
    initializeIndexedDBData();

    // Show initial data counts
    const initialMongoDBCount = await countMongoDBEntries();
    const initialIndexedDBCount = Object.keys(indexedDBData).length;
    console.log(`Initial Counts - MongoDB: ${initialMongoDBCount}, IndexedDB: ${initialIndexedDBCount}`);

    // Sync MongoDB to IndexedDB
    await syncMongoDBToIndexedDB();

    // Sync IndexedDB to MongoDB
    await syncIndexedDBToMongoDB();

    // Show final data counts
    const finalMongoDBCount = await countMongoDBEntries();
    const finalIndexedDBCount = Object.keys(indexedDBData).length;
    console.log(`Final Counts - MongoDB: ${finalMongoDBCount}, IndexedDB: ${finalIndexedDBCount}`);

    console.log("Two-Way Sync Complete.");
}

// Run the sync process
performTwoWaySync();
