const express = require("express");
const app = express();
const mongoose = require("mongoose");
const productRouter = require("../routes/productRoute.js");
const userRouter = require("../routes/userRoute.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const cors = require("cors");
app.use(cors());
app.options("*", cors());

const apiURL = process.env.API;
const apiURL2 = process.env.U_API;
// middlewares
// makes JSON data readable for backend if data is sent from frontend to backend
app.use(express.json());
app.use(`${apiURL}`, productRouter);
app.use(`${apiURL2}`, userRouter);

// app.use((req, res, next) => {
//   // Check the 'Referer' header
//   const referer = req.get("Referer");

//   // Alternatively, check the 'Origin' header
//   // const origin = req.get('Origin');

//   console.log("Frontend BaseURL:", referer);

//   // Continue with the request handling
//   next();
// });

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
