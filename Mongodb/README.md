* Create a node server with 5 steps
  * 1.1.create folder
  * 1.2.npm init
  * 1.3.npm i express cors mongodb
  * 1.4.script - dev: nodemon index.js
  * 1.5.create index.js
  * 1.6.use 5 steps to create a node server

* Create Atlas Account
  * 1. sign up.google acces
  * 2. create cluster
  * 3. Create user dbUser and password
  * 4. Network Access-- > ip address: allow all
  * 5. Database > Connect -> code copy in index.js 
***
 ## CRUD Operation
***
### in Server side
* 1. node mongodb CRUD > Fundamentals
* 2. Create async run function

### Integrate sending data from client to server ***(POST)***

* 1. Client side: create form
* 2. on submit get form data and create user object
* 3. on Server: Create user POST method to receive data on the backer
* 4. on client side: set fetch with POST, headers, body
* 5. on serverside res.send() will get an objects as an arguments otherwise it will throw an error
### LOAD Data to the client side ***(GET)***
* 1. create get API on the server
* 2. create a query object
* 3. collection.find (query)
* 4. cursor.toArray()
* 5. return the result
* 6. from client useEffect to display data 
# Backend Site in `index.js`

   ```js
    const { MongoClient, ServerApiVersion } = require('mongodb');
    const express = require('express');
    const cors = require('cors');
    const res = require('express/lib/response');
    const app = express();
    const ObjectId = require('mongodb').ObjectId
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
            app.get('/user', async (req, res) => {
                const query = {};
                const cursor = usersCollection.find(query);
                const users = await cursor.toArray();
                res.send(users);
            });
            app.get('/user/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const result = await usersCollection.findOne(query)
                res.send(result);

            });
            app.put('/user/:id', async (req, res) => {
                const id = req.params.id;
                const updatedUser = req.body;
                const filter = { _id: ObjectId(id) };
                const options = { upsert: true };
                const updatedDoc = {
                    $set: {
                        name: updatedUser.name, 
                        email: updatedUser.email
                    }
                };
                const result = await usersCollection.updateOne(filter, updatedDoc, options);
                res.send(result)

            })

            app.post('/user', async (req, res) => {
                const newUser = req.body;
                console.log('New User added', newUser);
                const result = await usersCollection.insertOne(newUser);
                res.send(result)

            });
            app.delete('/user/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const result = await usersCollection.deleteOne(query)
                res.send(result)

            })

        }
        finally {

        }
    }
    run().catch(console.dir)

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
   ```
# Front-end Part For `ReactApp`

## `Home Componenet`

   ```js
    import React, { useEffect, useState } from 'react';
    import { Link } from 'react-router-dom';

    const Home = () => {
        const [users, setUsers] = useState([]);
        useEffect(() => {
            fetch('http://localhost:5000/user')
                .then(res => res.json())
                .then(data => setUsers(data));
        }, []);
        const handleDelete = id => {
            const proceed = window.confirm("Are you Sure You want to delete?");
            if (proceed)
            {
                const url = `http://localhost:5000/user/${id}`;
                fetch(url, {
                    method:'DELETE'
                })
                .then(res => res.json())
                .then(data => {
                    if(data.deletedCount>0)
                    {
                        console.log('something');
                        // setChange(!change)
                        const remaining = users.filter(user => user._id !== id);
                        setUsers(remaining);
                    }
                })
            }
        }
        return (
            <div>
                <h1>Available User {users.length}</h1>
                <ul>
                    {
                        users.map((user) => <li
                            key={user._id}>{user.name} :: {user.email}
                            <button onClick={() => handleDelete(user._id)}>X</button>
                            <Link to={`/user/update/${user._id}`}><button>Update</button></Link>
                        </li>)
                    }
                </ul>
            </div>
        );
    };

    export default Home;
  
  ```
## `AddUser Componenet`

   ```js
   import React, { useRef } from 'react';

    const AddUser = () => {
        const nameRef = useRef('');
        const emailRef = useRef('')
        const handleSubmit = (event) => {
            event.preventDefault();
            const name = nameRef.current.value;
            const email = emailRef.current.value;
            const user = { name, email };
            fetch('http://localhost:5000/user', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body:JSON.stringify(user)
            })
                .then(res => res.json()).then(data => {
                    console.log(data);
                    event.target.reset(); 
                })

        }
        return (
            <div>
                <h2>Please Add User</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder='Name' ref={nameRef}  required />
                    <br />
                    <input type="email" placeholder='Email' ref={emailRef} required />
                    <br />
                    <input type="submit" value='Add User'/>
                </form>
            </div>
        );
    };

    export default AddUser;
    
   ```
# `UpdateUser Component`
   ```js
    import React, { useEffect, useRef, useState } from 'react';
    import { useParams } from 'react-router-dom';

    const UpdateUser = () => {
        const { id } = useParams();
        const [user, setUser] = useState({});

        useEffect(() => {
            const url = `http://localhost:5000/user/${id}`;
            fetch(url)
                .then(res => res.json())
                .then(data => setUser(data))
        },[])
        const handleUpdate = (event) => {
            event.preventDefault();
            const name = event.target.name.value;
            const email = event.target.email.value;
            const user = { name, email };
            const url = `http://localhost:5000/user/${id}`;
            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify(user)
            })
            .then(res => res.json()).then(data => {
                console.log(data);
                event.target.reset();
                alert("Succecefully Updated")
            })
        }

        return (
            <div>
                <h1>Update Your User:{user.name}</h1>
                <form onSubmit={handleUpdate}>
                    <input type="text" placeholder='Name' name='name' required />
                    <br />
                    <input type="email" placeholder='Email' name='email' required />
                    <br />
                    <input type="submit" value='Update User' />
                </form>
            </div>
        );
    };

    export default UpdateUser;
   ```
