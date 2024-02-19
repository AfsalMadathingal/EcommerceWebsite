const mongoose = require('mongoose')

const referral = mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true
    },
    history:{
        type:Array,
    }
})


module.exports = mongoose.model('referrals',referral)