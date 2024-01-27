const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const requireLogin = async (req, res, next) => {
  try {
    const decode = jwt.verify(req.headers.authorization, process.env.JWT_KEY);
    req.user = decode;
    const checkLogin = await User.findById({ _id: req.user.id });
    if (checkLogin.logState === process.env.LoG) {
      next();
    } else {
      res.status(500).send({
        success: false,
        message: "Not Logged In",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "ERROR DETECTED!",
    });
  }
};

const adminAccess = async (req, res, next) => {
  const findUser = await User.findById(req.user.id);
  if (findUser.isAdmin === 1) {
    next();
  } else {
    res.status(500).send({
      success: false,
      message: "ACCESS DENIED BY ADMIN!",
    });
  }
};

module.exports = { requireLogin, adminAccess };
