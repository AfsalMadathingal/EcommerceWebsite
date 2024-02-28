// requiring user model file
const user = require("../model/userModel");
const referral = require("../model/referralModel");
const walletDB = require("../model/walletModel");
// requiring otp model file
const userOtp = require("../model/OTPModel");
// for otp
var springedge = require("springedge");
// for encrypt for password
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

        res.redirect('/otpsubmit')
      }
      console.log(response);
    }
  );
};

const loadForgotRest = async(req,res)=>{

  try {

    req.session.idForReset=req.params;
    
    res.render('user/ForgotPasswordForm',{title:'Forgot Password'})


    
  } catch (error) {
    
  }

}


const resendOTP = async function (req, res, next) {


  

  await springedge.messages.send(
    req.session.params,
    5000,
    function (err, response) {
      if (err) {
        res.send("something error");
        res.json(false)
        return console.log(err);

      } else {
        setTimeout(() => {
          otpData.deleteOne({ user_id: req.session.currentUserId });
        }, 30000);

        res.json(true)
      }
      console.log(response);
    }
  );
};

const updatePassword = async function (req, res, next) {

  try {
    

    const {password} = req.body

  req.session.password = await bcrypt.hash(password, saltRounds);

  await user.updateOne(
    { _id: req.session.currentUserId },{
      $set: {
        password_encrypted: req.session.password,
      },
    }
  )

  req.session.forgotRequested=false

  res.json({success:true})

  } catch (error) {

    res.json(false)
  }
  

}
const forgotPasswordRest = async function (req,res,next){

try {
  
  
  const {input}=req.body
  console.log("from forgot password otp:",input);
  const allNumbersRegex = /^[0-9]+$/;
  const mixedRegex = /[a-zA-Z0-9]/;
  let userData;

    if (allNumbersRegex.test(input)) {
      userData = await user.findOne({ phone: input });

      userData = await user.findOne({phone: req.body.input});

    } else if (mixedRegex.test(input)) {

      userData = await user.findOne({ email: input });
    }

  


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

     res.json(true)
     
    }
    console.log(response);
  }
);


} catch (error) {

  console.log("error form forgot password",error);
}

}

const loadForgotPassword = async function (req, res) {
  
  res.render('user/forgotPassword',{title:'Forgot Password'})

}

//render login page
const loadLogin = function (req, res) {

  try {

    if (req.session.wrongCredentials) {
      res.render("user/userLogin", { wrongCredentials: true ,title:"Login" });
  
      req.session.wrongCredentials = false;
    } else if (req.session.blocked) {
      res.render("user/userLogin", { blocked: true , title:"Login" });
  
      req.session.blocked = false;
    } else {
      res.render("user/userLogin",{title:"Login"});
    }
    
  } catch (error) {

    console.log(error);
    
  }

 
};

//render signup page
const loadsignup = function (req, res) {

try {
  
  if (req.session.UserExists) 
  {
    res.status(200).render("user/userSignup", { alert: req.session.signupError ,title:"Signup" });

    req.session.signupError = false;

  } else {

    res.status(200).render("user/userSignup",{title:"Signup"});

  }

} catch (error) {
  
  console.log(error);
}

};
  
//home page for log in user
const loadHomeUser = async function (req, res) {
  if (req.session.user_id) {
    res.render("user/HomePage", { user: true, name: req.session.user_id , title: "Home Page"});
  } else {
    res.render("user/HomePage",{title: "Home Page"});
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

    next()
  
  }
};

//reder otp page
const LoadOtpPage = function (req, res, next) {
  res.status(200).render("user/otp", { mobileNumber: req.session.mobileNumber ,title:"Otp Page"});

};

//retry otp
const LoadOtpRetryPage = function (req, res, next) {

  res.status(200).render("user/otp", { mobileNumber: req.session.mobileNumber , title:"Otp Page"});

};

//otp verification
const otpVerify = async function (req, res) {

  
  const {otp,forgot}=req.body
  console.log(otp,forgot,"otp verify")

  //for forgot password users
  if (otp&&forgot)

  {
    req.session.forgotRequested=true;

     let userOtpDetails = await userOtp.findOne({
    user_id: req.session.currentUserId,
  });

  console.log(otp);
  console.log(userOtpDetails);

  if (userOtpDetails.otp == otp) {
    
    console.log("verified");
    await userOtp.deleteOne({ user_id: req.session.currentUserId });
    
    res.json({success:true,userId:req.session.currentUserId});

  } else {
   
    console.log("wrong");
  }


  }
  //for normal users
  else
  {
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
      await referral.insertMany({userId:req.session.currentUserId})
      const{name}= await user.findOne({_id:req.session.currentUserId})

   
      if(req.session.referralId)
      {
        await referral.updateOne(
          { userId: req.session.referralId },
          {
            $push: {
              history: {
                name: name,
                date: new Date(),
                Amount: 100
              }
            }
          }
        );

        await walletDB.updateOne(
          { userId: req.session.referralId },
          {
            $inc: {
              balance: 100
            }
          }
        )
      }
    } else {
      res.render("user/otp", {
        mobileNumber: req.session.mobileNumber,
        alert: "OTP Wrong",
        title: "Wrong OTP",
      });
      console.log("wrong");
    }
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

    

    async function verification() {
      try {

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
        
      } catch (error) 
      {
        console.log(error);
        req.session.wrongCredentials = true;
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
  resendOTP,
  loadForgotPassword,
  forgotPasswordRest,
  updatePassword,
  loadForgotRest
};
