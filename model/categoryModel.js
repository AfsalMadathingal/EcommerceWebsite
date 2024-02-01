const mongoose= require('mongoose')

//Creating Schema
const categoryDetails = mongoose.Schema({
    
  category: {
    type: String,
    require: true,
  }
  
});


module.exports = mongoose.model("categoryDetails",categoryDetails); 