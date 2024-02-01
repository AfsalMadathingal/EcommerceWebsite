//Requiring neccessary modules
const productsDB = require("../model/productsModel.js");
const size = require("../model/sizeModel.js");
const color = require("../model/colorModel.js");
const category = require("../model/categoryModel.js");
const productVariants = require("../model/productVariants.js");
const orders = require("../model/orderModel.js");
const mongoose = require("mongoose");
const { response } = require("../routes/productsRoute.js");


const loadProducts = async (req, res) => {
  try {
    const data = await productVariants.aggregate([
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
        },
      },
    ]);

    const count = await productsDB.countDocuments();

    console.log(req.files);

    res.status(200).render("admin/productsManagement", {
      adminlogin: true,
      data: data,
      count: count,
      pageTitle: "Products",
      layout: "newSidebar",
    });
  } catch (error) {
    console.log(req.file);
    res.send(error);
  }
};

const loadAddProducts = async (req, res) => {
  try {
    const categoryData = await category.find({});
    const sizeData = await size.find({});
    const colorData = await color.find({});
    res.status(200).render("admin/addProducts", {
      adminlogin: true,
      pageTitle: "Add Products",
      category: categoryData,
      size: sizeData,
      color: colorData,
      layout: "newSidebar",
    });
  } catch (error) {
    res.send(error);
  }
};

const loadEditProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    let data = await productVariants.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(productId),
        },
      },
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
          productVariant: "$product._id",
          product_id: "$product.product_id",
          product_name: "$product.product_name",
          category: "$product.category_id",
          about_product: "$product.about_product",
          is_listed: 1,
          price: 1,
          stock: 1,
          cost: 1,
          barcode: 1,
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
          productVariant: 1,
          productobjId: "$product._id",
          product_name: 1,
          about_product: 1,
          price: 1,
          stock: 1,
          cost: 1,
          barcode: 1,
          images: 1,
          category: "$category.category",
        },
      },
    ]);

    const categoryData = await category.find({});
    const sizeData = await size.find({});
    const colorData = await color.find({});

    data = data.map((obj) => {
      const { images } = obj;
      obj.image1 = images[0];
      obj.image2 = images[1];
      obj.image3 = images[2];

      delete obj.images; // Remove the original 'images' field if needed
      return obj;
    });

    console.log(data);

    res.status(200).render("admin/editProduct", {
      adminlogin: true,
      pageTitle: "Edit Produts",
      data: data,
      category: categoryData,
      size: sizeData,
      color: colorData,
      layout: "newSidebar",
    });
  } catch (error) {
    console.log("this is error", error);
  }
};

const addNewProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    const categoryId = await category.findOne({
      category: productData.category,
    });
    const sizeId = await size.findOne({ size: productData.size });

    console.log(productData.category);
    console.log(productData);

    product = new productsDB({
      product_id: productData.productId,
      product_name: productData.productName,
      about_product: productData.aboutProduct,
      is_listed: true,
      category_id: categoryId._id.toString(),
    });

    if (req.files) {
      let filenames = [];

      req.files.forEach(function (file, index, arr) {
        filenames.push(file.filename);
      });
      console.log(filenames);
      req.session.imagepath = filenames;
    }

    const colorId = await color.findOne({ color: productData.color });

    productVariant = new productVariants({
      product: product._id.toString(),
      color_id: colorId._id.toString(),
      size_id: sizeId._id.toString(),
      images: req.session.imagepath,
      stock: productData.qty,
      price: productData.price,
      cost: productData.cost,
      barcode: productData.barcode,
    });

    await product.save();
    await productVariant.save();

    console.log("add is working");
    res.redirect("/admin/products_management");
  } catch (error) {
    console.log(error);
    res.send("some error please go to home");
  }
};

const updateProduct = async (req, res, next) => {

  try {
    const productData = req.body;

    const categoryId = await category.findOne({category:productData.category})
    const sizeId = await size.findOne({size:productData.size})

    const response2 = await productsDB.updateOne({_id:productData.ProductvariantId},{

      product_id:productData.productId,
      product_name:productData.productName,
      about_product:productData.aboutProduct,
      is_listed:true,
      category_id: categoryId._id.toString()

    })

  
    const colorId = await color.findOne({color:productData.color})

   const response1= await productVariants.updateOne({_id:productData.variantId},{$set:{

      color_id:colorId._id.toString(),
      size_id: sizeId._id.toString(),
      stock:productData.qty,
      price:productData.price,
      cost:productData.cost,
      barcode:productData.barcode}

    })



    console.log("data",productData);
  
    console.log("1",response1);
    console.log("2",response2);
    


    res.redirect('/admin/products_management')

  } catch (error) {

    console.log(error);
    res.send("some error please go to home");

  }
};

const editImage = async (req, res) => {



  try {
    console.log("editimage");
    if (req.files) {
      const { filename } = req.files[0];
      req.session.filename = filename;
    }

    const { variantId,oldImageName } = req.body;
    console.log(req.body);

  const response1=  await productVariants.updateOne(
      { _id: variantId },
      {
        $push: { images: req.session.filename },
      }
    );
   const response2= await productVariants.updateOne({
      _id:variantId},
       {$pull: { images: oldImageName }
      
    })


    console.log(req.body);

    console.log(response1,response2);

    res.json(true);

  } catch (error) {

    console.log(error)
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.body.productId;
    console.log(productId);
    await productsDB.deleteOne({ product_id: productId });

    res.end();
  } catch (error) {
    res.send("some error please go to home http://localhost:3000/admin ");
    console.log(error);
  }
};

const loadOrders = async (req, res) => {
  try {
    const orderData = await orders.aggregate([
      {
        $lookup: {
          from: "user_details",
          foreignField: "_id",
          localField: "userId",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          orderAmount: 1,
          deliveryAddress: 1,
          orderDate: 1,
          orderStatus: 1,
          orderNo: 1,
          userName: { $arrayElemAt: ["$userDetails.name", 0] },
        },
      },
      {
        $lookup: {
          from: "addresses",
          foreignField: "_id",
          localField: "deliveryAddress",
          as: "deliveryAddress",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          deliveryName: { $arrayElemAt: ["$deliveryAddress.name", 0] },
          deliveryAddress1: {
            $arrayElemAt: ["$deliveryAddress.addressLine1", 0],
          },
          deliveryAddress2: {
            $arrayElemAt: ["$deliveryAddress.addressLine2", 0],
          },
          mobile: { $arrayElemAt: ["$deliveryAddress.mobile", 0] },
          city: { $arrayElemAt: ["$deliveryAddress.city_dist_town", 0] },
          state: { $arrayElemAt: ["$deliveryAddress.state", 0] },
          type: { $arrayElemAt: ["$deliveryAddress.type", 0] },
          orderAmount: 1,
          orderDate: 1,
          orderStatus: 1,
          orderNo: 1,
          userName: 1,
        },
      },
    ]);

    res.status(200).render("admin/orderManagement", {
      adminlogin: true,
      orderData: orderData,
      layout: "newSidebar",
    });
  } catch (error) {}
};

const changeOrderStatus = async (req, res) => {
  try {
    await orders.updateOne(
      { _id: req.body.id },
      {
        $set: {
          orderStatus: req.body.status,
        },
      }
    );

    res.json(true);
  } catch (error) {}
};

module.exports = {
  loadProducts,
  loadAddProducts,
  addNewProduct,
  deleteProduct,
  loadEditProduct,
  loadOrders,
  changeOrderStatus,
  updateProduct,
  editImage,
};
