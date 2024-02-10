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

//routing to product related request
userRoute.use('/products',productRoute)
//routing to profile related requests
userRoute.use('/profile',auth.blockChecker,auth.redirectToLogin,profileRoute)



//forgot Password realated routes
userRoute.get('/forgotPassword',auth.isLogout,userHelper.loadForgotPassword)
userRoute.post('/forgotpasswordotp',userHelper.forgotPasswordRest)
userRoute.get('/forgotpassewordreset/:id',auth.checkLoginUser,auth.checkForgotPassword,userHelper.loadForgotRest)
userRoute.post('/update_password',userHelper.updatePassword)

//checking user blocked or not 
userRoute.post('/blockChecker',auth.blockChecker)
//input checking while typing
userRoute.post('/inputcheck',auth.liveChecker)


//Landing Page For  User
userRoute.get('/home',auth.checkLoginUser,Products.loadHomeUser)
userRoute.get('/user_home',auth.checkSession, Products.loadHomeUser)


//User Login and sigunp related routes
userRoute.get('/user_login_form',auth.checkLoginUser,userHelper.loadLogin)
userRoute.get('/user_signup',auth.isLogout,userHelper.loadsignup)
userRoute.post('/user_register',userHelper.registerUser,userHelper.sendOTP)
userRoute.post('/user_login',userHelper.verifyUser)
userRoute.get('/user_logout',userHelper.logout)



//opt Related Routes
userRoute.get('/otpsubmit',auth.checkLoginUser,userHelper.LoadOtpPage)
userRoute.post('/resndotp',userHelper.resendOTP)
userRoute.post('/otp_verify',userHelper.otpVerify)

userRoute.get('/otp_resend',userHelper.sendOTP,userHelper.LoadOtpRetryPage)




module.exports = userRoute;    