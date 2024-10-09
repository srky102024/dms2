const { MongoClient } = require('mongodb');
const Datastore = require('nedb');
const { v4: uuidv4 } = require('uuid');

// MongoDB Connection String (use the working URI you tested with earlier)
const mongoURI = 'mongodb://localhost:27017/';
const dbName = 'syncDB';
const collectionName = 'syncCollection';

// Simulate IndexedDB using NeDB (an in-memory database)
const indexedDB = new Datastore({ filename: './indexedDB.db', autoload: true });

// Function to fetch all records from IndexedDB (NeDB)
function getIndexedDBData() {
    return new Promise((resolve, reject) => {
        indexedDB.find({}, (err, docs) => {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
}

// Main function to sync MongoDB and IndexedDB
async function syncDatabases() {
    const client = new MongoClient(mongoURI);

    try {
        // Connect to MongoDB and wait for connection
        await client.connect();
        console.log('Connected to MongoDB');

        const mongoDB = client.db(dbName);
        const mongoCollection = mongoDB.collection(collectionName);

        // Fetch data from IndexedDB
        const indexedDBData = await getIndexedDBData();
        console.log('Data from IndexedDB:', indexedDBData);

        // Fetch data from MongoDB
        const mongoData = await mongoCollection.find({}).toArray();
        console.log('Data from MongoDB:', mongoData);

        // Compare both databases and insert missing data
        const missingInMongoDB = indexedDBData.filter(indexedObj => {
            return !mongoData.find(mongoObj => mongoObj.uuid === indexedObj.uuid);
        });

        const missingInIndexedDB = mongoData.filter(mongoObj => {
            return !indexedDBData.find(indexedObj => indexedObj.uuid === mongoObj.uuid);
        });

        // Insert missing data into MongoDB
        if (missingInMongoDB.length > 0) {
            await mongoCollection.insertMany(missingInMongoDB);
            console.log(`Inserted ${missingInMongoDB.length} records into MongoDB`);
        }

        // Insert missing data into IndexedDB
        for (const doc of missingInIndexedDB) {
            await new Promise((resolve, reject) => {
                indexedDB.insert(doc, (err, newDoc) => {
                    if (err) reject(err);
                    else resolve(newDoc);
                });
            });
        }
        console.log(`Inserted ${missingInIndexedDB.length} records into IndexedDB`);

        // Log the counts of both databases after sync
        const finalMongoData = await mongoCollection.find({}).toArray();
        indexedDB.count({}, (err, finalIndexedDBCount) => {
            if (err) console.error('Error counting IndexedDB:', err);
            console.log(`MongoDB document count: ${finalMongoData.length}`);
            console.log(`IndexedDB object count: ${finalIndexedDBCount}`);
        });

    } catch (err) {
        console.error('Error during sync:', err);
    } finally {
        await client.close();
    }
}

// Function to simulate generating and adding new data to IndexedDB
function generateAndAddDataToIndexedDB() {
    const data = [];
    for (let i = 0; i < 10; i++) {
        data.push({
            uuid: uuidv4(),
            source_db: 'IndexedDB',
            created_at: new Date(),
            updated_at: new Date(),
            quantity: Math.floor(Math.random() * 100) + 1,
            status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
            type: ['internship', 'full-time', 'part-time'][Math.floor(Math.random() * 3)]
        });
    }

    indexedDB.insert(data, (err, newDocs) => {
        if (err) console.error('Error inserting into IndexedDB:', err);
        console.log(`Inserted ${newDocs.length} new objects into IndexedDB`);
    });
}

// Generate and add some initial data to IndexedDB
generateAndAddDataToIndexedDB();

// Sync the databases after the data is generated
setTimeout(syncDatabases, 2000);  // Wait 2 seconds for the data to be inserted, then sync
