//Requiring Nessesery Modules
const express=require('express')
const userRoute=express();
const session = require("express-session")
const auth=require('../middleware/auth')
const userHelper= require('../controller/userHelper')
const Products= require('../controller/UserSideProducts.js')
const productRoute = require('./productsRoute.js')
const profileRoute = require('./profileRoute.js')


//session
userRoute.use(session({
    secret:'supersecret',
    resave: false,
    saveUninitialized: true,
}))

//body Parser
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }))



//Landing Page For non regster User
userRoute.get('/', auth.isLogin)

//checking user blocked or not 
userRoute.post('/blockChecker',auth.blockChecker)

//routing to product related request
userRoute.use('/products',productRoute)

//routing to profile related requests
userRoute.use('/profile',auth.checkSession,profileRoute)

//Landing Page For unregistred User
userRoute.get('/home',auth.checkLoginUser,Products.loadHomeUser)


//Landing Page For registred User
userRoute.get('/user_home',auth.checkSession, Products.loadHomeUser)



 
//User Login Page
userRoute.get('/user_login_form',auth.checkLoginUser,userHelper.loadLogin)

//User Signup Page
userRoute.get('/user_signup',auth.isLogout,userHelper.loadsignup)

//user register OTP send
userRoute.post('/user_register',userHelper.registerUser,userHelper.LoadOtpPage,userHelper.sendOTP)

//OTP verification
userRoute.post('/otp_verify',userHelper.otpVerify)

//OTP resend
userRoute.get('/otp_resend',userHelper.sendOTP,userHelper.LoadOtpRetryPage)

//user validation and login
userRoute.post('/user_login',userHelper.verifyUser)

//user validation and login
userRoute.get('/user_logout',userHelper.logout)


module.exports = userRoute;    