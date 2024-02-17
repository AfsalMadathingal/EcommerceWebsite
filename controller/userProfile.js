//Requiring Nessesery Modules
const products = require("../model/productsModel.js");
const size = require("../model/sizeModel.js");
const color = require("../model/colorModel.js");
const category = require("../model/categoryModel.js");
const productVariants = require("../model/productVariants.js");
const user = require("../model/userModel.js");
const address = require("../model/userAddress.js");
const cart = require("../model/cart.js");
const order = require("../model/orderModel.js");
const payment = require("../model/payment.js");
const couponsDB = require("../model/couponsModel.js");
const walletDB = require('../model/walletModel.js');
const whishlistDB = require('../model/whishlist.js');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { text } = require("express");
const saltRounds = 10;
const Razorpay = require('razorpay');
const {offerChecker} = require('../controller/UserSideProducts.js')



//profile related Middlewares
const loadChangePassword = async (req, res) => {
  try {
    const personalInfo = await user.findOne({ _id: req.session.user_id });
    res.render("user/resetPassword", {
      personalInfo: personalInfo,
      user: true,
      userId: req.session.user_id,
    });
  } catch (error) {}
};

const resetPassword = async (req, res) => {
  try {
    console.log("reset password");

    const id = req.body.id;
    const oldPassword = req.body.OldPassword;
    const newPassword = req.body.Password;

    let userData = await user.findOne({ _id: id });
    let cryptResult = await bcrypt.compare(
      oldPassword,
      userData.password_encrypted
    );

    if (cryptResult) {
      const password = await bcrypt.hash(newPassword, saltRounds);

      await user.updateOne(
        { _id: id },
        {
          $set: {
            password_encrypted: password,
          },
        }
      );

      res.json(true);
      console.log("true");
    } else {
      res.json(false);
      console.log("false");
    }
  } catch (error) {
    console.log(error);
  }
};

const editProfile = async (req, res) => {
  try {
    const { userId, fullname, phone, email, gender } = req.body;

    console.log(userId, fullname, phone, email, gender);

    const response = await user.updateOne(
      { _id: userId },
      {
        $set: {
          name: fullname,
          gender: gender,
          phone: phone,
          email: email,
        },
      }
    );

    console.log(response);

    res.json("done");
  } catch (error) {}
};

const loadProfile = async (req, res) => {

console.log("hello from load profile");
  if (req.session.user_id == req.params.id) {
    const personalInfo = await user.findOne({ _id: req.params.id });
   
    res.render("user/personalinformation", {
      personalInfo: personalInfo,
      user: true,
      userId: req.session.user_id,
    });
  } else {
    res.redirect("'/user_login_form'");
  }
};


//order realted Middlewares
const loadOrders = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId == req.session.user_id) {
      
      const cartData = await order.find({ userId: userId });


      const orderData = await order.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) },
        },

        {
          $lookup: {
            from: "addresses",
            foreignField: "_id",
            localField: "deliveryAddress",
            as: "address",
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            addressName: { $arrayElemAt: ["$address.name", 0] },
            addressLine1: { $arrayElemAt: ["$address.addressLine1", 0] },
            addressLine2: { $arrayElemAt: ["$address.addressLine2", 0] },
            addressPincode: { $arrayElemAt: ["$address.pincode", 0] },
            addressMobile: { $arrayElemAt: ["$address.mobile", 0] },
            orderAmount: 1,
            orderNo: 1,
            OrderedItems: 1,
            orderStatus: 1,
            orderDate: 1,
          },
        },
        {
          $unwind: "$OrderedItems",
        },
        {
          $lookup: {
            from: "product_varients",
            foreignField: "_id",
            localField: "OrderedItems.product_varient_id",
            as: "items",
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            addressName: 1,
            addressLine1: 1,
            addressLine2: 1,
            addressPincode: 1,
            addressMobile: 1,
            orderAmount: 1,
            orderNo: 1,
            OrderedItems: 1,
            orderStatus: 1,
            itemId: { $arrayElemAt: ["$items.product", 0] },
            image: { $arrayElemAt: ["$items.images", 0] },
            quantity:{$arrayElemAt:["$items.quantity",0]},
            price: { $arrayElemAt: ["$items.price", 0] },
            orderDate: 1,
          },
        },
        {
          $lookup: {
            from: "product_details",
            foreignField: "_id",
            localField: "itemId",
            as: "product",
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            addressName: 1,
            addressLine1: 1,
            addressLine2: 1,
            addressPincode: 1,
            addressMobile: 1,
            orderAmount: 1,
            orderNo: 1,
            OrderedItems: 1,
            orderStatus: 1,
            itemId: 1,
            productname: { $arrayElemAt: ["$product.product_name", 0] },
            orderDate: 1,
            image: { $arrayElemAt: ["$image", 0] },
          },
        },
        {
          $group: {
            _id: {
              _id: "$_id",
              userId: "$userId",
              orderNo: "$orderNo",
              orderDate: "$orderDate",
              orderStatus: "$orderStatus",
              addressName: "$addressName",
              addressLine1: "$addressLine1",
              addressLine2: "$addressLine2",
              addressPincode: "$addressPincode",
              addressMobile: "$addressMobile",
              cancel: "$cancel",
            },
            OrderedItems: {
              $push: {
                variantId: "$OrderedItems",
                itemId: "$itemId",
                productname: "$productname",
                image: "$image",
              },
            },
            orderAmount: { $first: "$orderAmount" },
          },
        },
        {
          $project: {
            _id: "$_id._id",
            userId: "$_id.userId",
            orderNo: "$_id.orderNo",
            orderAmount: "$orderAmount",
            orderDate: "$_id.orderDate",
            orderStatus: "$_id.orderStatus",
            addressName: "$_id.addressName",
            addressLine1: "$_id.addressLine1",
            addressLine2: "$_id.addressLine2",
            addressPincode: "$_id.addressPincode",
            addressMobile: "$_id.addressMobile",
            cancel: "$_id.cancel",
            OrderedItems: 1,
          },
        },
        {
          $sort:{
            orderDate:-1
          }
        }
      ]);

      console.log(JSON.stringify(orderData[0]));
      //date formating
      orderData.forEach(async (element1) => {

        const dateString = element1.orderDate;
        const dateObject = new Date(dateString);
        // Get day, month, and year
        const day = dateObject.getDate();
        const month = dateObject.getMonth() + 1; // Note: Months are zero-indexed, so we add 1
        const year = dateObject.getFullYear();
        // Format the date components
        const formattedDate = `${day}/${month}/${year}`;
        element1.orderDate = formattedDate;

        if (element1.orderStatus == "Cancelled") {
          element1.cancel = true;
        }
      });

      console.log(orderData);

      const personalInfo = await user.findOne({ _id: req.session.user_id });

      res.render("user/myOrders", {
        orderData: orderData,
        user: true,
        personalInfo: personalInfo,
        userId: req.session.user_id,
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

const loadChekOut = async (req, res) => {
  try {
    const userId = req.session.user_id;
    
    const addressData = await address.find({ userId: userId });
    const userData = await user.find({ _id: userId });
    let cartValue = userData[0].cartValue;

    if (req.session.appliedCoupon)
    {
      if (req.session.discountPercentage)
      {
        value = (req.session.discountPercentage/ 100) * cartValue
        cartValue -= value
        req.session.discount = value
  
      }else if(req.session.discountAmount)
      {
  
        cartValue-=req.session.discountAmount
        req.session.discount = req.session.discountAmount
      }
      

    }else
    {
      req.session.discount = 0
    }
    

    if(cartValue == 0){

      res.redirect(`/profile/mycart/load/${userId}`);

    }

    console.log(addressData);
    console.log(cartValue);

    res.status(200).render("user/checkoutnew", 
    {

      discount:req.session.discount,
      user: true,
      address: addressData,
      cartValue: cartValue,
      userId: userId,

    });
  } catch (error) {
    console.log(error);
  }
};


const placeOrder = async (req, res) => {
  
  const {  userId,selectedAddress ,walletPayment} = req.body;
 
  try {

    const addressData = await address.find({ _id: selectedAddress });
    const userData = await user.find({ _id: userId });
    const cartData = await cart.find({ userId: userId });
    const orderNo = Math.floor(100000 + Math.random() * 900000);
    let totalAmount ;
    const subTotal  = userData[0].cartValue
    let products = [];
    const date= new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })

    //geting productVariant Id to a array
    cartData.forEach((element) => {
      products.push({ product_varient_id: element.product_varient_id, quantity: element.quantity });
    });

    console.log("order body", req.session.order );

    if ( req.session.order )
    {

      transactionId =  req.session.order.razorpay_payment_id
      paymentMethod="Online"

    }else if(walletPayment)
    {

      transactionId = "WalletTransaction"
      paymentMethod="Wallet"
    }
    else
    {
      transactionId = "COD"
      paymentMethod="cod"
    }

    if (req.session.discount)
    {
      totalAmount = userData[0].cartValue- req.session.discount;
    }else
    {
      totalAmount = userData[0].cartValue
    }
   
    const orderData = new order({
      userId: userId,
      orderAmount: totalAmount,
      deliveryAddress: selectedAddress,
      orderDate: date,
      OrderedItems: products,
      orderNo: orderNo,
      paymentMethod: paymentMethod,
      transactionId:transactionId,
      coupon : req.session.coupon ? req.session.coupon.code : null,
      subTotal,
      discount:req.session.discount,
    });

    const paymentData = new payment({
      userId: userId,
      orderId: orderData._id,
      amount: totalAmount,
      status: "completed",
      paymentMethod: paymentMethod,
      transactionid: transactionId,
      paymentDate: new Date(),
    });

    await orderData.save();
    await paymentData.save();
    await cart.deleteMany({ userId: userId });
    await user.updateOne({ _id: userId }, { $set: { cartValue: 0 } });

    console.log("coupon from order creation",req.session.coupon);

    req.session.dataForOrder = {
      discount: req.session.discount ? req.session.discount : null,
      user: true,
      addressData: addressData,
      totalAmount: totalAmount,
      orderId: orderNo,
      userId: req.session.user_id,
      subTotal:subTotal
    };

    req.session.appliedCoupon = false

    res.json(true);

  } catch (error) {

    res.json("something error please close the tab and open again");

    console.log(error);
  }
};


const orderSuccess = async (req, res) => {
  
  try {
    

    console.log("ordersuccess ",req.session.dataForOrder);

    res.render("user/orderPlaced", req.session.dataForOrder);

    


  } catch (error) {

    console.log(error);
    
  }
}

const placeOrderRazopay = async (req,res)=>{



}

const cancelOrder = async (req, res) => {
  try {
    const id = req.body.id;

    await order.updateOne(
      { _id: id },
      {
        $set: {
          orderStatus: "Cancelled",
        },
      }
    );

    res.json(true);
  } catch (error) {
    console.log(error);
  }
};

const viewOrder = async (req,res)=>{

  try {
    

    const {id}= req.params
    
    const orderData = await order.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },

      {
        $lookup: {
          from: "addresses",
          foreignField: "_id",
          localField: "deliveryAddress",
          as: "address",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          addressName: { $arrayElemAt: ["$address.name", 0] },
          addressLine1: { $arrayElemAt: ["$address.addressLine1", 0] },
          addressLine2: { $arrayElemAt: ["$address.addressLine2", 0] },
          addressPincode: { $arrayElemAt: ["$address.pincode", 0] },
          addressMobile: { $arrayElemAt: ["$address.mobile", 0] },
          orderAmount: 1,
          orderNo: 1,
          OrderedItems: 1,
          orderStatus: 1,
          orderDate: 1,
          paymentMethod: 1,
          transactionId: 1,
          coupon:1,
          subTotal:1,
        },
      },
      {
        $unwind: "$OrderedItems",
      },
      {
        $lookup: {
          from: "product_varients",
          foreignField: "_id",
          localField: "OrderedItems.product_varient_id",
          as: "items",
        },
      },
      {
        $project: {
          _id: 1,
          subTotal:1,
          userId: 1,
          addressName: 1,
          addressLine1: 1,
          addressLine2: 1,
          addressPincode: 1,
          addressMobile: 1,
          orderAmount: 1,
          paymentMethod: 1,
          orderNo: 1,
          OrderedItems: 1,
          orderStatus: 1,
          coupon:1,
          itemId: { $arrayElemAt: ["$items.product", 0] },
          image: { $arrayElemAt: ["$items.images", 0] },
          quantity: { $arrayElemAt: ["$items.quantity", 0] },
          orderDate: 1,
          transactionId: 1,
        },
      },
      {
        $lookup: {
          from: "product_details",
          foreignField: "_id",
          localField: "itemId",
          as: "product",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          coupon:1,
          subTotal:1,
          addressName: 1,
          addressLine1: 1,
          addressLine2: 1,
          addressPincode: 1,
          addressMobile: 1,
          orderAmount: 1,
          orderNo: 1,
          OrderedItems: 1,
          orderStatus: 1,
          paymentMethod: 1,
          itemId: 1,
          productname: { $arrayElemAt: ["$product.product_name", 0] },
          orderDate: 1,
          image: { $arrayElemAt: ["$image", 0] },
          transactionId: 1,
        },
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            userId: "$userId",
            orderNo: "$orderNo",
            orderDate: "$orderDate",
            orderStatus: "$orderStatus",
            addressName: "$addressName",
            addressLine1: "$addressLine1",
            addressLine2: "$addressLine2",
            addressPincode: "$addressPincode",
            addressMobile: "$addressMobile",
            cancel: "$cancel",
            paymentMethod: "$paymentMethod",
            transactionId: "$transactionId",
            coupon:"$coupon",
            subTotal:"$subTotal",
          },
          OrderedItems: {
            $push: {
              variantId: "$OrderedItems",
              itemId: "$itemId",
              productname: "$productname",
              image: "$image",
            },
          },
          orderAmount: { $first: "$orderAmount" },
        },
      },
      {
        $project: {
          _id: "$_id._id",
          userId: "$_id.userId",
          orderNo: "$_id.orderNo",
          orderAmount: "$orderAmount",
          orderDate: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$_id.orderDate",
            },
          },
          orderStatus: "$_id.orderStatus",
          addressName: "$_id.addressName",
          addressLine1: "$_id.addressLine1",
          addressLine2: "$_id.addressLine2",
          addressPincode: "$_id.addressPincode",
          addressMobile: "$_id.addressMobile",
          cancel: "$_id.cancel",
          OrderedItems: 1,
          paymentMethod: "$_id.paymentMethod",
          transactionId: "$_id.transactionId",
          coupon:"$_id.coupon",
          subTotal:"$_id.subTotal"
        },
      },
    ]);


console.log("order Data",orderData[0]);
      res.render('user/orderDetails',{

        user:true,
        userId: req.session.user_id,
        orderData:orderData[0]
    
      } )




  } catch (error) {


    console.log(error);
    
  }


}

const viewInvoice = async (req,res)=>{

  try {
    const {id}= req.params;
    
    const orderData = await order.aggregate([{
      $match: {_id: new mongoose.Types.ObjectId(id)}
    },

    {
      $unwind:"$OrderedItems"
    },
    {
      $lookup:{
        from:"addresses",
        foreignField:"_id",
        localField:"deliveryAddress",
        as:"AddressInfo"
      }
    },{
      $project:{

        _id:1,
        userId:1,
        orderAmount:1,
        addressName:{$arrayElemAt:["$AddressInfo.name",0]},
        addressLine1:{$arrayElemAt:["$AddressInfo.addressLine1",0]},
        addressLine2: {$arrayElemAt:["$AddressInfo.addressLine2",0]},
        city:{$arrayElemAt:["$AddressInfo.city_dist_town",0]},
        state:{$arrayElemAt:["$AddressInfo.state",0]},
        mobile:{$arrayElemAt:["$AddressInfo.mobile",0]},
        pincode:{$arrayElemAt:["$AddressInfo.pincode",0]},
        orderNo:1,
        orderStatus:1,
        OrderedItems:1,
        orderDate:1,

      }
    },{
      $lookup:{
        from:"product_varients",
        foreignField:"_id",
        localField:"OrderedItems.product_varient_id",
        as:"Items"
      }
    },
    {
    $project:{

      _id:1,
      userId:1,
      orderAmount:1,
      addressName:1,
      addressLine1:1,
      addressLine2: 1,
      city:1,
      state:1,
      orderNo:1,
      orderStatus:1,
      Items:1,
      mobile:1,
      pincode:1,
      orderDate:1,
      OrderedItems:1,
    }
  },{
    $unwind:"$Items"
  },{
    $project:{

      _id:1,
      userId:1,
      orderAmount:1,
      addressName:1,
      addressLine1:1,
      addressLine2: 1,
      city:1,
      state:1,
      orderNo:1,
      orderStatus:1,
      Items:1,
      pricePerItem:"$Items.price",
      productId:"$Items.product",
      quantity:"$OrderedItems.quantity",
      mobile:1,
      pincode:1,
      orderDate:1,


    }
  },{
    $lookup:
      {
        from:"product_details",
        foreignField:"_id",
        localField:"productId",
        as:"productDetails"
      }

    
  },{
    $project:{
      _id:1,
      userId:1,
      orderAmount:1,
      addressName:1,
      addressLine1:1,
      addressLine2: 1,
      city:1,
      state:1,
      orderNo:1,
      orderStatus:1,
      pricePerItem:1,
      productDetails:1,
      productId:1,
      productName: {$arrayElemAt:["$productDetails.product_name",0]},
      productAbout:{$arrayElemAt:["$productDetails.about_product",0]},
      mobile:1,
      pincode:1,
      orderDate:1,
      Items:1,
      quantity:1,
      test:1,

    }
  }
  ])

console.log(JSON.stringify(orderData));
  orderData.forEach((element) => {
    // Provided date string
    const dateString = element.orderDate;

    // Create a new Date object from the provided string
    const dateObject = new Date(dateString);

    // Get day, month, and year
    const day = dateObject.getDate();
    const month = dateObject.getMonth() + 1; // Note: Months are zero-indexed, so we add 1
    const year = dateObject.getFullYear();

    // Format the date components
    const formattedDate = `${day}/${month}/${year}`;

    element.datejoined = formattedDate;


  });


  let mergedOrders = orderData.map(order => ({
    ...order,
    productData: {
        ...order.Items,
        ...order.productDetails[0],
        quantity:order.quantity,
         // Assuming there's only one productDetails per order, adjust as needed
    },
    
    // Remove the original Items and productDetails fields
    Items: undefined,
    productDetails: undefined,
}));

console.log("mergeredOrders",mergedOrders);
if (mergedOrders.length > 1) {
  mergedOrders[0].productData = mergedOrders.map(order => order.productData);
  mergedOrders.splice(1);  // Remove the remaining orders
}

  
  
  

  const Data=mergedOrders[0]
  let productData
  console.log(Data);

  if (typeof Data.productData === 'object' && !Array.isArray(Data.productData)) {
    productData = [Data.productData];
   
  } else {
    productData = Data.productData;
    console.log("else", productData);
    
  }
 

  console.log(productData);
    
     res.status(200).render('user/orderInvoice',{orderData:Data,productData:productData ,user:true,userId:req.session.user_id});

  } catch (error) {
    console.log(error);
  }
}




//address Related Middlewares
const loadAddress = async (req, res) => {
  try {
    if (req.session.user_id == req.params.id) {
      const addressData = await address.find({ userId: req.params.id });
      const personalInfo = await user.findOne({ _id: req.params.id });

      console.log(addressData);
      res.render("user/manageAddress", {
        personalInfo: personalInfo,
        addressData: addressData,
        user: true,
        userId: req.session.user_id,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await address.findOne({ _id: id });

    console.log(data);

    res.render("user/editAddress", {
      addressData: data,
      user: true,
      userId: req.session.user_id,
    });
  } catch (error) {
    console.log(error);
  }
};

const editAddress = async (req, res) => {
  try {
    const {
      id,
      name,
      mobileNumber,
      address1,
      address2,
      city,
      state,
      pincode,
      addresstype,
    } = req.body;

    const response = await address.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          mobile: mobileNumber,
          pincode: pincode,
          addressLine1: address1,
          addressLine2: address2,
          city_dist_town: city,
          state: state,
          type: addresstype,
        },
      }
    );

    if (response.acknowledged) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {
    console.log(error);

    res.json(false);
  }
};

const loaAddNewAddress = async (req, res) => {
  if (req.session.user_id == req.params.id) {
    const personalInfo = await user.findOne({ _id: req.params.id });

    console.log(personalInfo);

    res.render("user/addAddress", {
      personalInfo: personalInfo,
      user: true,
      userId: req.session.user_id,
    });
  } else {
    res.redirect("/");
  }
};

const AddNewAddress = async (req, res) => {
  const addressdata = req.body;

  const addressData = new address({
    userId: req.session.user_id,
    name: addressdata.name,
    mobile: addressdata.mobileNumber,
    pincode: addressdata.pincode,
    addressLine1: addressdata.address1,
    addressLine2: addressdata.address2,
    city_dist_town: addressdata.city,
    state: addressdata.state,
    type: addressdata.addresstype,
  });

  if (req.session.user_id == req.params.id) {
    try {
      await addressData.save();

      res.redirect(`/profile/manageaddress/${req.session.user_id}`);
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.body;

    const response = await address.deleteOne({ _id: id });

    console.log(response);

    res.json(response);
  } catch (error) {}
};


//Cart Related Middlewares
const loadCart = async (req, res) => {


  try {

     paramsId = req.params.id;
     sessionId = req.session.user_id;

    ['coupon','couponId', 'discountAmount', 'discountPercentage', 'discount'].forEach(variable => {
      delete req.session[variable];
    });


    if (paramsId == sessionId) {

      const cartData = await cart.find({ userId: sessionId });
      console.log(cartData);
      if(cartData[0])
      {
        productData = await productVariants.findOne({
          _id: cartData[0].product_varient_id,
        });
      }
     
    

      let items = await cart.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(paramsId),
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
        }
      ]);
      
      



      const newData=[]

      items.forEach((data) => {
        if(data.offer.length>0)
        {
          data.offer= data.offer[0];
        }
      })

      items.forEach((data) => {
        console.log("calculation",data);
        if (true)

        {
          
          
          if (data.offer.discount_type)
          {
            data.offerprice = data.price - data.offer.discount_value;
            data.offerEndDate= data.offer.offer_end_date;
            newData.push(data);
            console.log("newData",newData);
    
    
          }else
          {
            const toDiscount = (data.offer.discount_value/100)*data.price;
            data.offerprice = data.price - toDiscount;
            data.offerEndDate= data.offer.offer_end_date;
            newData.push(data);
            console.log("newData",newData);
            
          }
        }
        

      })
      
    
      


      if (newData.length > 0) {
     
        for (i = 0; i < newData.length; i++) {
          newData[i].image = `/uploads/${newData[i].productImage[0]}`;
          newData[i].totalAmount = newData[i].quantity * newData[i].offerprice;
        }

        items= newData;

      }else
      {
        for (i = 0; i < items.length; i++) 
        {
          items[i].image = `/uploads/${items[i].productImage[0]}`;
          items[i].totalAmount = items[i].quantity * items[i].price;
        }

      }

 
      
      //let productData= newData.length > 0 ? newData : items;
      

      const personalInfo = await user.findOne({ _id: req.session.user_id });
      const coupon = await couponsDB.find({});
      
      if (personalInfo.cartValue == 0) {
       
        res.render("user/emptyCart")
      }else
      {
        res.render("user/cart", {
          coupon : coupon,
          items: items,
          user: true,
          personalInfo: personalInfo,
          userId: req.session.user_id,
        });
      }
      
    }

    

  } catch (err) {
    
    console.log(err);
  }
};

const deleteItemCart = async (req, res) => {
  try {
    //deleting cart item and minus the amount from user database
    const deletedData = await cart.findOneAndDelete({ _id: req.body.cartId });

    const product = await productVariants.findOne({
      _id: deletedData.product_varient_id,
    });

    const quantity = deletedData.quantity;
    const price = product.price;
    const totalAmount = quantity * price;
    await user.updateOne(
      { _id: req.session.user_id },
      { $inc: { cartValue: -totalAmount } }
    );

    const { cartValue } = await user.findOne({ _id: req.session.user_id });

    res.json(cartValue);
  } catch (error) {
    console.log(error);
  }
};

const updateCart = async (req, res) => {
  try {

    const oldCart = await cart.findOne({ _id: req.body.cartIdForUpdate });

    const price = oldCart.price;

    const newValue = req.body.newValue * price;

    await cart.updateOne(
      {
        _id: req.body.cartIdForUpdate,
      },
      {
        $set: { quantity: req.body.newValue, value: newValue },
      }
    );

    const totalCartValue = await cart.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.session.user_id),
        },
      },
      {
        $group: {
          _id: "", 
          totalValue: {
            $sum: "$value",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalValue: 1,
        },
      },
    ]);

    let updatedValue = totalCartValue[0].totalValue;
   

    await user.updateOne(
      { _id: req.session.user_id },
      {
        $set: {
          cartValue: updatedValue,
        },
      }
    );

    cartData = await cart.find({ userId: sessionId });

    productData = await productVariants.findOne({
      _id: cartData[0].product_varient_id,
    });

    const items = await cart.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(paramsId),
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
        },
      },
    ]);

    for (i = 0; i < items.length; i++) {
      items[i].image = `/uploads/${items[i].productImage[0]}`;
      items[i].totalAmount = items[i].quantity * items[i].price;
    }

    const { cartValue } = await user.findOne({ _id: req.session.user_id });

    //sending data to fetch
    const responseData = {
      message: "Data received successfully",
      cartId: req.body.cartIdForUpdate,
      items,
      cartValue,
    };
    res.json(responseData);
  } catch (error) {
    console.log(error);
  }
};

const addBalance = async (req,res)=>{


  try 
  {

    let {amount}= req.body;
    const userId = req.session.user_id
    const addingAmount = Number(amount)
    // Check if the user exists, if not, insert a new user with the given balance
    const existingUser = await walletDB.findOne({ userId: userId });

    if (!existingUser) {
      await walletDB.insertMany([{ userId: userId, balance: amount }]);
    } else {
      const oldAmount= existingUser.balance
      amount= Number(amount)
      amount +=oldAmount

      await walletDB.updateOne({ userId: userId }, { $set: { balance: amount} });

      await walletDB.updateOne(
        { userId: userId },
        {
          $push: {
            transaction: { amount: addingAmount, type: "credit", date: new Date() },
          },
        }
      );
      }

    const walletData = await walletDB.findOne({userId:req.session.user_id})

    console.log(walletData);

    res.json({walletData})
    
  } 
  catch (error) {

    console.log(error);

  }

}

const loadWallet = async (req,res)=>{

  try {

    const walletData = await walletDB.find({userId:req.session.user_id})

    walletData.forEach((data) => {
  data.transaction.forEach((txn) => {
    txn.amount = (txn.type === "credit" ? "+" : "-") + txn.amount;
  });
});

    console.log("data wlaler",walletData);

    res.render('user/myWallet' , {
      user:true,
      userId:req.session.user_id,
      walletData:walletData[0]

    })

    
  } catch (error) {
    
    console.log(error);
  }
}

const addToWishList = async (req,res)=>{
  
  try {
    
    const {id} = req.body
    const userId = req.session.user_id


    const data = await productVariants.findOne({_id:id}).populate("product")


    const response = await whishlistDB.updateOne({user:userId},{
      $push:{
        productVarientId:new mongoose.Types.ObjectId(id)
      }
    })
    if(response.matchedCount===0){

      await whishlistDB.insertMany([{user:userId,productVarientId:new mongoose.Types.ObjectId(id)}])
    }
   

    res.json({success:true,data})


  } catch (error) {
    
    console.log(error);
  }
}

const loadWishList = async (req,res)=>{
  
  try {
    
    

    const whishlistData = await whishlistDB.aggregate([
      {
          $match: {
              user:  new mongoose.Types.ObjectId(req.session.user_id),
          }
      },
      {
          $unwind: "$productVarientId"
      },
      {
        $lookup: {
          from: "product_varients",
          localField: "productVarientId",
          foreignField: "_id",
          as: "product",
        },

      },
      {
        $project: {
          _id: 1,
          productVarientId: 1,
          productid: { $arrayElemAt: ["$product.product", 0] },
          productName: { $arrayElemAt: ["$product.product_name", 0] },
          productImage: { $arrayElemAt: ["$product.images", 0] },
          price: { $arrayElemAt: ["$product.price", 0] },
          stock: { $arrayElemAt: ["$product.stock", 0] },
        },
      },
      {
        $lookup: {
          from: "product_details",
          localField: "productid",
          foreignField: "_id",
          as: "product",
        },

      },
      {
        $addFields: {
          productName: "$product.product_name",
        }
      }
      
    ])

    whishlistData.forEach((data)=>{
      
      data.productImage = data.productImage[0]
    })
   
  
console.log(whishlistData);
   

    res.render(
      "user/myWishlist",
      {
        user:true,
        userId:req.session.user_id,
        whishlistData:whishlistData
      }
    )
  } 
  catch (error) 
  {

    console.log(error);
  }
}


const removeFromWishList = async (req,res)=>{
  
  try 
  {

    const {whishlistId,productid}= req.body
    console.log("this is product id",productid);
    const query = {_id:whishlistId}

    const response = await whishlistDB.updateOne(
      query,
      { $pull: { productVarientId: new mongoose.Types.ObjectId(productid) } },
      { new: true },
    );

    console.log(response);
    
    if (response.modifiedCount > 0) {

      res.json({success:true})

    }else
    {

      res.json({success:false})
    }



  } catch (err) {

    console.log(err);
    
  }
}

//exporting every middlewares

module.exports = {
  loadProfile,
  loadAddress,
  loaAddNewAddress,
  AddNewAddress,
  loadCart,
  deleteItemCart,
  updateCart,
  loadChekOut,
  placeOrder,
  loadOrders,
  loadChangePassword,
  resetPassword,
  cancelOrder,
  editProfile,
  loadEditAddress,
  editAddress,
  deleteAddress,
  viewOrder,
  viewInvoice,
  placeOrderRazopay,
  orderSuccess,
  addBalance,
  loadWallet,
  addToWishList,
  loadWishList,
  removeFromWishList
};
