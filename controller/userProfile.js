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
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { text } = require("express");
const saltRounds = 10;
const Razorpay = require('razorpay');




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
    const cartValue = userData[0].cartValue;

    console.log(addressData);
    console.log(cartValue);

    res.render("user/checkoutnew", {
      user: true,
      address: addressData,
      cartValue: cartValue,
      discount: 0,
      userId: userId,
    });
  } catch (error) {
    console.log(error);
  }
};


const placeOrder = async (req, res) => {
  
  console.log(req.body);

  const {  userId,selectedAddress } = req.body;

  try {

    const addressData = await address.find({ _id: selectedAddress });
    const userData = await user.find({ _id: userId });
    const cartData = await cart.find({ userId: userId });
    const orderNo = Math.floor(100000 + Math.random() * 900000);
    const totalAmount = userData[0].cartValue;
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
    }else
    {
      transactionId = "COD"
      paymentMethod="cod"
    }
    const orderData = new order({
      userId: userId,
      orderAmount: totalAmount,
      deliveryAddress: selectedAddress,
      orderDate: date,
      OrderedItems: products,
      orderNo: orderNo,
      paymentMethod: paymentMethod,
      transactionId:transactionId
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

    
    
    
    req.session.dataForOrder = {
      user: true,
      addressData: addressData,
      totalAmount: totalAmount,
      orderId: orderNo,
      userId: req.session.user_id,
    };

    res.json(true);


  } catch (error) {

    res.json("something error please close the tab and open again");

    console.log(error);
  }
};


const orderSuccess = async (req, res) => {
  
  try {
    


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
            paymentMethod:1,
            transactionId:1
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
            paymentMethod:1,
            orderNo: 1,
            OrderedItems: 1,
            orderStatus: 1,
            itemId: { $arrayElemAt: ["$items.product", 0] },
            image: { $arrayElemAt: ["$items.images", 0] },
            quantity:{$arrayElemAt:["$items.quantity",0]},
            orderDate: 1,
            transactionId:1
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
            paymentMethod:1,
            itemId: 1,
            productname: { $arrayElemAt: ["$product.product_name", 0] },
            orderDate: 1,
            image: { $arrayElemAt: ["$image", 0] },
            transactionId:1
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
              paymentMethod:"$paymentMethod",
              transactionId:"$transactionId"
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
            paymentMethod:"$_id.paymentMethod",
            transactionId:"$_id.transactionId"
          },
        }
      ]);


      orderData.forEach(async (element1) => {
        // Provided date string
        const dateString = element1.orderDate;

        // element1.OrderedItems = JSON.stringify(element1.OrderedItems);
        // Create a new Date object from the provided string
        const dateObject = new Date(dateString);

        // Get day, month, and year
        const day = dateObject.getDate();
        const month = dateObject.getMonth() + 1; // Note: Months are zero-indexed, so we add 1
        const year = dateObject.getFullYear();

        // Format the date components
        const formattedDate = `${day}/${month}/${year}`;

        element1.orderDate = formattedDate;

      });

      console.log("oderdate",orderData);
      res.render('user/orderDetails',{

        user:true,
        userId: req.session.user_id,
        orderData:orderData[0]
    
      } )


      // console.log(JSON.stringify(orderData));
      


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
  paramsId = req.params.id;
  sessionId = req.session.user_id;
  try {
    if (paramsId == sessionId) {

      const cartData = await cart.find({ userId: sessionId });
      console.log(cartData);
      if(cartData[0])
      {
        productData = await productVariants.findOne({
          _id: cartData[0].product_varient_id,
        });
      }
     

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

      const personalInfo = await user.findOne({ _id: req.session.user_id });

      if (personalInfo.cartValue == 0) {
       
        res.render("user/emptyCart", {
          items: items,
        user: true,
        personalInfo: personalInfo,
        userId: req.session.user_id,
        })
      }else
      {
        res.render("user/cart", {
          items: items,
          user: true,
          personalInfo: personalInfo,
          userId: req.session.user_id,
        });
      }
      
    }

    

  } catch (err) {
    res.send(err)
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
          _id: "", // Use null if you want to group all matching documents together
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
    console.log(updatedValue);

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
  orderSuccess
};
