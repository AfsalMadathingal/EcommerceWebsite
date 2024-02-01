const mongoose= require('mongoose')

//Creating Schema
const adminDetails= mongoose.Schema({

    admin_id:{
        type: String,
        require:true
    },
    password:{
        type:String,
        require:true
    }


})

module.exports =  mongoose.model("admin",adminDetails); 

