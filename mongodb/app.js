const express = require('express');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// MongoDB connection
const mongoURI = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/FlowerDatabase';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process if unable to connect
});

// Utility function to flatten nested objects into dot notation paths
function flattenObject(obj, parent = '', res = {}) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const propName = parent ? `${parent}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                flattenObject(obj[key], propName, res);
            } else {
                res[propName] = obj[key];
            }
        }
    }
    return res;
}

// Function to dynamically generate a schema based on attributes
async function getDynamicFlowerSchema() {
    const flowerCollection = mongoose.connection.db.collection('flowerCollection');

    const sampleDocuments = await flowerCollection.find().limit(10).toArray();
    if (sampleDocuments.length === 0) {
        throw new Error('No documents found in the collection to generate schema.');
    }

    const combinedAttributes = {};
    sampleDocuments.forEach(doc => {
        Object.assign(combinedAttributes, flattenObject(doc));
    });

    const dynamicSchemaDefinition = {};
    Object.keys(combinedAttributes).forEach(key => {
        if (key !== '_id.buffer') {  
            if (typeof combinedAttributes[key] === 'string') {
                dynamicSchemaDefinition[key] = { type: String, default: '' };
            } else if (typeof combinedAttributes[key] === 'number') {
                dynamicSchemaDefinition[key] = { type: Number, default: 0 };
            } else {
                dynamicSchemaDefinition[key] = { type: mongoose.Schema.Types.Mixed, default: null };
            }
        }
    });

    dynamicSchemaDefinition['_id'] = { type: mongoose.Schema.Types.ObjectId, default: null };

    return {
        schema: new mongoose.Schema(dynamicSchemaDefinition, { collection: 'flowerCollection' }),
        schemaKeys: Object.keys(dynamicSchemaDefinition)
    };
}

let FlowerModel;
let schemaKeys;

mongoose.connection.once('open', async () => {
    try {
        const { schema, schemaKeys: keys } = await getDynamicFlowerSchema();
        FlowerModel = mongoose.model('Flower', schema);
        schemaKeys = keys;
        console.log('Dynamic Flower schema created with keys:', schemaKeys);
    } catch (err) {
        console.error('Error creating dynamic schema:', err);
    }
});

app.get('/', async (req, res) => {
    try {
        if (!FlowerModel) {
            return res.status(500).send('Schema not initialized yet. Please try again later.');
        }

        const totalDocuments = await FlowerModel.countDocuments();

        const incompleteFieldsCondition = schemaKeys.map(key => {
            if (key === '_id') {
                return {};
            }
            return typeof FlowerModel.schema.paths[key].instance === 'Number'
                ? { [key]: { $lte: 0 } }
                : { [key]: { $in: ['', null] } };
        });

        const incompleteDocumentsCount = await FlowerModel.countDocuments({
            $or: incompleteFieldsCondition
        });

        const incompletePercentage = totalDocuments > 0
            ? ((incompleteDocumentsCount / totalDocuments) * 100).toFixed(2)
            : 0;

        const duplicateField = 'name';
        const duplicates = await FlowerModel.aggregate([
            { $group: { _id: `$${duplicateField}`, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        const duplicateCount = duplicates.reduce((acc, curr) => acc + curr.count, 0);

        const outliers = await FlowerModel.countDocuments({ price: { $gt: 1000 } });

        const attributeCounts = {};
        const attributeAvailability = {};

        for (const key of schemaKeys) {
            if (key !== '_id.buffer' && !key.startsWith('_id')) {
                const count = await FlowerModel.countDocuments({
                    [key]: { $ne: null, $nin: ['', 0] }
                });
                attributeCounts[key] = count;
                attributeAvailability[key] = {
                    count: count,
                    percentage: totalDocuments > 0 ? ((count / totalDocuments) * 100).toFixed(2) : 0
                };
            }
        }

        attributeCounts['_id'] = await FlowerModel.countDocuments({ '_id': { $exists: true } });
        attributeAvailability['_id'] = {
            count: attributeCounts['_id'],
            percentage: totalDocuments > 0 ? ((attributeCounts['_id'] / totalDocuments) * 100).toFixed(2) : 100
        };

        const sortedAttributes = Object.entries(attributeAvailability)
            .sort(([a], [b]) => a.localeCompare(b));

        res.send(`
            <html>
            <head>
                <title>Flower Store Dashboard</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    h1 { color: #4CAF50; font-size: 28px; text-align: center; }
                    .metrics {
                        display: flex;
                        justify-content: space-around;
                        margin-bottom: 30px;
                        flex-wrap: wrap;
                    }
                    .metric-box {
                        background-color: #f0f8ff;
                        border: 1px solid #ddd;
                        padding: 20px;
                        text-align: center;
                        border-radius: 8px;
                        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                        min-width: 250px;
                        max-width: 300px;
                        margin: 10px;
                    }
                    .metric-box h3 {
                        margin: 0;
                        color: #4CAF50;
                        font-size: 20px;
                    }
                    .metric-box p {
                        margin: 10px 0 0;
                        font-size: 36px;
                        font-weight: bold;
                        color: #333;
                    }
                    .attribute-box {
                        padding: 20px;
                        background-color: #fff;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        min-width: 250px;
                        max-width: 100%;
                        margin-bottom: 30px;
                    }
                    .attribute-box h3 {
                        margin-bottom: 20px;
                        font-size: 22px;
                        color: #4CAF50;
                    }
                    .attribute-box table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .attribute-box th, .attribute-box td {
                        padding: 10px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    .attribute-box th {
                        background-color: #f4f4f4;
                        color: #4CAF50;
                        font-size: 18px;
                    }
                    .attribute-box td {
                        font-size: 16px;
                    }
                    .warning-icon {
                        color: #FF5722;
                        font-size: 18px;
                    }
                    .summary-details {
                        cursor: pointer;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 10px;
                        margin-bottom: 10px;
                        background-color: #f9f9f9;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .summary-details:hover {
                        background-color: #e9e9e9;
                    }
                </style>
            </head>
            <body>
                <h1>Flower Store Dashboard</h1>
                <div class="metrics">
                    <div class="metric-box">
                        <h3>Total Documents</h3>
                        <p>${totalDocuments}</p>
                    </div>
                    <div class="metric-box">
                        <h3>Incomplete Documents</h3>
                        <p>${incompleteDocumentsCount} (${incompletePercentage}%)</p>
                    </div>
                    <div class="metric-box">
                        <h3>Duplicates</h3>
                        <p>${duplicateCount}</p>
                    </div>
                    <div class="metric-box">
                        <h3>Outliers (Price > 1000)</h3>
                        <p>${outliers}</p>
                    </div>
                </div>
                <div class="attribute-box">
                    <h3>Attribute Availability</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Attribute</th>
                                <th>Count</th>
                                <th>Percentage</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedAttributes.map(([key, { count, percentage }]) => `
                                <tr>
                                    <td>${key}</td>
                                    <td>${count}</td>
                                    <td>${percentage}%</td>
                                    <td>${percentage < 50 ? '<span class="warning-icon">&#9888;</span>' : ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        console.error('Error fetching flower data:', err);
        res.status(500).send('Error fetching flower data');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});