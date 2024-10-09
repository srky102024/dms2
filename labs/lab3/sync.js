const { MongoClient } = require("mongodb");

async function syncMongoAndIndexedDB() {
    const uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"; 
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("lab3");
        const collection = db.collection("objects");

        const indexedDBData = await fetchIndexedDBData();
        for (const object of indexedDBData) {
            await collection.updateOne(
                { id: object.id },
                { $set: object },
                { upsert: true }
            );
        }

        console.log("Sync completed");

    } catch (error) {
        console.error("Error during MongoDB sync", error);
    } finally {
        await client.close();
    }
}

function fetchIndexedDBData() {
    return new Promise((resolve) => {
        const sampleData = [];
        for (let i = 1; i <= 1000; i++) {
            sampleData.push({
                id: i,
                data: `Sample Object ${i}`,
                timestamp: new Date().toISOString(),
            });
        }
        resolve(sampleData);
    });
}

syncMongoAndIndexedDB();