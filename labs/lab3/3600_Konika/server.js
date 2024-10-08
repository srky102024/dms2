const express = require('express');
const cors = require('cors');  // Import the CORS middleware
const uuid = require('uuid');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3005; // Port for your Express server

const mongoURI = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const mongoCollection = "3600_Konika_lab3mongo";

// Use CORS middleware to allow cross-origin requests
app.use(cors({
    origin: 'http://127.0.0.1:8000', // Specify the allowed origin
    methods: ['GET', 'POST'], // Specify the allowed methods
}));

app.use(bodyParser.json({ limit: '10mb' }));

// Route for root '/'
app.get('/', (req, res) => {
    res.send('Welcome to the Sync Server!');
});

// Sync route to handle POST requests from IndexedDB
app.post('/sync', async (req, res) => {
    try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db();
        const collection = db.collection(mongoCollection);

        const indexedDBData = req.body;

        const result = await collection.insertMany(indexedDBData);

        console.log(`${result.insertedCount} documents inserted.`);
        res.status(200).send(`${result.insertedCount} documents successfully synced to MongoDB.`);

        await client.close();
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).send('Error syncing data');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
