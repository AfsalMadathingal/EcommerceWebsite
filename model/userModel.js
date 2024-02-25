const mongoose= require('mongoose')

//Creating Schema
const userDetails= mongoose.Schema({

    name:{
        type:String,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    is_Blocked:{
        type: Boolean,
        default:0
    },
    password_encrypted:{
        type: String,
        required: true
    },
    date_joined:{
        type:Date,
        require:true
    },
    cartValue:{
        type:Number,
        default:0
    }
    ,
    chatStatus:{
        type:Boolean,
        default:0
    }
})


module.exports = mongoose.model("user_details",userDetails); 