const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const cors = require("cors");

const app = express();

// Replace ALL your CORS code with this single line
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/router'));  
app.use('/api/products', require('./routes/Products')); 
app.use('/api/orders', require('./routes/orders'));
app.use('/api/promo', require('./routes/promo'));

const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8", "8.8.4.4"]);

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("Connected to MongoDB successfully");

    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('No products found – inserting sample items');
      await Product.insertMany([
        { name: 'Sample Widget', price: 299 },
        { name: 'Example Gadget', price: 499 },
        { name: 'Demo Thingy', price: 199 }
      ]);
    }

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
  
app.get("/", (req, res) => {
  res.send("Backend is working!");
});