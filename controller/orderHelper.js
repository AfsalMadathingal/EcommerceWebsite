const mongoose = require("mongoose");
const userDB = require("../model/userModel");
const orderDB = require("../model/orderModel");
const walletDB = require("../model/walletModel");
const couponsDB = require("../model/couponsModel");
const productDB = require("../model/productsModel");
const productVariantsDB = require("../model/productVariants");
const cartDB = require("../model/cart");




const orderCreate = async (req, res) => {

    let cartValue=0;

      let items = await cartDB.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.session.user_id),
        },
      },
      {
        $lookup: {
          from: "product_varients",
          foreignField: "_id",
          localField: "product_varient_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          quantity: { $toInt: "$quantity" },
          productid: { $arrayElemAt: ["$productDetails.product", 0] },
          productImage: { $arrayElemAt: ["$productDetails.images", 0] },
          stock: { $arrayElemAt: ["$productDetails.stock", 0] },
          price: { $arrayElemAt: ["$productDetails.price", 0] },
          offer: { $arrayElemAt: ["$productDetails.offer", 0] },
        },
      },
      {
        $lookup: {
          from: "product_details",
          foreignField: "_id",
          localField: "productid",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          quantity: 1,
          productName: { $arrayElemAt: ["$productDetails.product_name", 0] },
          productImage: 1,
          stock: 1,
          price: 1,
          offer: 1,
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offer",
          foreignField: "_id",
          as: "offer",
        },
      },
    ]);
    
    
    
    const newData = [];
    
    items.forEach((data) => {
      if (data.offer.length > 0) {
        data.offer = data.offer[0];
      }
    });
    
    
    
    items.forEach(data => {
      
      if (!Array.isArray(data.offer)) {
          if (data.offer.discount_type) {
              data.offerprice = data.price - data.offer.discount_value;
          } else {
              const discountAmount = (data.offer.discount_value / 100) * data.price;
              data.offerprice = data.price - discountAmount;
          }
          data.offerEndDate = data.offer.offer_end_date;
          newData.push(data);
      } else {
          data.offer = false;
          newData.push(data);
      }
    });
    
    
    
      for (let i = 0; i < newData.length; i++) 
      {
        const currentItem = newData[i];
        const hasOffer = currentItem.offer !== false;
        currentItem.totalAmount = currentItem.quantity * (hasOffer ? currentItem.offerprice : currentItem.price);
        req.session.offerTotal += currentItem.totalAmount;
    
        if (i === 0) {
            req.session.offerTotal = currentItem.totalAmount;
            req.session.OfferDiscount = 0;
        }
    
        if (hasOffer) {
            req.session.OfferDiscount += (currentItem.price - currentItem.offerprice) * currentItem.quantity;
        }
    }
    
    cartValue = newData.reduce((acc, item) => acc + item.totalAmount, 0)

    if (req.session.appliedCoupon) {

        if (req.session.discountPercentage) 
        {
          value = (req.session.discountPercentage / 100) * cartValue;
          cartValue -= value;
          req.session.discount = value;
        } else if (req.session.discountAmount) 
        {
          cartValue -= req.session.discountAmount;
          req.session.coponDiscount = req.session.discountAmount;
        }
  
      } else if(req.session.offerTotal) 
      {
  
        cartValue = req.session.offerTotal;
        
      }
      else
      {
        req.session.coponDiscount = 0;
      }


  

    
    return  cartValue




}








module.exports = {
 
    
    orderCreate,

}