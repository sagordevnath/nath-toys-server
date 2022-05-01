const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k7yl5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const toysCollection = client.db('nathToys').collection('inventory');

        // get all data from mongodb
        app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = toysCollection.find(query);
            const toys = await cursor.toArray();

            res.send(toys);
        })

        // get single data in mongodb
        app.get('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query= {_id: ObjectId(id)};
            const result = await toysCollection.findOne(query);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Nath toys is running')
})

app.listen(port, () => {
    console.log('Nath toys is start', port);
})