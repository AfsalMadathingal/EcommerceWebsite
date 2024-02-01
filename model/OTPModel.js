const mongoose= require('mongoose')

//Creating Schema
const OTPDetails= mongoose.Schema({

    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        require:true
    },
    otp:{
        type:Number,
        require:true
    }


})


module.exports = mongoose.model("OTP_Details",OTPDetails); 