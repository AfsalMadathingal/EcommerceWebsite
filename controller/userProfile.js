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
  console.log(req.params.id);
  console.log(req.session.user_id);

  if (req.session.user_id == req.params.id) {
    const personalInfo = await user.findOne({ _id: req.params.id });

    console.log(personalInfo);

    res.render("user/personalinformation", {
      personalInfo: personalInfo,
      user: true,
      userId: req.session.user_id,
    });
  } else {
    res.redirect("/");
  }
};


//order realted Middlewares
const loadOrders = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId == req.session.user_id) {
      const cartData = await order.find({ userId: userId });

      // const orderData = await order.aggregate([
      //   { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      // ]);

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
            localField: "OrderedItems",
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

        if (element1.orderStatus == "Cancelled") {
          element1.cancel = true;
          console.log("if working");
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
  console.log(req.query);

  const { addressId, userId } = req.query;

  try {
    const addressData = await address.find({ _id: addressId });
    const userData = await user.find({ _id: userId });
    const cartData = await cart.find({ userId: userId });
    const orderNo = Math.floor(100000 + Math.random() * 900000);
    const totalAmount = userData[0].cartValue;
    let products = [];

    //geting productVariant Id to a array
    cartData.forEach((element) => {
      products.push(element.product_varient_id);
    });

    const orderData = new order({
      userId: userId,
      orderAmount: totalAmount,
      deliveryAddress: addressId,
      orderDate: new Date(),
      OrderedItems: products,
      orderNo: orderNo,
    });

    const paymentData = new payment({
      userId: userId,
      orderId: orderData._id,
      amount: totalAmount,
      status: "completed",
      paymentMethod: "cod",
      transactionid: orderNo,
      paymentDate: new Date(),
    });

    await orderData.save();
    await paymentData.save();

    await cart.deleteMany({ userId: userId });
    await user.updateOne({ _id: userId }, { $set: { cartValue: 0 } });

    res.render("user/orderPlaced", {
      user: true,
      addressData: addressData,
      totalAmount: totalAmount,
      orderId: orderNo,
      userId: req.session.user_id,
    });
  } catch (error) {
    res.send("something error please close the tab and open again");
    console.log(error);
  }
};

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
          },
        },
        {
          $unwind: "$OrderedItems",
        },
        {
          $lookup: {
            from: "product_varients",
            foreignField: "_id",
            localField: "OrderedItems",
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

      const personalInfo = await user.findOne({ _id: req.session.user_id });

      res.render("user/cart", {
        items: items,
        user: true,
        personalInfo: personalInfo,
        userId: req.session.user_id,
      });
    }
  } catch {
    res.render("user/cart", { user: true, userId: req.session.user_id });
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
};
