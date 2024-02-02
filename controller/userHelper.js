// requiring user model file
const user = require("../model/userModel");

// requiring otp model file
const userOtp = require("../model/OTPModel");

// for otp
var springedge = require("springedge");

// OTP API
const sendOTP = async function (req, res, next) {
  await springedge.messages.send(
    req.session.params,
    5000,
    function (err, response) {
      if (err) {
        res.send("something error");
        return console.log(err);
      } else {
        setTimeout(() => {
          otpData.deleteOne({ user_id: req.session.currentUserId });
        }, 30000);

        next();
      }
      console.log(response);
    }
  );
};

// for encrypt for password
const bcrypt = require("bcrypt");
const saltRounds = 10;

//render login page
const loadLogin = function (req, res) {
  if (req.session.wrongCredentials) {
    res.render("user/userLogin", { wrongCredentials: true });

    req.session.wrongCredentials = false;
  } else if (req.session.blocked) {
    res.render("user/userLogin", { blocked: true });

    req.session.blocked = false;
  } else {
    res.render("user/userLogin");
  }
};
//render signup page

const loadsignup = function (req, res) {
  if (req.session.UserExists) {
    res.render("user/UserSignup", { alert: req.session.signupError });
    req.session.signupError = false;
  } else {
    res.render("user/userSignup");
  }
};

//home page for log in user
const loadHomeUser = async function (req, res) {
  if (req.session.user_id) {
    res.render("user/HomePage", { user: true, name: req.session.user_id });
  } else {
    res.render("user/HomePage");
  }
};

//savig data to the data base
const registerUser = async function (req, res, next) {
  console.log(process.env.SPRING_EDGE_API_KEY);

  req.session.password = await bcrypt.hash(req.body.password, saltRounds);
  const currentDate = new Date();
  const datePartOnly = currentDate.toISOString().split("T")[0];

  let userData = new user({
    name: req.body.fullName,
    gender: req.body.gender,
    email: req.body.email,
    phone: req.body.mobile,
    is_blocked: false,
    password_encrypted: req.session.password,
    date_joined: datePartOnly,
  });
  req.session.userData = userData;

  console.log(userData);

  let checkuser = await user.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.mobile }],
  });

  if (checkuser) {
    req.session.UserExists = true;
    req.session.signupError = true;
    console.log(checkuser);
    res.redirect("/user_signup");
  } else {
    req.session.otp = Math.floor(100000 + Math.random() * 900000);
    otpData = new userOtp({
      user_id: userData._id.toString(),
      otp: req.session.otp,
    });

    console.log(req.session.otpData);

    await otpData.save();

    req.session.currentUserId = userData._id.toString();
    req.session.mobileNumber = `91${userData.phone}`;
    req.session.otpSms = `Mobile Number verification code is ${req.session.otp} Do not share it`;
    req.session.params = {
      sender: "SEDEMO",
      apikey: process.env.SPRING_EDGE_API_KEY,
      to: [req.session.mobileNumber],
      message: req.session.otpSms,
      format: "json",
    };

    next();
  }
};

//reder otp page
const LoadOtpPage = function (req, res, next) {
  res.render("user/otp", { mobileNumber: req.session.mobileNumber });

  next();
};

//retry otp
const LoadOtpRetryPage = function (req, res, next) {
  res.render("user/otp", { mobileNumber: req.session.mobileNumber });
};

//otp verification
const otpVerify = async function (req, res) {
  let userEnteredOtp = Object.values(req.body).join("");
  let userOtpDetails = await userOtp.findOne({
    user_id: req.session.currentUserId,
  });

  console.log(userEnteredOtp);
  console.log(userOtpDetails);

  if (userOtpDetails.otp == userEnteredOtp) {
    req.session.user_id = req.session.currentUserId;
    res.redirect("/");
    console.log("verified");
    await userOtp.deleteOne({ user_id: req.session.currentUserId });
    await user.insertMany(req.session.userData);
  } else {
    res.render("user/otp", {
      mobileNumber: req.session.mobileNumber,
      alert: "OTP Wrong",
    });
    console.log("wrong");
  }
};

//verify user and creating session
const verifyUser = async function (req, res) {
  const phone = req.body.phone;
  const password = req.body.password;

  try {
    const allNumbersRegex = /^[0-9]+$/;
    const mixedRegex = /[a-zA-Z0-9]/;
    let userData;

    if (allNumbersRegex.test(phone)) {
      userData = await user.findOne({ phone: phone });
      verification();
    } else if (mixedRegex.test(phone)) {
      userData = await user.findOne({ email: phone });

      verification();
    }

    // const userData = await user.findOne({ phone: phone })

    async function verification() {
      if (!userData.is_Blocked) {
        let cryptResult = await bcrypt.compare(
          password,
          userData.password_encrypted
        );

        if (userData) {
          if (cryptResult) {
            req.session.user_id = userData._id;

            res.redirect("/home");
          } else {
            req.session.wrongCredentials = true;
            res.redirect("/user_login_form");
          }
        } else {
          res.send("wrong password");
        }
      } else {
        req.session.blocked = true;
        res.redirect("/user_login_form");
      }
    }
  } catch (err) {
    console.log(err);
    req.session.wrongCredentials = true;
    res.redirect("/user_login_form");
  }
};

//log out user and send to home
const logout = function (req, res) {
  if (req.session.user_id) {
    req.session.user_id = null;
    res.redirect("/");
  } else {
    res.redirect("/");
  }
};

const checkBlocked = async (req, res) => {
  const userId = req.session.user_id;

  try {
    const data = await user.findOne({ _id: userId });

    if (data.is_Blocked) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadLogin,
  loadHomeUser,
  loadsignup,
  registerUser,
  verifyUser,
  logout,
  sendOTP,
  otpVerify,
  LoadOtpPage,
  LoadOtpRetryPage,
  checkBlocked,
};
