
const coupon = require("../model/couponsModel.js");

//discount type 1 = amount 0= percentage 

const applyCoupon= async (req,res)=>{
    
    try {
        
        const {couponCode}=req.body

        const couponData= await coupon.findOne({code:couponCode})
        req.session.coupon=couponData
        console.log(couponData);

        if(couponData)
        {
            req.session.couponid= couponData._id

            if(couponData.discountType)
            {
                req.session.discountAmount = couponData.discount
                req.session.discountPercentage = false
                

            }else
            {
                req.session.discountPercentage = couponData.discount
                req.session.discountAmount = false
              
            }

            req.session.appliedCoupon = true

            res.json({
                success:true,
                discountAmount:req.session.discountAmount,
                discountPercentage:req.session.discountPercentage
            })
        }else
        {
            res.json({success:false})
        }

    } catch (error) {
        
        console.log(error);
    }
}


module.exports= {

    applyCoupon,
}