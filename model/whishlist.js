const mongoose= require('mongoose')

const whishlists= mongoose.Schema({

    productVarientId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true

    },
    user:
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})