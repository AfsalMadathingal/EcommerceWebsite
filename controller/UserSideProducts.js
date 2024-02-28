//Requiring Nessesery Modules
const products = require("../model/productsModel.js");
const size = require("../model/sizeModel.js");
const color = require("../model/colorModel.js");
const category = require("../model/categoryModel.js");
const productVariants = require("../model/productVariants.js");
const user = require("../model/userModel.js");
const { default: mongoose } = require("mongoose");
const cart = require("../model/cart.js");
const offerDB = require("../model/offerModel.js");


const loadMenProduct = async (req, res) => {

  try {



    
  }
  catch (error) {
    console.log(error);
  }
}

const loadHomeUser = async (req, res) => {
  try {

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
          offer:1,
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
          offer:1,
        },
      },
    ]);

    const categoryData = await category.find({});

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
        category: categoryData,
        title: "Home Page",
      });
    } else {
      res.render("user/HomePage", {
        data: product_data,
        category: categoryData
        ,title: "Home Page",
      });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const loadProduct = async (req, res) => {

  if (req.session.user_id) {
    try {
      const id = req.params.id;
      
      const offer = await offerChecker(id);

  

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

      const size = await productVariants.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: "sizes",
            foreignField: "_id",
            localField: "size_id",
            as: "sizes",
          },
        },
        {
          $unwind: "$sizes",
        },
        {
          $project: {
            sizes: "$sizes.size",
          },
        }
      ])

      if (offer.discount_type)
      {
        const toDiscount = offer.discount_value
        data[0].offerprice = data[0].price - toDiscount;
        data[0].offerEndDate= offer.offer_end_date;
      }else
      {
        const toDiscount = (offer.discount_value/100)*data[0].price;
  
        data[0].offerprice = data[0].price - toDiscount;
        data[0].offerEndDate= offer.offer_end_date;
     
      }
      
      // getting the first image path form the array to display in product page
      const images = data[0].images;
      data[0].image1 = `/uploads/${images[0]}`;
      data[0].image2 = `/uploads/${images[1]}`;
      data[0].image3 = `/uploads/${images[2]}`;

      res.render("user/productsView", {
        userId: req.session.user_id,
        data: data,
        colors: colors,
        user: true,
        size: size,
        title: "Product",
      });
    } catch (error) {
      res.render("errorpage",{title:"Error"});
      console.log(error);
    }
    
  } else {
    try {
      const id = req.params.id;

      const offer = await offerChecker(id);


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

      if (offer.discount_type)
      {
        console.log("if",data);
        console.log("offer",offer);
      }else
      {
        const toDiscount = (offer.discount_value/100)*data[0].price;
        console.log("toDiscount",toDiscount);
        data[0].offerprice = data[0].price - toDiscount;
        data[0].offerEndDate= offer.offer_end_date;
        console.log("else",data);
        console.log("offer",offer);
      }

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


      const size = await productVariants.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $lookup: {
            from: "sizes",
            foreignField: "_id",
            localField: "size_id",
            as: "sizes",
          },
        },
        {
          $unwind: "$sizes",
        },
        {
          $project: {
            sizes: "$sizes.size",
          },
        }
      ])

      console.log("sixe",size);
      console.log(data);
      console.log(colors);

      //setting the path with images
      const images = data[0].images;
      data[0].image1 = `/uploads/${images[0]}`;
      data[0].image2 = `/uploads/${images[1]}`;
      data[0].image3 = `/uploads/${images[2]}`;

      res.render("user/productsView", {
        data: data,
        colors: colors,
        size: size,
        title: "Product",
      });
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

      const checkCart = await cart.findOne({
        product_varient_id: data.productId,
        userId: req.session.user_id,
      });

      console.log(checkCart);

      if (checkCart) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({
          success: false,
          message: "Item Already In your Cart.",
        });
      } else {
        //calculating and updating the cart items value in database

        quantity = cartData.quantity;

        const productVarient = await productVariants.findOne({
          _id: data.productId,
        });
        const userData = await user.findOne({ _id: req.session.user_id });
        let cartValue = userData.cartValue;
        const price = productVarient.price;
        cartData.price = price;
        cartData.value = quantity * price;
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

const loadAllproduct = async (req, res) => 
{
  try {
   

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
          offer:1,
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
          offer:1,
        },
      },
    ]);

   

    product_data.forEach((element) => {
      if (element.images) {
        let images = element.images;
        element.images = images[0];
      }
    });





    if (req.session.user_id) {
      res.render("user/allProducts", {
        user: true,
        userId: req.session.user_id,
        data: product_data,
        title: "All Products",
        
      });
    } else {
      res.render("user/allProducts", {

        data: product_data,
        title: "All Products",
      });
    }
  } catch (error) {}
};


const loadDealsAndOffers = async (req, res) => {


  try {

    console.log("hello load offeres");
    const dealsAndOffers = await offerDB.find({});
    console.log(dealsAndOffers);
    if (req.session.user_id) {
      res.render('user/dealsAndOffers', {
        dealsAndOffers:dealsAndOffers,
        user:true,
        userId:req.session.user_id,
        title:"Deals and Offers"
      })
    }else
    {
      res.render('user/dealsAndOffers', {dealsAndOffers:dealsAndOffers, title:"Deals and Offers"})
    }
    
    
  } catch (error) {
    console.log(error);
  }
}


const offerChecker = async (varientId) => {
  

  const varient = await productVariants.findOne({ _id: varientId });

  if (varient.offer) {

    const offer = await offerDB.findOne({ _id: varient.offer });
    return offer;
  } else {
    return false;
  }

}


const loadLowToHigh = async (req, res) => {
  

  try {

   const productData = await productVariants.find({}).populate("product").sort({ price: 1 })


productData.forEach((element) => {
  if (element.images) {
    let images = element.images;
    element.images = images[0];
  }
  Object.assign(element, element.product);
  delete element.product; 
});
   
   res.render("user/allproducts", {
    user: true,
    userId: req.session.user_id,
    data: productData,
    title: "All Products",

  });

  } catch (error) {
    
    console.log(error);

    res.send("something error please go back to home");
  }
}

const loadHighToLow = async (req, res) => {
  

  try {

   const productData = await productVariants.find({}).populate("product").sort({ price: -1 })


   productData.forEach((element) => {
    if (element.images) {
      let images = element.images;
      element.images = images[0];
    }
  });
   
   res.render("user/allproducts", {
    user: true,
    userId: req.session.user_id,
    data: productData,
    title: "All Products",
  });

  } catch (error) {
    
    console.log(error);

    res.send("something error please go back to home");
  }
}




module.exports = {
  loadHomeUser,
  loadProduct,
  addToCart,
  loadAllproduct,
  loadDealsAndOffers,
  offerChecker,
  loadLowToHigh,
  loadHighToLow
};
