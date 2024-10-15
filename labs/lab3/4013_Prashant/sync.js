const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Setup
const mongoURI = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3';
const dbName = 'lab3';
const collectionName = '4013';
// Simulated IndexedDB data
let indexedDBData = [];

// Function to generate 1000 objects for IndexedDB simulation
function simulateIndexedDB() {
    for (let i = 0; i < 1000; i++) {
        const uuid = uuidv4(); 
        const timestamp = new Date().toISOString();
        
        const object = {
            uuid: uuid,
            source: 'IndexedDB',
            created_at: timestamp,
            updated_at: timestamp,
            attribute1: `value${i + 1}`,
            attribute2: `value${i + 2}`,
            attribute3: `value${i + 3}`
        };
        indexedDBData.push(object);
    }
    console.log('Simulated 1000 objects for IndexedDB');
}

// Sync function to maintain consistency between MongoDB and IndexedDB
async function syncDatabases() {
    const client = new MongoClient(mongoURI);

    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch data from MongoDB
        const mongoDBData = await collection.find().toArray();
        console.log('MongoDB data fetched:', mongoDBData.length, 'objects');

        // Sync IndexedDB data to MongoDB
        for (const indexedObject of indexedDBData) {
            const existingObject = mongoDBData.find(mongoObject => mongoObject.uuid === indexedObject.uuid);
            
            if (!existingObject) {
                // If the object does not exist in MongoDB, insert it
                await collection.insertOne(indexedObject);
                console.log(`Inserted ${indexedObject.uuid} into MongoDB`);
            }
        }

        // Sync MongoDB data to IndexedDB
        for (const mongoObject of mongoDBData) {
            const existingObject = indexedDBData.find(indexedObject => indexedObject.uuid === mongoObject.uuid);

            if (!existingObject) {
                // If the object does not exist in IndexedDB, simulate adding it to IndexedDB
                indexedDBData.push(mongoObject);
                console.log(`Synced ${mongoObject.uuid} to IndexedDB`);
            }
        }

        console.log('Sync complete!');
    } catch (error) {
        console.error('Error during sync:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// Simulate IndexedDB and initiate sync
simulateIndexedDB();
syncDatabases();
