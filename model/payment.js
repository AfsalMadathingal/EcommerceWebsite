const mongoose = require('mongoose')

const paymentDetails = mongoose.Schema({


    userId :{

         type: mongoose.Schema.Types.ObjectId,
         require:true
    },
    orderId:{
        type: mongoose.Schema.Types.ObjectId,
        require:true
    } ,
    
    amount:{
        type:Number,
        require:true
    },
     
    status :{

        type:String
    },
    paymentMethod:
    {
        type:String
    },
    transactionid:{
        type:String
    },

    paymentDate:{
        type:Date
    }
    

})

module.exports = mongoose.model('paymentDetails',paymentDetails)