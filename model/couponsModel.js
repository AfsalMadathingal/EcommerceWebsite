const mongoose = require('mongoose')

const coupon = mongoose.Schema({

    code:{
        type:String,
        require:true
    },
    discount:{
        type:Number,
        require:true
    },
    discription:{
        type:String,
        require:true
    },
    userLimit:{
        type:Number,
        require:true
    },
    expireDate:
    {
    type:Date,
    require:true,

    },
    discountType:
    {
        type:Boolean,
        require:true,
        
    },
    isValid:
    {
        type:Boolean,
        require:true,
        default:true
    }
   
})

module.exports= mongoose.model("coupons",coupon)
