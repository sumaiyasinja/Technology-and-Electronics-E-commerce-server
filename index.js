const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctrkbrk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    // databse collections
    const database = client.db("BytopiaTechShopDB");
    const ProductCollection = database.collection("products");
    const CartCollection = database.collection("carts");
    const userCollection = database.collection("users");

    // API endpoints
    // API endpoints User
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user already exists", insertedId: null });
        return;
      }

      try {
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).send({ error: error.message });
      }
    });
        // API endpoint products

    // Read all products
    app.get("/products", async (req, res) => {
      const result = await ProductCollection.find().toArray();
      res.send(result);
    });
    // post product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await ProductCollection.insertOne(newProduct);
      res.send(result);
    });

    // get single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await ProductCollection.findOne(filter);
      res.send(result);
    });

    // update by id
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      console.log("Body", id, product);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = {
        $set: {
          name: product.name,
          price: product.price,
          rating: product?.rating,
          brands: product.brands,
          types: product.types,
          description: product.description,
          photo: product.photo,
        },
      };
      const result = await ProductCollection.updateOne(
        filter,
        updatedProduct,
        options
      );
      res.send(result);
    });
    // Brand collection    API endpoint

    app.get("/brands", async (req, res) => {
      const result = await ProductCollection.find().toArray();
      res.send(result);
    });
    app.get("/brands/:brands", async (req, res) => {
      const brands = req.params.brands;
      const filter = { brands: { $eq: brands } };
      const result = await ProductCollection.findOne(filter);
      res.send(result);
    });

    //Cart's API endpoint
    // Read all products of cart
    app.get("/cart", async (req, res) => {
      const result = await CartCollection.find().toArray();
      res.send(result);
    });

    app.get("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await CartCollection.findOne(query);
      res.send(result);
    });

    // post product to cart
    app.post("/cart", async (req, res) => {
      const newProd = req.body;
      console.log(newProd);
      const result = await CartCollection.insertOne(newProd);
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await CartCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/brands/:brands", async (req, res) => {
      const brands = req.params.brands;
      const filter = { brands: { $eq: brands } };
      const result = await ProductCollection.findOne(filter);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
