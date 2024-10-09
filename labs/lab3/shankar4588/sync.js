const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3005;

// MongoDB connection URI
const mongoURI = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3?retryWrites=true&w=majority";
const mongoCollection = "shankar_data";  // Collection name

// Middleware
app.use(cors()); // Use CORS middleware
app.use(bodyParser.json());

// Route for root '/'
app.get('/', (req, res) => {
    res.send('Welcome to the Sync Server!');
});

// Sync route to handle POST requests from IndexedDB
app.post('/sync', async (req, res) => {
    try {
        const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db('lab3');  // Database name
        const collection = db.collection(mongoCollection);  // Collection name

        const indexedDBData = req.body; // Data sent from IndexedDB

        console.log('Received data:', indexedDBData);  // Log received data

        const result = await collection.insertMany(indexedDBData);

        console.log(`${result.insertedCount} documents inserted.`);
        res.status(200).send(`${result.insertedCount} documents successfully synced to MongoDB.`);
        
        await client.close();  // Close the connection
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).send('Error syncing data');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
