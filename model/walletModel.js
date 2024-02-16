const mongoose = require('mongoose')

const wallets = mongoose.Schema({

    balance:{
        type:Number,
        require:true,

    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        require :true
    },
    transaction:{
        type:Array,
    }

})


module.exports = mongoose.model('wallets',wallets)
