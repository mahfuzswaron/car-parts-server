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
const stripe = require("stripe")('sk_test_51L43pvI3zaZwZcFaigeBxW4X2pVMxoJ0lO4LMu5DQNOs1o5VuyKZ2fc5vHCGrjIUbkmJFuhDfNjWpn6DYDlLblY300XkaojJ8O');

const client = new MongoClient(uri);

const partsCollection = client.db('parts-db').collection('parts-collection');
const ordersCollection = client.db('orders-db').collection('orders-collection');
const reviewsCollection = client.db('reviews-db').collection('reviews-collection');
const profilesCollection = client.db('profiles-db').collection('profiles-collection');
const usersCollection = client.db('users-db').collection('profiles-collection');

const calculateOrderAmount = amount => {
  return amount * 100;
}

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
    });

    // get all orders 
    app.get('/orders', async (req, res) => {
      const email = req.headers.email;
      const result = await ordersCollection.find({ email }).toArray();
      console.log(result);
      res.send(result)
    });

    // delete order
    app.delete('/deleteorder/:id', async (req, res) => {
      const id = ObjectId(req.params.id);
      const result = await ordersCollection.deleteOne({ _id: id });
      res.send(result);
    })

    // add review
    app.put('/addreview', async (req, res) => {
      const email = req.headers.email;
      const review = req.body;
      const doc = {
        $set: review
      }
      const result = await reviewsCollection.updateOne({ email }, doc, { upsert: true });
      res.send(result);
    });

    // get all reviews
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });

    // put profiles
    app.put('/users', async (req, res) => {
      const email = req.headers.email;
      const user = req.body;
      const doc = {
        $set: user
      }
      const result = await usersCollection.updateOne({ email }, doc, { upsert: true });
      res.send(result);
    });

    // get all users
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result)
    });










    // payment route 
    app.post("/create-payment-intent", async (req, res) => {
      const product = req.body;
      const amount = product.price;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(amount),
        currency: "usd",
        automatic_payment_methods: ["Card"]
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });


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