const mongoose=require('mongoose')

const color = mongoose.Schema({

    color:{
        type:String,
        require:true
    }
})

module.exports= mongoose.model("color",color)
