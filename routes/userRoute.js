const router = require("express").Router();
const User = require("../models/user.js");
const auth = require("../auth/authRoutes.js");
const { hashPassword, matchPassword } = require("../Utils/authPass.js");
const jwt = require("jsonwebtoken");
const { requireLogin, adminAccess } = require("../middlewares/userAuth.js");

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
    const accountSid = "ACc79392247afd5dab4592bcaa7d74eafa";
    const authToken = "a70781fa4c6818c269a861675f8eaca5";
    const verifySid = "VAc78b62645877a8015026c5ddea993688";
    const client = require("twilio")(accountSid, authToken);

    client.verify.v2
      .services(verifySid)
      .verifications.create({ to: "+917365926202", channel: "sms" })
      .then((verification) => console.log(verification.status))
      .then(() => {
        const readline = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        readline.question("Please enter the OTP:", (otpCode) => {
          client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: "+917365926202", code: otpCode })
            .then((verification_check) =>
              console.log(verification_check.status)
            )
            .then(() => readline.close());
        });
      });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
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
    } else {
      res.status(500).send({
        success: false,
        message: "PASSWORD DOESN'T MATCH!",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "SOMETHING WENT WRONG!",
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
