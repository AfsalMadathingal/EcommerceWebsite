const mongoose = require("mongoose");
const { array } = require("../middleware/upload");

const product_varient = mongoose.Schema({
    
  product: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  color_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },

  size_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  images: {
    type: mongoose.Schema.Types.Array,
    require: true,
  },
  stock: {
    type: Number,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },

  cost: {
    type: Number,
    require: true,
  },
  barcode: {
    type: Number,
    require: true,
  },

  avg_rating: {
    type: Number
  },

  review_count: {
    type: Number
  },
});

module.exports= mongoose.model("product_varients",product_varient)
