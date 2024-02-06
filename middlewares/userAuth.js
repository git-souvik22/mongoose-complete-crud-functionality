const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const requireLogin = async (req, res, next) => {
  try {
    const decode = jwt.verify(req.headers.authorization, process.env.JWT_KEY);
    req.user = decode;
    const userState = await User.findById({ _id: req.user.id });
    if (userState.logState === "in") {
      next();
    } else {
      res.status(500).json({
        success: false,
        message: "SPAM",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "ERROR DETECTED!",
    });
  }
};

const returnAccessment = async (req, res, next) => {
  if (req.body.status === "true") {
    const reVerification = jwt.verify(
      req.body.rtcd.slice(0, req.body.rtcd.length - 10),
      req.body.rtcd.slice(req.body.rtcd.length - 10, req.body.rtcd.length)
    );
    req.element = reVerification;
    next();
  } else {
    return res.status(500).json({
      success: false,
      message: "Not Logged in",
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

module.exports = { requireLogin, returnAccessment, adminAccess };
