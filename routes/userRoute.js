const router = require("express").Router();
const User = require("../models/user.js");
const { hashPassword, matchPassword } = require("../Utils/authPass.js");
const jwt = require("jsonwebtoken");
const { requireLogin, adminAccess } = require("../middlewares/userAuth.js");

//for admin
router.get("/user", async (req, res) => {
  try {
    const getUsers = await User.find().sort({ date: -1 });
    if (getUsers) {
      res.status(200).send({
        success: true,
        message: "Users data successfully fetched",
        result: getUsers,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Users data cannot be fetched",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Cannot get users data",
    });
  }
});

// user register
router.post("/create-user", async (req, res) => {
  try {
    const hashedPswd = await hashPassword(req.body.password);
    if (req.body.password === req.body.cpassword) {
      const createUser = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        phone: req.body.phone,
        password: hashedPswd,
        state: req.body.state,
        cityvill: req.body.cityvill,
        pin: req.body.pin,
        nearloc: req.body.nearloc,
        isAdmin: req.body.isAdmin,
      });
      const newUser = await createUser.save();
      res.status(201).send({
        success: true,
        message: "User Successfully created",
        result: newUser,
      });
    } else {
      res.status(401).send({
        success: false,
        message: "Password field doesn't match",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Something went wrong: ${err}`,
    });
  }
});

//user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userCheck = await User.findOne({ email });
    const passCheck = await matchPassword(password, userCheck.password);
    if (userCheck && passCheck) {
      // generating token
      const token = jwt.sign({ id: userCheck._id }, process.env.JWT_KEY, {
        expiresIn: "5d",
      });

      res.status(200).send({
        success: true,
        message: "Successfully Loggen In !",
        result: userCheck,
        token,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Login was Unsuccessful!",
      });
    }
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "CANNOT MAKE LOG IN " + err,
    });
  }
});

//update profile
router.put("/update-profile", requireLogin, async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (updateUser) {
      res.status(201).send({
        success: true,
        message: "User successfully updated",
        result: updateUser,
      });
    } else {
      res.status(500).send({
        success: false,
        message: "User cannot be updated",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Something went wrong ${err}`,
    });
  }
});

// update password
router.put("/update-password", requireLogin, async (req, res) => {
  try {
    const { newPassword, newCpassword } = req.body;
    if (newPassword === newCpassword) {
      const updatedPassword = await hashPassword(newPassword);
      const updatePass = await User.findByIdAndUpdate(
        req.user.id,
        {
          password: updatedPassword,
        },
        {
          new: true,
        }
      );
      res.status(201).send({
        success: true,
        message: "PASSWORD UPDATED SUCCESSFULLY!",
        updatePass,
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "SOMETHING WENT WRONG!",
    });
  }
});

router.get("/profile", requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.status(200).send({
        success: true,
        message: "ACCESS IS GRANTED 100%",
        loggedUSER: user,
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "ACCESS TO THIS ROUTE IS DISALLOWED!",
    });
  }
});

router.get("/admin", requireLogin, adminAccess, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (admin) {
      res.status(200).send({
        success: true,
        message: "ACCESS IS GRANTED 100%",
        loggedADMIN: admin,
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "ACCESS TO THIS ROUTE IS DISALLOWED!",
    });
  }
});

module.exports = router;
