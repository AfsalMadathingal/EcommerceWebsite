const mongoose = require('mongoose')
const categorydetails= require('./categoryModel')


const offer = mongoose.Schema({

    offer_title: {
        type: String,
        require: true
    },
    offer_banner: {
        type: String,
        require: true
    },
    offer_details: {
        type: String,
        require: true
    },
    discount_type: {
        type: Boolean,
        require: true
    },
    discount_value: {
        type: Number,
        default:0
    },
    offer_start_date: {
        type: Date,
        require: true
    },
    offer_end_date: {
        type: Date,
        require: true
    },offer_category:{
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: categorydetails
    },
    offer_price:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('offers', offer)