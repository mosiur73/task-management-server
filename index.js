require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.juc5u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const taskCollection = client.db("taskDB").collection('tasks');
    const userCollection = client.db("taskDB").collection('users');


    // API to save user data
    app.post("/api/users", async (req, res) => {
        const user = req.body;
       // Check if user already exists
        const query = { uid: user.uid };
        const existingUser = await userCollection.findOne(query);
       if (existingUser) {
          return res.send({ message: "User already exists", insertedId: null });
        }
        // Insert new user
        const result = await userCollection.insertOne(user);
        res.send(result);
      });

       // POST: Add a new task
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    // GET: Fetch all tasks
    app.get("/tasks", async (req, res) => {
      const tasks = await taskCollection.find().toArray();
      res.send(tasks);
    });

    // PUT: Update a task
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: updatedTask.title,
          description: updatedTask.description,
          category: updatedTask.category,
        },
      };
      const result = await taskCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // app.put("/tasks/:id", async (req, res) => {

    //   const { id } = req.params;
    //   const { title, description, category, order } = req.body;
    
    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = {
    //     $set: {
    //       title,
    //       description,
    //       category,
    //       order,
    //     },
    //   };
    
    //   const result = await taskCollection.updateOne(filter, updateDoc);
    
    //   if (result.modifiedCount > 0) {
    //     const updatedTask = await taskCollection.findOne(filter);
    //     res.send(updatedTask);
    //   } else {
    //     res.status(404).send("Task not found or no changes made");
    //   }
    // });

    // DELETE: Delete a task
    
    app.put("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const { title, description, category, order } = req.body;
    
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title,
          description,
          category,
          order,
        },
      };
    
      const result = await taskCollection.updateOne(filter, updateDoc);
    
      if (result.modifiedCount > 0) {
        const updatedTask = await taskCollection.findOne(filter);
        res.send(updatedTask);
      } else {
        res.status(404).send("Task not found or no changes made");
      }
    });


    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(filter);
      res.send(result);
    });

  
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
    res.send('task management server is running...')
})

app.listen(port, () => {
    console.log(`task management server is running on port: ${port}`);
})