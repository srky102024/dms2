const { MongoClient } = require('mongodb');

// MongoDB connection URL and database details
const url = 'mongodb://localhost:27017';
const dbName = 'MyDatabase';
const collectionName = 'MyCollection';

// Mock IndexedDB structure using an in-memory object
let indexedDB = {
    [collectionName]: {}
};

// Simulated MongoDB data
const mongoDBData = [
    {
        "_id": "1",
        "uuid": "a1b2c3d4-e5f6-7890-ghij-klmnopqrstuv",
        "source": "MongoDB",
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString(),
        "attribute1": "attribute_value_1",
        "attribute2": "attribute_value_2",
        "attribute3": "attribute_value_3"
    },
    // Add more documents as needed
];

// Function to sync MongoDB data to IndexedDB
async function syncMongoToIndexedDB() {
    const client = new MongoClient(url, { useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        for (const mongoDoc of mongoDBData) {
            // Check if document already exists in IndexedDB
            if (!indexedDB[collectionName][mongoDoc.uuid]) {
                // If not, add it to IndexedDB
                indexedDB[collectionName][mongoDoc.uuid] = mongoDoc;
                console.log(Added document to IndexedDB: $(mongoDoc.uuid));
            } else {
                // If it exists, update the existing document
                indexedDB[collectionName][mongoDoc.uuid] = { ...indexedDB[collectionName][mongoDoc.uuid], ...mongoDoc };
                console.log(Updated document in IndexedDB: ${mongoDoc.uuid});
            }
        }

        console.log("Sync completed.");
        console.log("IndexedDB data:", indexedDB[collectionName]);
    } catch (error) {
        console.error("Error during sync:", error);
    } finally {
        await client.close();
    }
}

// Execute the sync function
syncMongoToIndexedDB();