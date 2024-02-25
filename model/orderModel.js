const mongoose = require("mongoose");
const userdetails = require("./userModel.js");
const address = require("./userAddress.js");
const productVariants = require("./productVariants.js");

const orderDetails = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: userdetails,
  },

  orderAmount: {
    type: Number,
    require: true,
  },
  subTotal:{
    type:Number,
    require:true
  
  },
  deliveryAddress: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: address,
  },
  orderDate: {
    type: Date,
    require: true,
  },
  orderStatus: {
    type: String,
    default: "Pending",
  },
  deliveyDate: {
    type: Date,
  },

  ShippingDate: {
    type: Date,
  },
  OrderedItems: {
    type: Array,
    ref: productVariants,
    required: true,
    strictPopulate: false 
  },
  coupon: {
    type: Object,
    default: null,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  paymentMethod: {
    type: String,
    require:true
  },
  orderNo:{
    type:Number,
    require:true

  },
  transactionId:{
    type:String
  },
  returnReason:{
    type:String
  }
});

module.exports = mongoose.model("orderDetails", orderDetails);
