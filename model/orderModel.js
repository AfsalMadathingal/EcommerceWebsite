const mongoose = require("mongoose");

const orderDetails = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },

  orderAmount: {
    type: Number,
    require: true,
  },

  deliveryAddress: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
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
    type: mongoose.Schema.Types.Array,
    require: true,
  },

  coupon: {
    type: mongoose.Schema.Types.ObjectId,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
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
  }
});

module.exports = mongoose.model("orderDetails", orderDetails);
