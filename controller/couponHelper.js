//Requiring Nessesery Modules
const products = require("../model/productsModel.js");
const size = require("../model/sizeModel.js");
const color = require("../model/colorModel.js");
const category = require("../model/categoryModel.js");
const productVariants = require("../model/productVariants.js");
const user = require("../model/userModel.js");
const address = require("../model/userAddress.js");
const cart = require("../model/cart.js");
const order = require("../model/orderModel.js");
const payment = require("../model/payment.js");
const coupon = require("../model/couponsModel.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { text } = require("express");
const saltRounds = 10;
const Razorpay = require('razorpay');
//discount type 1 = amount 0= percentage 


const applyCoupon= async (req,res)=>{
    
    try {
        
        const {couponCode}=req.body

        const couponData= await coupon.findOne({code:couponCode})
        req.session.coupon=couponData
        console.log(couponData);

        if(couponData)
        {
            req.session.couponid= couponData._id

            if(couponData.discountType)
            {
                req.session.discountAmount = couponData.discount
                req.session.discountPercentage = false
                

            }else
            {
                req.session.discountPercentage = couponData.discount
                req.session.discountAmount = false
              
            }

            req.session.appliedCoupon = true

            res.json({
                success:true,
                discountAmount:req.session.discountAmount,
                discountPercentage:req.session.discountPercentage
            })
        }else
        {
            res.json({success:false})
        }

    } catch (error) {
        
        console.log(error);
    }
}


module.exports= {

    applyCoupon,
}