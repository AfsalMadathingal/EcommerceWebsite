const express=require('express')
const couponRute=express();
const auth = require('../middleware/auth')
const coupons = require('../controller/couponHelper')



couponRute.post('/applycoupon',auth.checkSession,coupons.applyCoupon)




module.exports = couponRute