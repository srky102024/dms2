// sync.js: Node.js script for syncing data (if required)

// Placeholder for syncing data between MongoDB and other databases or files
// Example: If you want to sync local JSON data with MongoDB, add logic here
const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";

async function syncData() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db("lab3");
        const collection = db.collection("test2");

        // Load local data (from a file, for example) and sync with MongoDB
        const data = JSON.parse(fs.readFileSync("indexeddb_export.json", "utf8"));

        if (Array.isArray(data)) {
            await collection.insertMany(data);
            console.log("Data synced successfully with MongoDB!");
        } else {
            console.log("Invalid data format");
        }

        await client.close();
    } catch (err) {
        console.error("Error syncing data:", err);
    }
}

syncData();
