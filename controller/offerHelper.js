const offerDB = require('../model/offerModel');
const catogoryDB = require('../model/categoryModel')
const category = require('../model/categoryModel');


const loadOffers = async (req, res) => {

  try {

    const category = await catogoryDB.find({});
    const offerData = await offerDB.find({});
    console.log("hello",category);
 
    console.log(offerData);
    res.render('admin/offersManagement', { adminlogin: true, layout: "newSidebar",categories:category ,offerData:offerData })

  } catch (error) {
    console.log(error);
  }

    
  }

  const loadAddOffers = async (req, res) => {
  
try {

  const category = await catogoryDB.find({});

  console.log("load");
  res.render('admin/Addoffer',{ adminlogin: true, layout: "newSidebar", title:"Create Offer" ,category:category })

} catch (error) {
  console.log(error);
}
    
  
}

const loadEditOffer = async (req,res)=>{

  try {
    
    const {id} = req.params

   // const offerData = await offerDB.findOne({_id:id})

    const offerData = await offerDB.aggregate([
      {

      $match:{},


    },
    {
      $project:{

        _id:1,
        offer_title:1,
        offer_banner:1,
        offer_details:1,
        discount_type:1,
        discount_value:1,
        offer_start_date:{

          $dateToString:{
            format:"%Y-%m-%d",
            date:"$offer_start_date"
          }
        },
        offer_end_date:{

          $dateToString:{
            format:"%Y-%m-%d",
            date:"$offer_end_date"
          }
        }
      }
  
    }
   
  
  ])

  const category = await catogoryDB.find({});

    res.render('admin/Editoffer',{ adminlogin: true, layout: "newSidebar", title:"Edit Offer",id:id ,offerData:offerData[0],category:category })

  } catch (error) {
    console.log(error);
  }

  


}

const editOffer = async (req, res) => {
  try {

   
    
    let {offerId,OfferTitle,category,startDate,endDate,discountType,discountValue,offerDetails}=req.body;

    


    console.log(req.body);
    //discount type 1 = amount 0= percentage
    if (discountType=="amount")
    {
      discountType=1
    }else
    {
      discountType=0
    }



    if (req.files) {
      let filenames;

      req.files.forEach(function (file, index, arr) {
        filenames=file.filename
      });
      req.session.imagepath = filenames;
    }
  
  
  console.log(req.body);
    console.log(discountType);
    //discount type 1 = amount 0= percentage
    if (discountType=="amount")
    {
      discountType=1
    }else
    {
      discountType=0
    }

    

    const respons = await offerDB.updateOne({_id:offerId},{
      
      offer_title:OfferTitle,
      offer_banner:req.session.imagepath,
      offer_details:offerDetails,
      discount_type:discountType,
      discount_value:discountValue,
      offer_start_date:startDate,
      offer_end_date:endDate,
      offer_category:category,

    })
    
   

    console.log(respons);
    res.redirect('/admin/offers')




  } catch (error) {

    console.log(error);
  }

}


  const addOffer = async (req, res) => {

    if (req.files) {
      let filenames;

      req.files.forEach(function (file, index, arr) {
        filenames=file.filename
      });
      req.session.imagepath = filenames;
    }
  
    let {OfferTitle,category,startDate,endDate,discountType,discountValue,offerDetails}=req.body;
console.log(req.body);
    console.log(discountType);
    //discount type 1 = amount 0= percentage
    if (discountType=="amount")
    {
      discountType=1
    }else
    {
      discountType=0
    }

    await offerDB.insertMany([{
      
      offer_title:OfferTitle,
      offer_banner:req.session.imagepath,
      offer_details:offerDetails,
      discount_type:discountType,
      discount_value:discountValue,
      offer_start_date:startDate,
      offer_end_date:endDate,
      offer_category:category,

    }])
    
    res.redirect('/admin/offers')

  }
  

const deleteOffer   = async (req,res)=>{

    try {
      

      const {itemId} = req.body
      console.log(itemId);
      
      await offerDB.deleteOne({_id:itemId})

      res.json(true)
    } catch (error) {
      console.log(error);
    }

}
  module.exports = { 
    loadOffers,
    addOffer ,
    loadAddOffers,
    deleteOffer,
    loadEditOffer,
    editOffer
  }