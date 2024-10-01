const express = require('express');
const path = require('path'); // For serving static files
const neo4j = require('neo4j-driver');
const { MongoClient } = require('mongodb'); // MongoDB driver

const app = express();
const port = 3000;

// Neo4j connection details
const uri = "neo4j+s://184d26be.databases.neo4j.io:7687";
const user = "dbms2024";
const password = "dbms2024";

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// MongoDB connection details
const mongoUri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/";
const mongoClient = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB once, and reuse the connection
mongoClient.connect()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

// Serve static files like dashboard.html
app.use(express.static(path.join(__dirname)));

// Serve the dashboard.html file when user accesses the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Neo4j stats API
app.get('/neo4j-stats', async (req, res) => {
    const session = driver.session();
    try {
        const nodeCountResult = await session.run('MATCH (n) RETURN COUNT(n) AS nodeCount');
        const relationshipCountResult = await session.run('MATCH ()-[r]->() RETURN COUNT(r) AS relationshipCount');

        // Get the count values from the result records
        const nodeCount = typeof nodeCountResult.records[0].get('nodeCount') === 'object'
            ? nodeCountResult.records[0].get('nodeCount').low
            : nodeCountResult.records[0].get('nodeCount');

        const relationshipCount = typeof relationshipCountResult.records[0].get('relationshipCount') === 'object'
            ? relationshipCountResult.records[0].get('relationshipCount').low
            : relationshipCountResult.records[0].get('relationshipCount');

        res.json({ nodes: nodeCount, edges: relationshipCount });
    } catch (error) {
        console.error('Error fetching Neo4j stats:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        await session.close();
    }
});

// Baseline counts for delta calculation (could be stored in a config or database)
const baselineCounts = {
    FlowerDatabase: 0,
    FlowerDatabaseLoad: 0,
    FlowerDatabaseTransform: 0
};

// Randomness function
const getRandomOffset = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// MongoDB stats API for three different databases
// MongoDB stats API for three different databases
app.get('/mongodb-stats', async (req, res) => {
    try {
        // Connect to the different databases
        const db1 = mongoClient.db('FlowerDatabase'); // First database
        const db2 = mongoClient.db('FlowerDatabaseLoad'); // Second database
        const db3 = mongoClient.db('FlowerDatabaseTransform'); // Third database

        // Function to count documents with null or empty fields
        const countNullOrEmptyFields = async (db, collectionName) => {
            return await db.collection(collectionName).aggregate([
                {
                    $match: {
                        $or: [
                            { 'name': { $exists: false } },
                            { 'name': { $eq: null } },
                            { 'name': { $eq: '' } },
                            { 'price': { $exists: false } },
                            { 'price': { $eq: null } },
                            { 'price': { $eq: '' } }
                        ]
                    }
                },
                {
                    $count: "count"
                }
            ]).toArray();
        };

        // Fetch the count of documents from the 'flowerCollection' in each database
        const flowerCount1 = await db1.collection('flowerCollection').countDocuments();
        const flowerCount2 = await db2.collection('flowerCollection').countDocuments();
        const flowerCount3 = await db3.collection('flowerCollection').countDocuments();

        // Count null or empty fields for each collection
        const nullCount1 = await countNullOrEmptyFields(db1, 'flowerCollection');
        const nullCount2 = await countNullOrEmptyFields(db2, 'flowerCollection');
        const nullCount3 = await countNullOrEmptyFields(db3, 'flowerCollection');

        // Extract count or return 0 if no null/empty results
        const countNull1 = nullCount1.length > 0 ? nullCount1[0].count : 0;
        const countNull2 = nullCount2.length > 0 ? nullCount2[0].count : 0;
        const countNull3 = nullCount3.length > 0 ? nullCount3[0].count : 0;

        // Generate random deltas
        const deltaLoadFlowerDatabase = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10);
        const deltaLoadFlowerDatabaseLoad = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10);
        const deltaLoadFlowerDatabaseTransform = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10);

        // Respond with the count from each collection and null/empty field count
        res.json({
            FlowerDatabase: flowerCount1,
            FlowerDatabaseNull: countNull1,
            FlowerDatabaseLoad: flowerCount2,
            FlowerDatabaseLoadNull: countNull2,
            FlowerDatabaseTransform: flowerCount3,
            FlowerDatabaseTransformNull: countNull3,
            DeltaLoadFlowerDatabase: (deltaLoadFlowerDatabase >= 0 ? `+${deltaLoadFlowerDatabase}` : deltaLoadFlowerDatabase),
            DeltaLoadFlowerDatabaseLoad: (deltaLoadFlowerDatabaseLoad >= 0 ? `+${deltaLoadFlowerDatabaseLoad}` : deltaLoadFlowerDatabaseLoad),
            DeltaLoadFlowerDatabaseTransform: (deltaLoadFlowerDatabaseTransform >= 0 ? `+${deltaLoadFlowerDatabaseTransform}` : deltaLoadFlowerDatabaseTransform),
        });
    } catch (error) {
        console.error('Error fetching MongoDB stats:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Keep the MongoDB connection open and do not close it
// No need to close MongoDB connection unless on app shutdown

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});