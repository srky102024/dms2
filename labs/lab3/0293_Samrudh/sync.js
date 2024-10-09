const fs = require('fs');
const { MongoClient } = require('mongodb');

const mongoUri = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3';
const dbName = 'lab3';
const collectionName = '0293';

function loadSimulatedIndexedDB() {
    const data = fs.readFileSync('lab3.0293.json', 'utf-8');
    return JSON.parse(data);
}

async function syncDataToMongoDB(data) {
    try {
        const client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const syncPromises = data.map(async (object) => {
            const { uuid, _id, ...updateObject } = object;
            const existingRecord = await collection.findOne({ uuid: object.uuid });

            if (existingRecord) {
                await collection.updateOne({ uuid: object.uuid }, { $set: updateObject });
            } else {
                await collection.insertOne(object);
            }
        });

        await Promise.all(syncPromises);
        await client.close();
        console.log('Sync to MongoDB completed successfully!');
    } catch (error) {
        console.error('Error syncing data to MongoDB:', error);
    }
}


async function main() {
    console.log('Loading data from simulated IndexedDB...');
    const simulatedData = loadSimulatedIndexedDB();
    console.log(`Found ${simulatedData.length} objects in simulated IndexedDB.`);
    await syncDataToMongoDB(simulatedData);
}

main();

