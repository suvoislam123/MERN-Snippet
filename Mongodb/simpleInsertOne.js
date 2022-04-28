const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000;
const uri = "mongodb+srv://dbuser1:5weyKSiHPn34tBq2@cluster0.ptwly.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run()
{
    try {
        await client.connect();
        const usersCollection = client.db("foodExpress").collection("users");
        const user = { name: "Shuvo Islam", email: "suvoislam753@gmail.com" }
        const result = await usersCollection.insertOne(user);
        console.log(`User inserted with ${result.insertedId}`);

    }
    finally {
        
    }
}
run().catch(console.log("A error occured"))

app.get('/', (req, res) => {
    res.send("The server is runnig")
});
app.post('', (req, res) => {
    
});
app.listen(port, () => {
    console.log('CRUD server is running');
})
// user name: dbuser1
// password: 5weyKSiHPn34tBq2