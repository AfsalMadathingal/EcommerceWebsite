const couponsDB = require('../model/couponsModel');

const loadCoupons = async (req, res) => {


  try {

    // const couponData = await couponsDB.find({})
const couponData = await couponsDB.aggregate([
  {
    $match: {}
  },
  {
    $project: {
      code: 1,
      expireDate: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$expireDate", 
        },
      },
      discount: 1,
      discription: 1,
      userLimit: 1,
      discountType:1,
    }
  }
]);



   

    res.render('admin/couponManagement', { adminlogin: true, layout: "newSidebar", couponData:couponData ,pageTitle: "Coupons",})

  } catch (error) {

    console.log(error);
    
  }
  
    
  }


const addCoupons = async (req,res)=>{

  try {

    console.log(req.body);
    
    const {Couponid,Discount,expireDate,userlimit,discription,discountType }=req.body;

   const couponExist = await couponsDB.findOne({code:Couponid})

    if(couponExist)
    { 
    

    return res.json({success:false})
    
    }
    
    //discount type 1 = amount 0= percentage 
    let discountTypeValue;

    if (discountType=="amount")
    {
      discountTypeValue=1
    }else
    {
      discountTypeValue=0
    }
    
    const coupon = new couponsDB ({

      code: Couponid,
      discount:Discount,
      expireDate,
      userLimit:userlimit,
      discription,
      discountType:discountTypeValue
      
    })

    await coupon.save()

 
    res.json({success:true})
   

    
  } catch (error) {
    
    console.log(error);
  }
}

const editCoupon = async(req,res)=>{
    
  try {

    const {Couponid,discription,userlimit,expireDate,discountType,Discount,id} =req.body



    req.session.discount=0
    if (discountType=="amount")
    {
      req.session.discount=1
    }
    console.log(req.body);
    const respons= await couponsDB.updateOne({_id:id},{
      $set:{
        code:Couponid,
        discount:Discount,
        userLimit:userlimit,
        expireDate:expireDate,
        discription:discription,
        discountType:req.session.discount,
      }
    })

    
    console.log(respons);
    res.redirect('/admin/coupons')

  } catch (error) {
    console.log(error);
  }


}


const deleteCoupon = async(req,res)=>{


  try {
    
    const {id}=req.body
    const respons= await couponsDB.deleteOne({_id:id})
    
    console.log(respons);

    res.json(true)

  }
   catch (error) {
   console.log(error);
    
  }
}

module.exports = {
  loadCoupons,
  addCoupons,
  editCoupon,
  deleteCoupon

}