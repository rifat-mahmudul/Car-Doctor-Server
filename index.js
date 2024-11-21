const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

app.use(cors({
    origin : ['http://localhost:5173'],
    credentials : true
}));
app.use(express.json());


const user = process.env.DB_USER;
const pass = process.env.DB_PASS;


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${user}:${pass}@cluster0.ybj57.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        
        const serviceCollection = client.db('ServiceDB').collection('services');
        const ordersCollection = client.db('ServiceDB').collection('orders');

        //auth related api
        app.post('/jwt', async(req, res) => {
            const user = req.body;
            console.log('user for token', user)
            //create a token
            const token = jwt.sign(user, process.env.ACCESS_TOKEN , {expiresIn : "1h"});

            //set cookie
            res
            .cookie('token', token, {
                httpOnly : true,
                secure : true,
                sameSite : 'none'
            })
            .send({success : true})
        })

        app.post('/logout', async(req, res) => {
            const user = req.body;
            console.log('log in out', user)
            res
            .clearCookie('token', 
            {maxAge : 0})
            .send({success: true})
        })

        //create a service Data
        app.post('/services', async(req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        //get all service Data 
        app.get('/services', async(req, res) => {
            const result = await serviceCollection.find().toArray();
            res.send(result);
        })

        //get single service Data
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        //create orders Data
        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        //get single orders Data
        app.get('/orders', async(req, res) => {
            const result = await ordersCollection.find().toArray();
            res.send(result)
        })

        app.delete('/orders/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await ordersCollection.deleteOne(query)
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('SERVER IS RUNNING NOW......');
})

app.listen(port, () => {
    console.log(`server is running from ${port} port number`)
})