const router = require("express").Router();
const User = require("../models/user.js");
const auth = require("../auth/authRoutes.js");
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

router.post("/send-otp", async (req, res) => {
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

    const otpSent = await User.findOneAndUpdate(
      { phone },
      {
        otp,
        otpExp: new Date(currTime.getTime()),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await twilioClient.messages.create({
      from: VirtualMob,
      body: `Your OTP is: ${otp}`,
      to: phone,
    });

    if (otpSent) {
      res.status(200).json({
        success: true,
        message: `OTP was sent: ${otp}`,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
    });
  }
});

router.post("/otp-verify", async (req, res) => {
  const { phone, otp } = req.body;
  const findOTP = await User.findOne({ phone: phone, otp: otp });
  if (!findOTP) {
    res.status(404).json({
      success: false,
      message: "You entered a wrong OTP",
    });
  }
  const otpExpired = await otpVerification(findOTP.otpExp);
  if (otpExpired) {
    res.status(500).json({
      success: false,
      message: "Your OTP has expired",
    });
  }
  if (!otpExpired) {
    res.status(200).json({
      success: true,
      message: "OTP Verified successfully",
    });
  }
});

// user register
router.post("/create-user", async (req, res) => {
  try {
    const createUser = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      state: req.body.state,
      cityvill: req.body.cityvill,
      pin: req.body.pin,
      nearloc: req.body.nearloc,
      isAdmin: req.body.isAdmin,
      logState,
    });
    const newUser = await createUser.save();
    res.status(201).send({
      success: true,
      message: "User Successfully created",
      result: newUser,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Something went wrong: ${err}`,
    });
  }
});

//user login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const userCheck = await User.findOne({ email });
//     const passCheck = await matchPassword(password, userCheck.password);
//     if (userCheck.logState !== process.env.LoG) {
//       if (passCheck) {
//         // generating token
//         const token = jwt.sign({ id: userCheck._id }, process.env.JWT_KEY, {
//           expiresIn: "5d",
//         });

//         const userState = await User.findOneAndUpdate(
//           { email: userCheck.email },
//           {
//             logState: process.env.LoG,
//           },
//           {
//             new: true,
//           }
//         );

//         res.status(200).send({
//           success: true,
//           message: "Successfully Loggen In !",
//           result: userState,
//           token,
//         });
//       } else {
//         res.status(400).send({
//           success: false,
//           message: "Login was Unsuccessful!",
//         });
//       }
//     } else {
//       res.status(401).send({
//         success: false,
//         message: "Already Loggedin to some other Device",
//       });
//     }
//   } catch (err) {
//     res.status(400).send({
//       success: false,
//       message: "CANNOT MAKE LOG IN " + err,
//     });
//   }
// });

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
    const user = await User.findById(req.user.id);
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
        message: "Successfully Logged Out. Now delete the LocalStorage",
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
