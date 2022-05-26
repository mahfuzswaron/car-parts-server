const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Midlewates
app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4dzbu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

const partsCollection = client.db('parts-db').collection('parts-collection');
const ordersCollection = client.db('orders-db').collection('orders-collection');



async function run() {
  try {
    await client.connect();

    // get all parts
    app.get('/parts', async (req, res) => {
      const result = await partsCollection.find({}).toArray();
      res.send(result);
    });

    // get single product
    app.get('/parts/:id', async (req, res) => {
      const id = ObjectId(req.params.id);
      const result = await partsCollection.findOne({ _id: id });
      res.send(result)
    });

    // place an order 
    app.put('/order', async (req, res) => {
      // const id = ObjectId(req.params.id);
      const email = req.headers.email;
      const order = req.body;
      const productId = order.productId;
      const doc = {
        $set: order
      }
      const result = await ordersCollection.updateOne({ email, productId }, doc, { upsert: true });
      res.send(result)
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