const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const apiURL = process.env.API;
// middlewares
// makes JSON data readable for backend if data is sent from frontend to backend
app.use(express.json());

// mongodb+srv://souvikr915:VAHDmArvOTrgnJU0@cdshop.w7csmkc.mongodb.net/

app.get(`${apiURL}/product`, (req, res) => {
  const productObj = {
    name: "T-Shirt",
    image: "img-url",
    stock: 50,
    category: "men",
    price: 450,
  };
  res.send(productObj);
});

app.post(`${apiURL}/create-product`, (req, res) => {
  const newProduct = req.body;
  res.json(newProduct);
});

app.listen(5000, () => {
  console.log(`Server is running on: http://127.0.0.1:5000`);
});
