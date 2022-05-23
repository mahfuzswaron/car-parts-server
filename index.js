const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Midlewates
app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4dzbu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

const partsCollection = client.db('car-parts').collection('parts-collection');



async function run() {
  try {
    await client.connect();

    // get all parts
    app.get('/parts', async (req, res) => {
      const result = await partsCollection.find({}).toArray();
      res.send(result);

    })

  }
  finally {

  }
}
run().catch(e => console.log(e.message))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})