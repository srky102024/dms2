// sync.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));

// MongoDB connection
mongoose.connect('mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema and model for MongoDB
const dataSchema = new mongoose.Schema({
    uuid: String,
    source_database: String,
    created_at: Date,
    updated_at: Date,
    product_name: String,
    count: Number,
    availability_in_stock: Boolean,
});

const DataModel = mongoose.model('Data', dataSchema, '3569_ChalamalashettyShcharathPavan');

// API endpoint to get data from MongoDB
app.get('/api/data', async (req, res) => {
    try {
        const data = await DataModel.find({});
        res.json(data);
    } catch (error) {
        res.status(500).send(error);
    }
});

// API endpoint to sync data to MongoDB
app.post('/api/data', async (req, res) => {
    try {
        const data = req.body; // Expecting an array of objects
        await DataModel.deleteMany({}); // Clear existing data (for simplicity)
        await DataModel.insertMany(data); // Insert new data
        res.status(200).send('Data synced successfully!');
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
