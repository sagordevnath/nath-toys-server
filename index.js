const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k7yl5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("nathToys").collection("toy");
  // perform actions on the collection object
  console.log('Mongo is connected')
  client.close();
});


app.get('/', (req, res) => {
    res.send('Nath toys is running')
})

app.listen(port, () => {
    console.log('Nath toys is start', port);
})