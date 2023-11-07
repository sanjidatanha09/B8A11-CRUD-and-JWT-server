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

       
        const userCollection = client.db('userfoodshop').collection('user')
        const foodCollection = client.db('foodShop').collection('food')

        const foodrequstCollection = client.db('foodShop').collection('foodrequest')

        //foodrequest related api
        app.post('/requestfood', async (req, res) => {
            const requestFood = req.body;
            console.log(requestFood);
            const result = await foodrequstCollection.insertOne(requestFood);
            res.send(result);
        })

        app.get('/requestfood', async (req, res) => {
            const cursor = foodrequstCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/requestfood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                sort: { "imdb.rating": -1 },

                projection: { foodname: 1, foodid: 1, quantity: 1 },
            };
            const result = await foodrequstCollection.findOne(query);
            res.send(result);
        })


     


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
        // app.get('/food/:date', async (req, res) => {
        //     const date = req.params.date;
        //     const query = { date: date}
        //     const cursor = await foodCollection.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        app.get('/onefood/:id', async (req,res) =>{
            const id= req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await foodCollection.findOne(query);
            res.send(result);
        });


        app.delete('/allfood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query);
            res.send(result);
        });

        //status changed confirm
        app.patch('allfood/:id', async (req,res) =>{
            const id = req.params.id;
            const filter = {_id : new ObjectId(id)}

            const updateFood = req.body;
            console.log(updateFood);
            const updateDoc = {
                $set:{
                    status: updateFood.foodstatus
                },
            };
            const result = await foodCollection.updateOne(filter, updateDoc)
            res.send(result);


        });

        app.get('/somefood', async (req, res) => {
            console.log(req.query.email);
            let query ={};
            if (req. query?.email){
                query = { email: req.query.email }

            }
            
            const result = await foodCollection.find(query).toArray();
            console.log(result)
            res.send(result);
        });

    
        

        

       

 

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