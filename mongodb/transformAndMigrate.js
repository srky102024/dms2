const mongoose = require('mongoose');

// Connect to FlowerDatabase
mongoose.connect('mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/FlowerDatabase')
.then(() => console.log('Connected to FlowerDatabase'))
.catch(err => {
    console.error('Error connecting to FlowerDatabase:', err);
    process.exit(1);
});

// Define schema for FlowerData in FlowerDatabaseTransform
const flowerSchema = new mongoose.Schema({
    name: { type: String, default: 'unset' },
    price: { type: Number, default: 0 },
    // Define other fields here as needed, using 'unset' or default values
}, { collection: 'flowerCollection' });

const FlowerModel = mongoose.model('Flower', flowerSchema);

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function main() {
    try {
        // Connect to FlowerDatabaseTransform
        const transformConnection = mongoose.createConnection('mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/FlowerDatabaseTransform');

        transformConnection.on('connected', async () => {
            console.log('Connected to FlowerDatabaseTransform');

            try {
                // Read data from FlowerDatabase
                const extractDb = mongoose.connection; // Correct use of the default connection
                const extractCollection = extractDb.db.collection('flowerCollection');
                const documents = await extractCollection.find().toArray();
                
                // Transform data
                const transformedDocuments = documents.map(doc => {
                    return {
                        _id: doc._id, // Preserve original _id
                        name: doc.name && doc.name.trim() ? capitalizeFirstLetter(doc.name.trim()) : 'Unset',
                        price: typeof doc.price === 'number' && doc.price > 0 ? doc.price : 0,
                        // Add more transformations as needed, setting defaults to 'unset' for empty values
                    };
                });

                // Insert transformed data into FlowerDatabaseTransform
                const transformDb = transformConnection.db;
                const transformCollection = transformDb.collection('flowerCollection');
                
                // Clear existing data
                await transformCollection.deleteMany({});

                // Insert transformed data
                await transformCollection.insertMany(transformedDocuments);

                console.log('Data transformation and insertion completed.');
                process.exit(0);
            } catch (err) {
                console.error('Error processing data:', err);
                process.exit(1);
            }
        });

        transformConnection.on('error', (err) => {
            console.error('Error connecting to FlowerDatabaseTransform:', err);
            process.exit(1);
        });

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();