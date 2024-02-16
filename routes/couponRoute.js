//Requiring Nessesery Modules
const express=require('express')
const couponRute=express();
const profile= require ('../controller/userProfile.js');
const productRoute = require('./productsRoute.js');
const paymentRouter = require('../routes/payment')
const Razorpay = require('razorpay');
const auth = require('../middleware/auth')
const coupons = require('../controller/couponHelper')
//discount type 1 = amount 0= percentage 



couponRute.post('/applycoupon',auth.checkSession,coupons.applyCoupon)




module.exports = couponRute