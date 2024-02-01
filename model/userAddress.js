const mongoose = require("mongoose");

const addresses = mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    require: true,
  },

  pincode: {
    type: Number,
    required: true,
  },
  addressLine1: {
    type: String,
    require: true,
  },
  addressLine2: {
    type: String,
    require: true,
  },

  city_dist_town: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required:true
  }
});
 
module.exports= mongoose.model('addresses',addresses)
 