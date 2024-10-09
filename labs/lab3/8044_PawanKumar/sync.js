import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors'; // Import CORS

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Increase the limit for the JSON body (set to 10MB in this case)
app.use(express.json({ limit: '10mb' }));  // Set the limit as needed

// MongoDB connection details
const mongoUri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3";
const mongoDbName = "lab3";
const mongoCollectionName = "8044_PawanKumar";

const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB once when the server starts
client.connect().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.error("Failed to connect to MongoDB:", err));

// Endpoint to insert IndexedDB data into MongoDB
app.post('/insert', async (req, res) => {
    const indexedData = req.body; // Get data from the request body

    try {
        const db = client.db(mongoDbName);
        const collection = db.collection(mongoCollectionName);

        // Insert the data into MongoDB
        const result = await collection.insertMany(indexedData);

        res.status(200).send(`Inserted ${result.insertedCount} documents into MongoDB`);
    } catch (error) {
        console.error('Error inserting into MongoDB:', error);
        res.status(500).send('Error inserting data');
    }
});

// Endpoint to query data from MongoDB
app.get('/query', async (req, res) => {
    try {
        const db = client.db(mongoDbName);
        const collection = db.collection(mongoCollectionName);

        // Retrieve all documents from the collection
        const documents = await collection.find({}).toArray();
        res.status(200).json(documents);
    } catch (error) {
        console.error('Error querying MongoDB:', error);
        res.status(500).send('Error querying data');
    }
});

// Shutdown gracefully
process.on('SIGINT', async () => {
    await client.close();
    console.log("MongoDB connection closed. Server exiting...");
    process.exit(0);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
