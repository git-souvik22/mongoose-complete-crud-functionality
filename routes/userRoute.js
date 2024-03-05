const router = require("express").Router();
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const { requireLogin, adminAccess } = require("../middlewares/userAuth.js");
const twilio = require("twilio");
const otpGenerator = require("otp-generator");
const { otpVerification } = require("../middlewares/otpValidate.js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../src/.env") });

//for admin
router.get("/user", requireLogin, adminAccess, async (req, res) => {
  try {
    const getUsers = await User.find().sort({ date: -1 });
    const sellers = getUsers.filter((user) => {
      return (
        user.isSeller === 0 &&
        user.firmName !== "" &&
        user.businessCat !== "" &&
        user.proprietor !== ""
      );
    });
    if (sellers) {
      // console.log(sellers);
      res.status(200).send({
        success: true,
        message: "Sellers data successfully fetched",
        result: sellers,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "No user found",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Cannot get users data",
    });
  }
});

// approve sellers
router.put(
  "/approve-seller/:id",
  requireLogin,
  adminAccess,
  async (req, res) => {
    try {
      const approvedSeller = await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
          isSeller: 1,
        },
        { new: true }
      );
      if (approvedSeller) {
        res.status(201).send({
          success: true,
          approvedSeller,
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Error occured",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  }
);
// get seller details
router.get(
  "/seller-details/:id",
  requireLogin,
  adminAccess,
  async (req, res) => {
    try {
      const productSeller = await User.findById({ _id: req.params.id });
      if (productSeller) {
        res.status(200).send({
          success: true,
          productSeller,
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Seller not found",
        });
      }
    } catch (err) {
      res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  }
);

// regitration otp
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
    }
    if (userExists) {
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
    // console.log(userExists);

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
        message: "Login not allowed",
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

router.put("/register-seller", requireLogin, async (req, res) => {
  try {
    const { firmName, gst } = req.body;
    const firmExists = await User.findOne({ firmName: firmName, gst: gst });
    if (!firmExists) {
      const sellerDetails = await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      if (sellerDetails) {
        res.status(201).send({
          success: true,
          message: "Seller details received",
          result: sellerDetails,
        });
      } else {
        res.status(500).send({
          success: false,
          message: "Seller cannot be registered",
        });
      }
    } else {
      res.status(500).send({
        success: false,
        message: "This Business name is already Registered",
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
    const user = await User.findById(req.user.id);
    // console.log(req.user.id);
    if (user) {
      res.status(200).send({
        success: true,
        message: "ACCESS IS GRANTED 100%",
        loggedUSER: user,
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
// find applications of sellers
// router.get("/unapproved-sellers", requireLogin, adminAccess, async (req, res) =>{
//   try{
//     const findUser = await User.find()
//   }catch(err){
//     res.status(500).send({
//       success: false,
//       message: "SOMETHING WENT WRONG!"
//     })
//   }
// })

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
