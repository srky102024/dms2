const express = require('express');
const uuid = require('uuid');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3005;

const mongoURI = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const mongoCollection = "3600_Konika_lab3mongo";

// Middleware
app.use(bodyParser.json());

// Route for root '/'
app.get('/', (req, res) => {
    res.send('Welcome to the Sync Server!');
});

// Sync route to handle POST requests from IndexedDB
app.post('/sync', async (req, res) => {
    try {
        // Connect to MongoDB
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db();
        const collection = db.collection(mongoCollection);

        // Data sent from IndexedDB (you can modify how this is structured based on your front-end)
        const indexedDBData = req.body;

        // Insert the IndexedDB data into MongoDB
        const result = await collection.insertMany(indexedDBData);

        console.log(`${result.insertedCount} documents inserted.`);
        res.status(200).send(`${result.insertedCount} documents successfully synced to MongoDB.`);
        
        await client.close();  // Close the connection
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).send('Error syncing data');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
