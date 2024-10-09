const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb://localhost:27017";

// Function to read data from exported IndexedDB JSON file
function readIndexedDBData() {
    const data = fs.readFileSync('indexedDB_collection.json', 'utf8');
    return JSON.parse(data);
}

// Function to sync IndexedDB data to MongoDB
async function syncIndexedDBToMongo(data) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db('SyncDb');
        const collection = db.collection('SyncCollection');

        // Insert data into MongoDB, assuming UUID is the unique identifier
        for (const obj of data) {
            // Upsert the document in MongoDB (insert or update if exists)
            await collection.updateOne(
                { uuid: obj.uuid }, // Matching the unique UUID
                { $set: obj },      // Updating the document with the new data
                { upsert: true }    // Insert if it does not exist
            );
        }

        client.close();

        console.log('Data has been synced successfully. IndexedDB data has been successfully synced to MongoDB.');
    } catch (err) {
        console.error('Error syncing data to MongoDB:', err);
    }
}

// Read data from IndexedDB export and sync to MongoDB
const indexedDBData = readIndexedDBData();
syncIndexedDBToMongo(indexedDBData);
