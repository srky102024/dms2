const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const url = 'mongodb://localhost:27017';
const dbName = 'flowerDatabase';

app.get('/api/flowers', async (req, res) => {
    console.log('Received a request for /api/flowers');
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        const collection = db.collection('flowerCollection');
    
        // Aggregation pipeline to count null or empty values
        const aggregation = [
            {
                $group: {
                    _id: null,
                    nameNullCount: {
                        $sum: {
                            $cond: [
                                { $or: [{ $eq: ["$name", null] }, { $eq: ["$name", ""] }] },
                                1,
                                0
                            ]
                        }
                    },
                    colorNullCount: {
                        $sum: {
                            $cond: [
                                { $or: [{ $eq: ["$color", null] }, { $eq: ["$color", ""] }] },
                                1,
                                0
                            ]
                        }
                    },
                    descNullCount: {
                        $sum: {
                            $cond: [
                                { $or: [{ $eq: ["$description", "unset"] }, { $eq: ["$description", null] }, { $eq: ["$description", ""] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ];

        const [result] = await collection.aggregate(aggregation).toArray();

        if (result) {
            res.json({
                nameNullCount: result.nameNullCount,
                colorNullCount: result.colorNullCount,
                descNullCount: result.descNullCount
            });
        } else {
            res.json({ nameNullCount: 0, colorNullCount: 0, descNullCount: 0 });
        }
    } catch (error) {
        console.error('Error fetching flowers:', error);
        res.status(500).json({ error: 'Failed to fetch flowers' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});