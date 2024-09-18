const mongoose = require('mongoose');

// Connect to FlowerDatabaseTransform
mongoose.connect('mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/FlowerDatabaseTransform', {
    // Removed deprecated options
})
.then(() => {
    console.log('Connected to FlowerDatabaseTransform');
    main();
})
.catch(err => {
    console.error('Error connecting to FlowerDatabaseTransform:', err);
    process.exit(1);
});

async function main() {
    try {
        // Connect to FlowerDatabaseLoad
        const loadConnection = mongoose.createConnection('mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/FlowerDatabaseLoad', {
            // Removed deprecated options
        });

        loadConnection.on('connected', async () => {
            console.log('Connected to FlowerDatabaseLoad');
            
            try {
                // Read data from FlowerDatabaseTransform
                const transformDb = mongoose.connection.db;  // Ensure we are using the db property correctly
                const transformCollection = transformDb.collection('flowerCollection');
                const transformedDocuments = await transformCollection.find().toArray();
                
                // Filter out documents with 'unset' values
                const validDocuments = transformedDocuments.filter(doc => 
                    doc.name !== 'unset' && doc.price !== 0 // Adjust these checks according to your needs
                );
                
                // Insert data into FlowerDatabaseLoad
                const loadDb = loadConnection.db;
                const loadCollection = loadDb.collection('flowerCollection');
                
                // Clear existing data
                await loadCollection.deleteMany({});

                // Insert new data
                if (validDocuments.length > 0) {
                    await loadCollection.insertMany(validDocuments);
                }

                console.log('Data migration to FlowerDatabaseLoad completed.');
                process.exit(0);
            } catch (err) {
                console.error('Error processing data:', err);
                process.exit(1);
            }
        });

        loadConnection.on('error', (err) => {
            console.error('Error connecting to FlowerDatabaseLoad:', err);
            process.exit(1);
        });

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}