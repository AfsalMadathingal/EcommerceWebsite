const paymentRouter = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const user = require("../model/userModel.js");
const address = require("../model/userAddress.js");
const cart = require("../model/cart.js");
const order = require("../model/orderModel.js");
const payment = require("../model/payment.js");
const { log } = require('console');


//create order

paymentRouter.post('/orders', async(req, res) => {

    try {
        const {userId,selectedAddress}= req.body
        const {cartValue}= await user.findOne({_id:userId})  

        console.log("user",cartValue);
        const instance = new Razorpay({

            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
            
        })

        const options = {

            
            amount: cartValue*100,
            currency: "INR",
            receipt: crypto.randomBytes(10).toString('hex')

        }

        instance.orders.create(options, (error, order) => {

            if(error){
                console.log(error);
                return res.status(500).json({message: 'Something went wrong'})
            }
          
            res.status(200).json({data:order ,userId:userId,
                selectedAddress:selectedAddress,key:process.env.RAZORPAY_API_KEY,})
            
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Something went wrong'})
    }
    
})

//payment verify

paymentRouter.post('/verify', (req, res) => {

    try {
        console.log(req.body);
        req.session.order = req.body
        const{razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(sign.toString()).digest('hex');

        console.log(razorpay_signature);
        console.log(expectedSignature);

        if(razorpay_signature === expectedSignature){
            
            res.status(200).json({message: 'Payment verified successfully',success:true})
        }else{
            res.status(400).json({message: 'Invalid signature',success:false})
        }
    } catch (error) {
        console.log(error);
        console.log(error);
        res.status(500).json({message: 'Something went wrong',success:false})
        
    }
})

module.exports = paymentRouter;