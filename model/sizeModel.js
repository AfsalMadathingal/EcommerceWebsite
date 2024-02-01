const mongoose = require('mongoose')

const size = mongoose.Schema({

    size:{
        type:String,
        require:true
    }
})

module.exports = mongoose.model('sizes',size)