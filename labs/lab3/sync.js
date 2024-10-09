import { MongoClient } from 'mongodb';

// MongoDB connection configuration
const mongoUri = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3';
const dbName = 'lab3';
const collectionName = '3114_Mythry'; // Use the last four digits of the student ID

// Simulated IndexedDB using a JavaScript object
let indexedDBData = {};

// Function to generate a sample object with UUID and additional attributes
function generateObject(i) {
    return {
        uuid: `uuid-${i}`,
        source_db: 'IndexedDB',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rating: Math.floor(Math.random() * 5) + 1, // Random rating between 1 and 5
        review_count: Math.floor(Math.random() * 1000), // Random review count between 0 and 1000
        discount: (Math.random() * 50).toFixed(2), // Random discount percentage between 0.0 and 50.0
        product_name: `Product ${i}`, // Random product name
        price: (Math.random() * 100).toFixed(2), // Random price between 0 and 100
        available: Math.random() < 0.5 // Random availability (true or false)
    };
}

// Initialize the IndexedDB-like structure
function initializeIndexedDBData() {
    for (let i = 0; i < 1000; i++) {
        const object = generateObject(i);
        indexedDBData[object.uuid] = object;
    }
    console.log(`Initialized IndexedDB with ${Object.keys(indexedDBData).length} records.`);
}

// Sync function to get data from MongoDB and add it to IndexedDB if necessary
async function syncMongoDBToIndexedDB() {
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch MongoDB documents
        const mongoData = await collection.find({}).toArray();

        let addedToIndexedDB = 0;

        mongoData.forEach((doc) => {
            if (!indexedDBData[doc.uuid]) {
                // Add the missing MongoDB data to IndexedDB
                indexedDBData[doc.uuid] = doc;
                addedToIndexedDB++;
            }
        });

        console.log(`MongoDB to IndexedDB Sync: ${addedToIndexedDB} records added to IndexedDB.`);
    } catch (error) {
        console.error('Error syncing MongoDB to IndexedDB:', error);
    } finally {
        await client.close();
    }
}

// Sync function to send new or updated data from IndexedDB to MongoDB
async function syncIndexedDBToMongoDB() {
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Fetch current MongoDB data to compare with IndexedDB
        const mongoData = await collection.find({}).toArray();

        const newDataToInsert = [];

        // Compare IndexedDB data with MongoDB data
        Object.values(indexedDBData).forEach((indexedDoc) => {
            const existsInMongo = mongoData.some((mongoDoc) => mongoDoc.uuid === indexedDoc.uuid);

            if (!existsInMongo) {
                newDataToInsert.push(indexedDoc);
            }
        });

        // Insert new data into MongoDB
        if (newDataToInsert.length > 0) {
            console.log('Preparing to insert the following data into MongoDB:', newDataToInsert);
            const result = await collection.insertMany(newDataToInsert);
            console.log(`Inserted ${result.insertedCount} documents into MongoDB.`);
        } else {
            console.log('No new data to insert into MongoDB.');
        }
    } catch (error) {
        console.error('Error syncing IndexedDB to MongoDB:', error);
    } finally {
        await client.close();
    }
}

// Function to get the count of MongoDB documents
async function getMongoDBDocumentCount() {
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const count = await collection.countDocuments();
        return count;
    } catch (error) {
        console.error('Error getting MongoDB document count:', error);
        return 0;
    } finally {
        await client.close();
    }
}

// Main function to run two-way sync and display document counts
async function runSyncProcess() {
    console.log('=== Starting Two-Way Synchronization ===');

    // Initialize simulated IndexedDB with data
    initializeIndexedDBData();

    // Get initial counts
    const initialMongoCount = await getMongoDBDocumentCount();
    const initialIndexedDBCount = Object.keys(indexedDBData).length;
    console.log(`Initial Counts: MongoDB: ${initialMongoCount}, IndexedDB: ${initialIndexedDBCount}`);

    // Sync MongoDB to IndexedDB
    await syncMongoDBToIndexedDB();

    // Sync IndexedDB to MongoDB
    await syncIndexedDBToMongoDB();

    // Get final counts
    const finalMongoCount = await getMongoDBDocumentCount();
    const finalIndexedDBCount = Object.keys(indexedDBData).length;
    console.log(`Final Counts: MongoDB: ${finalMongoCount}, IndexedDB: ${finalIndexedDBCount}`);

    console.log('=== Synchronization Completed ===');
}

// Run the sync process
runSyncProcess();
