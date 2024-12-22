//Requiring Nessesery Modules
const express=require('express')
const userRoute=express();
const auth=require('../middleware/auth')
const userHelper= require('../controller/userHelper')
const Products= require('../controller/UserSideProducts.js')
const productRoute = require('./productsRoute.js')
const profileRoute = require('./profileRoute.js')
const couponRoute = require('./couponRoute.js')
const referralRoute = require('./ReferralRoute.js')
const customerServiceRoute = require('./customerServiceRoute.js')
const logger = require('morgan');

userRoute.use(
    logger('dev', {
        skip: (req) => {
            // Skip requests for static files based on common extensions
            const staticExtensions = /\.(css|js.map|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i;
            return staticExtensions.test(req.url);
        },
    })
);


userRoute.use('/refferal',referralRoute)
userRoute.use('/products',productRoute)
userRoute.use('/profile',auth.blockChecker,auth.redirectToLogin,profileRoute)
userRoute.use('/coupon',auth.blockChecker,auth.redirectToLogin,couponRoute)
userRoute.use('/customerService',auth.blockChecker,auth.redirectToLogin,customerServiceRoute)




//Landing 
userRoute.get('/', auth.isLogin)
userRoute.get('/home',auth.checkLoginUser,Products.loadHomeUser)
userRoute.get('/user_home',auth.checkSession, Products.loadHomeUser)


//forgot Password realated routes
userRoute.get('/forgotPassword',auth.isLogout,userHelper.loadForgotPassword)
userRoute.post('/forgotpasswordotp',userHelper.forgotPasswordRest)
userRoute.get('/forgotpassewordreset/:id',auth.checkLoginUser,auth.checkForgotPassword,userHelper.loadForgotRest)
userRoute.post('/update_password',userHelper.updatePassword)


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


//checking user blocked or not 
userRoute.post('/blockChecker',auth.blockChecker)
//input checking while typing
userRoute.post('/inputcheck',auth.liveChecker)

module.exports = userRoute;    