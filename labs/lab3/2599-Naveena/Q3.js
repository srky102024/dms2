const { MongoClient } = require('mongodb'); // Import MongoDB client
const uri = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3'; // Replace with your MongoDB credentials
const client = new MongoClient(uri);

// Function to sync IndexedDB data to MongoDB
async function syncDataToMongoDB() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB.");

        // Get the database and collection
        const db = client.db('lab3');
        const mongoCollection = db.collection('2599_Naveena'); // Updated collection name

        // Fetch data from IndexedDB
        const indexedDBData = await getIndexedDBData();

        // Sync IndexedDB to MongoDBs
        for (const record of indexedDBData) {
            await mongoCollection.updateOne(
                { uuid: record.uuid }, // Find by uuid
                { $set: record },      // Update or insert the record
                { upsert: true }       // Insert if it doesn't exist
            );
        }
        console.log("IndexedDB data synced to MongoDB successfully!");
    } catch (error) {
        console.error("Error syncing data:", error);
    } finally {
        await client.close(); // Close the MongoDB connection
    }
}

// Function to get data from IndexedDB
async function getIndexedDBData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ObjectDatabase", 1);
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(["objects"], "readonly");
            const objectStore = transaction.objectStore("objects");
            const allRecords = objectStore.getAll();

            allRecords.onsuccess = function() {
                resolve(allRecords.result); // Resolve with all records
            };

            allRecords.onerror = function() {
                reject("Error fetching records from IndexedDB.");
            };
        };
        request.onerror = function() {
            reject("Error opening IndexedDB.");
        };
    });
}

// Call the sync function
syncDataToMongoDB();