const { json } = require('body-parser');
const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3000;
const uri = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3';
const dbName = 'lab3';
const collectionName = '9900';
const client = new MongoClient(uri);
app.use(express.json({ limit: '50mb' }));
app.use('/static', express.static(path.join(__dirname, 'public')));


app.get('/', async(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.post('/SyncMongoFromIndexed', async(req, res) => {
    let data = req.body;
    console.log(data);
    const database = client.db(dbName);
    const col = database.collection(collectionName);
    // remove id field
    data = data.map((item) => {
        delete item.id;
        return item;
    });
    console.log(data);
    await  col.insertMany(data);
    console.log(await col.countDocuments());
    
    res.send('Data received');
});

app.get('/SyncIdxDBFromMongo', async(req, res) => {
    console.log("Syncing IndexedDB from MongoDB");
    try {
        const database = client.db(dbName);
        const col = database.collection(collectionName);
        const data = await col.find({}, { projection: { _id: 0 } }).toArray();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching data');
    }
});
  


async function run() {
    try {
        await client.connect()
        console.log("Connected to the server");
        const database = client.db(dbName);
        const col = database.collection(collectionName);
        const documentCount = await col.countDocuments();
        console.log("Document count:", documentCount);
    }catch (err) {
        console.error(err);
    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log("Server successfully running on port", port);
});