const { MongoClient } = require("mongodb");

async function syncMongoAndIndexedDB() {
    const uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"; 
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        // Get MongoDB Collection
        const db = client.db("lab3");
        const collection = db.collection("objects");

        // Sync from IndexedDB (browser part)
        const indexedDBData = await fetchIndexedDBData();

        // Insert or update in MongoDB
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

// Placeholder for IndexedDB data fetch simulation
function fetchIndexedDBData() {
    // Normally you'd get this from IndexedDB using IndexedDB API or through browser interaction
    // Simulate IndexedDB data here for demo purposes:
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