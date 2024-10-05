const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const client = new MongoClient(uri);

// Path to the JSON file
const jsonFilePath = 'C:\\Users\\sindh\\OneDrive\\Desktop\\Lab3\\objects.json';

async function syncData() {
    try {
        // Read the JSON file
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const indexedDBObjects = JSON.parse(jsonData);
        
        console.log(`Read ${indexedDBObjects.length} objects from JSON file.`);

        // Connect to MongoDB
        await client.connect();
        const db = client.db('lab3');
        
        // Check if the collection exists
        const collection = db.collection('6447_Srikar');
        if (!collection) {
            throw new Error('Collection does not exist');
        }

        // Prepare bulk operations to sync with MongoDB
        const bulkOps = indexedDBObjects.map(obj => ({
            updateOne: {
                filter: { uuid: obj.uuid },
                update: { $set: obj },
                upsert: true
            }
        }));

        // Perform bulk write to MongoDB
        const result = await collection.bulkWrite(bulkOps);
        console.log('Sync operation result:', result);

    } catch (error) {
        console.error('Error syncing data:', error);
    } finally {
        await client.close(); // Ensure the client is closed
    }
}

// Run the sync function
syncData();
