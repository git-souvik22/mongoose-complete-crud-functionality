const express = require("express");
const app = express();
const mongoose = require("mongoose");
const productRouter = require("../routes/productRoute.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const cors = require("cors");
app.use(cors());
app.options("*", cors());

const apiURL = process.env.API;
// middlewares
// makes JSON data readable for backend if data is sent from frontend to backend
app.use(express.json());
app.use(`${apiURL}`, productRouter);

// db connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(5000, () => {
  console.log(`Server is running on: http://127.0.0.1:5000`);
});
