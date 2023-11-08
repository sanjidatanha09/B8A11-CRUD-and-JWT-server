const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

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

// own create middleware

const logger = async (req, res, next) => {
    console.log('called', req.hostname, req.originalUrl)
    next();
}

//verify token 
const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    console.log('value of token in middleware', token)
    if (!token) {
        return res.send({ message: 'not authorized' })
        
    }
    next();
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decoded) =>{
    //     //error
    //     if (err) {
    //         console.log(err);
    //         return res.status(401).send({ message: 'unauthorized' })
    //     }
    //     console.log('value in the token', decoded)

    //     req.user = decoded;
    //     next();
    // })

    
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const userCollection = client.db('userfoodshop').collection('user')
        const foodCollection = client.db('foodShop').collection('food')

        const foodrequstCollection = client.db('foodShop').collection('foodrequest')

        //auth related api
        app.post('/jwt', logger, async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    // sameSite: 'none'
                })
                .send({ success: true })

        })

        //foodrequest related api
        app.post('/requestfood', async (req, res) => {
            const requestFood = req.body;
            console.log(requestFood);
            const result = await foodrequstCollection.insertOne(requestFood);
            res.send(result);
        })

        app.get('/requestfood', logger, async (req, res) => {
            const cursor = foodrequstCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/requfood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodrequstCollection.findOne(query);
            res.send(result);
        });


        //some

        app.get('/foodrequest', async (req, res) => {
            console.log(req.query.email);
            // console.log('tok tok', req.cookies.token)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }

            }

            const result = await foodrequstCollection.find(query).toArray();
            console.log(result)
            res.send(result);
        });


        //status changed confirm
        app.patch('/requfood/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }

            const updateFood = req.body;
            console.log(updateFood);
            const updateDoc = {
                $set: {
                    status: updateFood.status
                },
            };
            const result = await foodrequstCollection.updateOne(filter, updateDoc)
            res.send(result);


        });

        //delete
        app.delete('/requfood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodrequstCollection.deleteOne(query);
            res.send(result);
        });






        //add food related api
        app.post('/allfood', async (req, res) => {
            const newFood = req.body;
            console.log(newFood);
            const result = await foodCollection.insertOne(newFood);
            res.send(result);
        })

        app.get('/allfood', logger, async (req, res) => {
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

        app.get('/onefood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query);
            res.send(result);
        });
        //update add food
        app.put('/onefood/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: new ObjectId(id) }
            const updatedFood = req.body;
            console.log(updatedFood)
            const uFood = {
                $set: {

                    foodname: updatedFood.foodname,
                    foodimage: updatedFood.foodimage,
                    foodquantity: updatedFood.foodquantity,
                    location: updatedFood.location,
                    date: updatedFood.date,
                    additionalnotes: updatedFood.additionalnotes,
                    foodstatus: updatedFood.foodstatus,
                    // email:updatedFood.email,
                    // donatorimage: updatedFood.donatorimage,
                    // donatorname: updatedFood.donatorname

                }
            }

            const result = await foodCollection.updateOne(filter, uFood)
            res.send(result);
        })


        app.delete('/allfood/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.deleteOne(query);
            res.send(result);
        });






        app.get('/somefood', logger,verifyToken,  async (req, res) => {
            // console.log(req.query.email);
            // console.log('tok tok',req.cookies.token)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }

            }

            const result = await foodCollection.find(query).toArray();
            console.log(result)
            res.send(result);
        });










        //user related apis
        app.get('/user', async (req, res) => {
            const cursor = await userCollection.find();
            const users = await cursor.toArray();
            res.send(users);
        });

        app.post('/user', async (req, res) => {
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