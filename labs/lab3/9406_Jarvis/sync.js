import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
// MongoDB connection URI
const uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";

// Function to fetch data from IndexedDB
async function getIndexedDBData() {
    // Placeholder for IndexedDB interaction; in a real scenario, data from the web app would be collected
    return [
        {
            uuid: 'example-uuid',
            source_db: 'IndexedDB',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            attribute_1: 42,
            attribute_2: 'B',
            attribute_3: 0.99
        }
    ];
}

// Function to sync IndexedDB data to MongoDB
async function syncData() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    try {
        await client.connect();
        console.log("Connected to MongoDB.");
        
        const db = client.db("lab3");
        const collection = db.collection("9406_Jarvis"); // Replace "1234" with the last four digits of your student ID

        const indexedDBData = await getIndexedDBData();
        if (indexedDBData.length > 0) {
            await collection.insertMany(indexedDBData);
            console.log("Data synced successfully from IndexedDB to MongoDB.");
        } else {
            console.log("No data found to sync.");
        }
    } catch (err) {
        console.error("Error occurred while syncing data:", err);
    } finally {
        await client.close();
    }
}

syncData();
