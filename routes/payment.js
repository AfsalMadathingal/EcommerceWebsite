const paymentRouter = require("express").Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const user = require("../model/userModel.js");
const wallet = require("../model/walletModel.js");
const address = require("../model/userAddress.js");
const cart = require("../model/cart.js");
const order = require("../model/orderModel.js");
const payment = require("../model/payment.js");
const { log } = require("console");

//create order

paymentRouter.post("/orders", async (req, res) => {
  try {
    const { userId, selectedAddress } = req.body;

    let { cartValue } = await user.findOne({ _id: userId });

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    if ( req.session.coponDiscount ) {

      cartValue = req.session.offerTotal ? req.session.offerTotal : cartValue;
      cartValue = cartValue * 100 - req.session.coponDiscount * 100;
    } else {

      cartValue = req.session.offerTotal ? req.session.offerTotal * 100 : cartValue * 100;

    }

    console.log("cartvalue", cartValue , "req.sess", req.session.offerTotal);

    const options = {
      amount: cartValue,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
      }

      console.log("order", order);

      res.status(200).json({
        order: order,
        userId: userId,
        selectedAddress: selectedAddress,
        key: process.env.RAZORPAY_API_KEY,
      });
    });

  } catch (error) {
    console.log("error",error);
    res.status(500).json({ message: "Something went wrong" ,error: JSON.stringify(error)});
  }
});

//payment verify
paymentRouter.post("/verify", (req, res) => {
  try {
    if (req.session.discount) {
      req.body.discount = req.session.discount;
      req.session.order = req.body;
    } else {
      req.session.order = req.body;
    }
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log(razorpay_signature);
    console.log(expectedSignature);

    if (razorpay_signature === expectedSignature) {
      res
        .status(200)
        .json({ message: "Payment verified successfully", success: true });
    } else {
      res.status(400).json({ message: "Invalid signature", success: false });
    }
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
});

//walletPayments
paymentRouter.post("/walletPayment", async (req, res) => {

  try {
    
    const {userId,selectedAddress} = req.body;

    const addressData = await address.find({ _id: selectedAddress });
    const userData = await user.find({ _id: userId });
    const cartData = await cart.find({ userId: userId });
    const walletData = await wallet.find({ userId: userId });

    console.log("userid",userId);
    console.log("walletData",walletData);

    if(walletData[0].balance < userData[0].cartValue)
    {
      return res.status(400).json({message:"Insufficient Balance",success:false})

    }

    const response = await wallet.updateOne(
      { userId: userId }, 
      { $inc: { balance: -userData[0].cartValue }, 
      $push: { transaction: { amount: userData[0].cartValue, type: "debit", date: new Date() 
    }}
    });

    console.log("response",response);

    if (response.modifiedCount > 0) {

      return res.status(200).json({message:"Payment Successfull",success:true})

    }



  } catch (error) {

    console.log(error);
  }
  
})

//walletRecharge
paymentRouter.post('/walletReacharge', async (req, res) => {
  try {
    console.log("hi from wllaet");
    const { amount } = req.body;
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" });
      }

      res.status(200).json({
        data: order,
        key: process.env.RAZORPAY_API_KEY,
      });
    });
  } catch (error) {
    console.log(error);
  }
});


module.exports = paymentRouter;
