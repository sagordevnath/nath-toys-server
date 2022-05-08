const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k7yl5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const toysCollection = client.db('nathToys').collection('inventory');
        const MyCollection = client.db('nathToys').collection('myInventory');

        //AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // get all API
        app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = toysCollection.find(query);
            const toys = await cursor.toArray();

            res.send(toys);
        })

        // get single API
        app.get('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const query= {_id: ObjectId(id)};
            const result = await toysCollection.findOne(query);
            res.send(result);
        })

        // update API       
        app.put('/inventory/:id', async(req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body;
            const query = {_id: ObjectId(id)};
            const options = { upsert: true };
            const update = {$set: 
                {
                    quantity: updatedQuantity.newNumber
                }
            };
            const result = await toysCollection.updateOne(query, update, options);
            res.send(result);
        })

        // delete API
        app.delete('/inventory/:id', async(req, res) => {  
            const id = req.params.id;          
            const query = {_id: ObjectId(id)};
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })

        // POST API
        app.post('/inventory', async(req, res)=> {            
            const myInventory = req.body;            
            const result = await toysCollection.insertOne(myInventory);
            res.send(result);
        })

        // get my items API
        app.get('/inventory', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = toysCollection.find(query);
                const myInventory = await cursor.toArray();
                res.send(myInventory);
            }
            else{
                res.status(403).send({message: 'Forbidden access'})
            }
        })

        
    } catch(err) {
        console.error(err);    
        

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