//require products
const products = require("../model/productsModel.js");
//requiring size model
const size = require("../model/sizeModel.js");
//requiring color model
const color = require("../model/colorModel.js");
//requiring category model
const category = require("../model/categoryModel.js");
//requiring variant model
const productVariants = require("../model/productVariants.js");
//requiring user model
const user = require("../model/userModel.js");
const { default: mongoose } = require("mongoose");
//requiring cart model
const cart = require("../model/cart.js");


const loadHomeUser = async (req, res) => {
  try {
    //connecting Product collections with lookup
    const product_data = await productVariants.aggregate([
      {
        $lookup: {
          from: "product_details",
          foreignField: "_id",
          localField: "product",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          product: 1,
          product_id: "$product.product_id",
          product_name: "$product.product_name",
          category: "$product.category_id",
          about_product: "$product.about_product",
          is_listed: 1,
          price: 1,
          stock: 1,
          images: 1,
        },
      },
      {
        $lookup: {
          from: "categorydetails",
          foreignField: "_id",
          localField: "category",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: 1,
          product_id: 1,
          product: 1,
          product_name: 1,
          about_product: 1,
          price: 1,
          stock: 1,
          category: "$category.category",
          images: 1,
        },
      },
    ]);

    // getting the first image path form the array to display in product page

    product_data.forEach((element) => {
      if (element.images) {
        let images = element.images;
        element.images = images[0];
      }
    });

    if (req.session.user_id) {
      res.render("user/HomePage", {
        user: true,
        userId: req.session.user_id,
        data: product_data,
      });
    } else {
      res.render("user/HomePage", {
        data: product_data,
        userId: req.session.user_id,
      });
    }
  } catch (error) {
    res.send(error);
  }
};

const loadProduct = async (req, res) => {
  if (req.session.user_id) {
    try {
      const id = req.params.id;

      //connecting Product collections with lookup

      const data = await productVariants.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: "product_details",
            foreignField: "_id",
            localField: "product",
            as: "productDetails",
          },
        },
        {
          $unwind: {
            path: "$productDetails",
          },
        },
        {
          $project: {
            price: 1,
            product_name: "$productDetails.product_name",
            product_about: "$productDetails.about_product",
            images: 1,
          },
        },
      ]);

      const colors = await productVariants.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: "colors",
            foreignField: "_id",
            localField: "color_id",
            as: "colors",
          },
        },
        {
          $unwind: "$colors",
        },
        {
          $project: {
            colors: "$colors.color",
          },
        },
      ]);

      console.log(data);
      console.log(colors);

      //setting the path with images
      const images = data[0].images;
      data[0].image1 = `/uploads/${images[0]}`;
      data[0].image2 = `/uploads/${images[1]}`;
      data[0].image3 = `/uploads/${images[2]}`;

      res.render("user/productsView", {
        userId: req.session.user_id,
        data: data,
        colors: colors,
        user: true,
      });
    } catch (error) {
      res.render("errorpage");
      console.log(error);
    }
  } else {
    try {
      const id = req.params.id;

      //connecting Product collections with lookup

      const data = await productVariants.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "product_details",
            foreignField: "_id",
            localField: "product",
            as: "productDetails",
          },
        },
        {
          $unwind: {
            path: "$productDetails",
          },
        },
        {
          $project: {
            price: 1,
            product_name: "$productDetails.product_name",
            product_about: "$productDetails.about_product",
            images: 1,
          },
        },
      ]);

      const colors = await productVariants.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "colors",
            foreignField: "_id",
            localField: "color_id",
            as: "colors",
          },
        },
        {
          $unwind: "$colors",
        },
        {
          $project: {
            colors: "$colors.color",
          },
        },
      ]);

      console.log(data);
      console.log(colors);

      //setting the path with images
      const images = data[0].images;
      data[0].image1 = `/uploads/${images[0]}`;
      data[0].image2 = `/uploads/${images[1]}`;
      data[0].image3 = `/uploads/${images[2]}`;

      res.render("user/productsView", { user:true,data: data, colors: colors , userId:req.session.user_id });
    } catch (error) {
      res.render("errorpage");
      console.log(error);
    }
  }
};

const addToCart = async (req, res) => {

  
  if (req.session.user_id) {
    try {






      const data = req.body;

      const cartData = new cart({
        userId: req.session.user_id,
        product_varient_id: data.productId,
        quantity: data.quantity,
      });

      const checkCart = await cart.findOne({product_varient_id:data.productId,userId:req.session.user_id})

      console.log(checkCart);

      if (checkCart)
      {
        res.setHeader("Content-Type", "application/json");
      res.status(200).json({
      success: false,
      message: "Item Already In your Cart.",
    });
      }else
      {

        //calculating and updating the cart items value in database
        
        quantity = cartData.quantity;


        const productVarient = await productVariants.findOne({
          _id: data.productId,
        });
        const userData = await user.findOne({ _id: req.session.user_id });
        let cartValue = userData.cartValue;
        const price = productVarient.price;
        cartData.price=price
        cartData.value=quantity*price
        await cartData.save();
        cartValue += quantity * price;
        await user.updateOne(
          { _id: req.session.user_id },
          { $set: { cartValue: cartValue } }
        );
  
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({
          success: true,
          message: "Product added to cart successfully.",
        });
      
      }
    
    
    } catch (error) {


        console.log(error);
      }

     
      

  } else {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      success: false,
      message: "Please log in to add Product.",
    });
  }
};



module.exports = {
  loadHomeUser,
  loadProduct,
  addToCart,
};
