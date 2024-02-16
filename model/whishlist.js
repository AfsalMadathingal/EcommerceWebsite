const mongoose= require('mongoose')

const whishlists= mongoose.Schema({

    productVarientId:{
        type:Array,
        required:true,
        ref:"product_varients"

    },
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})

module.exports = mongoose.model('whishlists',whishlists)