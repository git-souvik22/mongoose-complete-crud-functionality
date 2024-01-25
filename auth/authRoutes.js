const auth = require("express")();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../src/.env") });

const secretKey = process.env.SECRET_KEY;
const datapass = process.env.SSH_KEY;
auth.use((req, res, next) => {
  const sshkey = req.get(datapass);
  if (sshkey === secretKey) {
    next();
  } else {
    res.status(401).send({
      success: false,
      message: "ERROR! DATA NOT FOUND.",
    });
  }
});

module.exports = auth;
