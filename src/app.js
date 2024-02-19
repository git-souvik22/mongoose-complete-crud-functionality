const express = require("express");
const app = express();
const mongoose = require("mongoose");
const productRouter = require("../routes/productRoute.js");
const userRouter = require("../routes/userRoute.js");
const path = require("path");
const hbs = require("hbs");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const cors = require("cors");
app.use(cors());
app.options("*", cors());

const apiURL = process.env.API;
const apiURL2 = process.env.U_API;
// middlewares
// makes JSON data readable for backend if data is sent from frontend to backend
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(`${apiURL}`, productRouter);
app.use(`${apiURL2}`, userRouter);

app.use("/images", express.static("./images"));

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));

app.set("view engine", "hbs");
app.set("views", template_path);

hbs.registerPartials(partials_path);

// client routes
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/cart", (req, res) => {
  res.render("cart");
});
app.get("/wishlist", (req, res) => {
  res.render("wishlist");
});
app.get("/shop", (req, res) => {
  res.render("shop");
});
app.get("/product", (req, res) => {
  res.render("single-product");
});
app.get("/blog", (req, res) => {
  res.render("blog");
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/faq", (req, res) => {
  res.render("faq");
});
app.get("/disclaimer", (req, res) => {
  res.render("disclaimer");
});
app.get("/profile", (req, res) => {
  res.render("profile");
});
app.get("/seller-account", (req, res) => {
  res.render("seller-account");
});
app.get("/listed-products", (req, res) => {
  res.render("created-products");
});
app.get("/pending-sellers-applications", (req, res) => {
  res.render("verify-sellers");
});
app.get("/unpublished-products", (req, res) => {
  res.render("unpublished-products");
});

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
