const mongoose = require('mongoose')

const product_details = mongoose.Schema({

  product_id: {
    type: Number,
    require: true,
  },
  product_name: {
    type: String,
    require: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  about_product: {
    type: String,
    require: true,
  },
  is_listed: {
    type: Boolean,
    require: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  
}); 

module.exports=mongoose.model("product_Details",product_details);