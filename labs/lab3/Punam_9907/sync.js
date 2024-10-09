// sync.js (Node.js Script)
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";

// Connect to MongoDB
async function fetchMongoDBData() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('lab3');
        const collection = database.collection('9907_Punam_objects');

        // Fetch all data from MongoDB
        const mongoData = await collection.find({}).toArray();
        return mongoData;
    } finally {
        await client.close();
    }
}

// Expose an API endpoint to fetch the MongoDB data
const express = require('express');
const app = express();
const port = 3000;

app.get('/fetchMongoData', async (req, res) => {
    try {
        const mongoData = await fetchMongoDBData();
        res.json(mongoData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
