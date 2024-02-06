const router = require("express").Router();
const User = require("../models/user.js");
const auth = require("../auth/authRoutes.js");
const jwt = require("jsonwebtoken");
const { requireLogin, adminAccess } = require("../middlewares/userAuth.js");
const twilio = require("twilio");
const otpGenerator = require("otp-generator");
const { otpVerification } = require("../middlewares/otpValidate.js");

//for admin
router.get("/user", requireLogin, adminAccess, async (req, res) => {
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

// // regitration otp
router.post("/register-otp", async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACC_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const VirtualMob = process.env.TWILIO_VMOB;
    const twilioClient = new twilio(accountSid, authToken);

    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const { fullname, email, phone } = req.body;
    const currTime = new Date();

    const userExists = await User.findOne({ phone: phone, email: email });

    // registration time
    if (!userExists) {
      const registerUser = new User({
        fullname: fullname,
        email: email,
        phone: phone,
        otp: otp,
        otpExp: new Date(currTime.getTime()),
      });
      const registerOtp = await registerUser.save();
      await twilioClient.messages.create({
        from: VirtualMob,
        body: `Your Registration OTP is: ${otp}`,
        to: phone,
      });
      if (registerOtp) {
        res.status(200).json({
          success: true,
          message: `Registration OTP was sent: ${otp}`,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Registration OTP couldn't be sent",
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: "already registered",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      err,
    });
  }
});

// Login otp
router.post("/login-otp", async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACC_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const VirtualMob = process.env.TWILIO_VMOB;
    const twilioClient = new twilio(accountSid, authToken);

    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const { phone } = req.body;
    const currTime = new Date();

    const userExists = await User.findOne({ phone: phone });

    if (userExists && userExists.logState === "out") {
      const loginOtp = await User.findOneAndUpdate(
        { phone: userExists.phone },
        {
          otp: otp,
          otpExp: new Date(currTime.getTime()),
        },
        { new: true }
      );
      await twilioClient.messages.create({
        from: VirtualMob,
        body: `Your Login OTP is: ${otp}`,
        to: phone,
      });
      if (loginOtp) {
        res.status(200).json({
          success: true,
          message: `Login OTP was sent: ${otp}`,
        });
      } else {
        res.status(500).json({
          success: false,
          message: `Login OTP couldn't be sent`,
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: "please register first",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      err,
    });
  }
});

router.post("/otp-verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const findOTP = await User.findOne({ phone: phone, otp: otp });
    if (!findOTP) {
      res.status(404).json({
        success: false,
        message: "wrong otp",
      });
    }
    const otpExpired = await otpVerification(findOTP.otpExp);
    if (otpExpired) {
      res.status(500).json({
        success: false,
        message: "otp expired",
      });
    }
    if (!otpExpired) {
      const token = jwt.sign({ id: findOTP._id }, process.env.JWT_KEY, {
        expiresIn: "5d",
      });
      const userState = await User.findOneAndUpdate(
        { email: findOTP.email },
        {
          logState: "in",
        },
        {
          new: true,
        }
      );
      res.status(200).send({
        success: true,
        message: "otp verified",
        result: userState,
        token,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "can't register",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "something went wrong",
      err,
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
// loggedin User Access
router.get("/profile", requireLogin, async (req, res) => {
  try {
    // generate new TOKEN (JWT) => REFRESH_ID (Func>>) jwt.sign({uid: req.user.id}, SECRET_ID, {
    //   expiresIn: "2h"
    // }) >>> "jgfct;w,sa454dsfkjhwethbaHFgygdsk.pokojsapgfaeydwiuy.cthY4$WS4dGUokd,kj"
    // decode TOKEN (JWT) =>
    const user = await User.findById(req.user.id);
    if (user) {
      res.status(200).send({
        success: true,
        message: "ACCESS IS GRANTED 100%",
        loggedUSER: user,
        // REFRESH_ID
        // SECRET_ID
      });
    } else {
      res.status(401).send({
        success: false,
        message: "WARNING SPAM DETECTED!",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "ACCESS TO THIS ROUTE IS DISALLOWED!",
    });
  }
});

// Loggedin Admin Access
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

// Logout any User
router.post("/logout", requireLogin, async (req, res) => {
  try {
    const loggedOutUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        logState: "out",
      },
      {
        new: true,
      }
    );
    if (loggedOutUser.logState === "out") {
      res.status(200).send({
        success: true,
        message: "successfully Logged Out !",
      });
    } else {
      res.status(500).send({
        success: false,
        message: "Logout Unsuccessful",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something Went Wrong. Please try after 5 minutes",
    });
  }
});

module.exports = router;
