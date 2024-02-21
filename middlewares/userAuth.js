const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const requireLogin = async (req, res, next) => {
  try {
    const decodedToken = jwt.decode(req.headers.authorization, {
      complete: true,
    });
    if (decodedToken && decodedToken.payload.exp < Date.now() / 1000) {
      const userState = await User.findById({ _id: decodedToken.payload.id });
      if (userState.logState === "in") {
        await User.findByIdAndUpdate(
          { _id: decodedToken.payload.id },
          {
            logState: "out",
          },
          { new: true }
        );
      }
    }

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
