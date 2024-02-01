const mongoose = require('mongoose')

const carts= mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    product_varient_id: 
    {
        type:mongoose.Schema.Types.ObjectId, 
        required:true
    },
    quantity :{
        type:Number,
        required:true
    },
    value:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('carts',carts)