const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

async function syncData() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('syncDB');
        const collection = database.collection('objects');

        const documents = Array.from({ length: 1000 }, (_, i) => ({
            uuid: uuidv4(),
            source: 'IndexedDB',
            createdAt: new Date(),
            updatedAt: new Date(),
            attribute1: `Value1-${i}`,
            attribute2: `Value2-${i}`,
            attribute3: `Value3-${i}`,
        }));

        const result = await collection.insertMany(documents);
        console.log(`${result.insertedCount} documents were inserted.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

syncData();
