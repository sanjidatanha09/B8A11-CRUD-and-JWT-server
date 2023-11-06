const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lxaloof.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const featuresCollection = client.db('foodShop').collection('features')
        const userCollection = client.db('userfoodshop').collection('user')
        const foodCollection = client.db('foodShop').collection('food')
        const foodrequstCollection = client.db('foodShop').collection('foodrequest')

        //foodrequest related api

        //add food related api
        app.post('/allfood', async (req, res) => {
            const newFood = req.body;
            console.log(newFood);
            const result= await foodCollection.insertOne(newFood);
            res.send(result);
        })

        app.get('/allfood', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/food/:date', async (req, res) => {
            const date = req.params.date;
            const query = { date: date}
            const cursor = await foodCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/onefood/:id', async (req,res) =>{
            const id= req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await foodCollection.findOne(query);
            res.send(result);
        });

    
        

        

       

        // for features related api

        // app.get('/features', async (req, res) => {
        //     const cursor = featuresCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

     
        // app.get('/features/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const options = {
        //         projection: { food_id: 1, food_name: 1, food_img: 1, donator_name: 1, food_quantity: 1, location: 1, expired_date: 1, additional_notes: 1, donator_img :1},
        //     };
        //     const result = await featuresCollection.findOne(query,options);
        //     res.send(result);
        // });

        //user related apis
        app.get('/user' ,async (req,res) =>{
            const cursor = await userCollection.find();
            const users = await cursor.toArray();
            res.send(users);
        });

        app.post('/user', async(req,res) =>{
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
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
    res.send('assignment 11 is runnning')
})

app.listen(port, () => {
    console.log(`assignment 11 server is running on port ${port}`)
})