const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser'); 


function generateTasks(num) {
    let tasks = [];
    for (let i = 1; i <= num; i++) {
        let task = {
            uuid: uuidv4(),
            created_at: new Date(),
            updated_at: new Date(),
            source: "MongoDB",
            task_number: `task${i}`,
            computing_cost: Math.floor(Math.random() * 100) + 1,
            status: Math.random() < 0.5 ? "processing" : "done"
        };
        tasks.push(task);
    }
    return tasks;
}

const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017/';
const dbName = 'lab3';
const collectionName = '9744Operations';
const client = new MongoClient(uri);

app.use('/static', express.static(path.join(__dirname, 'public')));
app.get('/', async(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function run() {
    try {
        await client.connect()
        const database = client.db(dbName);
        const col = database.collection(collectionName);
        const documentCount = await col.countDocuments();
        if(documentCount===0){           
            const taskList = generateTasks(1000);
            col.insertMany(taskList);
        }
        else{
            console.log(documentCount);
            
        }
    }catch (err) {
        console.error(err);
    }
}
run().catch(console.dir);

app.post('/sync', async(req, res) => {
    let data = req.body;
    console.log(data);
    const database = client.db(dbName);
    const col = database.collection(collectionName);
    console.log(data);
    await  col.insertMany(data);
    console.log(await col.countDocuments());
    
    res.send('Data received');
});


app.get('/fetch-mongo-data', async (req, res) => {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Fetch all documents from MongoDB
        const data = await collection.find({}, { projection: { _id: 0 } }).toArray();

        res.status(200).json(data);  // Send the data back as JSON
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch data from MongoDB.' });
    }
});

app.listen(port, () => {
    console.log("Server successfully running on port", port);
});
