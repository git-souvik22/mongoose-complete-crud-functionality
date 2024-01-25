const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const requireLogin = async (req, res, next) => {
  try {
    const decode = jwt.verify(req.headers.authorization, process.env.JWT_KEY);
    req.user = decode;
    next();
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "ERROR DETECTED:" + err,
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
