const offerDB = require("../model/offerModel");
const catogoryDB = require("../model/categoryModel");
const productDB = require("../model/productsModel");
const category = require("../model/categoryModel");
const validator = require("validator");
const mongoose = require("mongoose");
const productVariants = require("../model/productVariants");

const loadOffers = async (req, res) => {
  try {
    const category = await catogoryDB.find({});
    const offerData = await offerDB.find({}).populate("offer_category");
    
    res.render("admin/offersManagement", {
      adminlogin: true,
      layout: "newSidebar",
      categories: category,
      offerData: offerData,
    });
  } catch (error) {
    console.log(error);
  }
};



const loadAddOffers = async (req, res) => {

  const category = await catogoryDB.find({});
  
  try {
    
    res.render("admin/Addoffer", {
      adminlogin: true,
      layout: "newSidebar",
      title: "Create Offer",
      category: category,
    });


  } catch (error) {
    console.log(error);
  }
};




const loadEditOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const offerData = await offerDB.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $project: {
          _id: 1,
          offer_title: 1,
          offer_banner: 1,
          offer_details: 1,
          discount_type: 1,
          discount_value: 1,
          offer_start_date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$offer_start_date",
            },
          },
          offer_end_date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$offer_end_date",
            },
          },
        },
      },
    ]);



    const category = await catogoryDB.find({});

    res.render("admin/Editoffer", {
      adminlogin: true,
      layout: "newSidebar",
      title: "Edit Offer",
      id: id,
      offerData: offerData[0],
      category: category,
    });
  } catch (error) {
    console.log(error);
  }
};



const editOffer = async (req, res) => {
  try {
    let {
      offerId,
      OfferTitle,
      category,
      startDate,
      endDate,
      discountType,
      discountValue,
      offerDetails,
    } = req.body;

    //discount type 1 for  amount 0 for percentage

    discountType === "amount" ? (discountType = 1) : (discountType = 0);

    

    if (req.files) {
      let filenames;

      req.files.forEach(function (file, index, arr) {
        filenames = file.filename;
      });
      req.session.imagepath = filenames;
    }

    const categoryId = new mongoose.Types.ObjectId(category);
    const offerIdToObj = new mongoose.Types.ObjectId(offerId);

    console.log("offer id", offerId);

    await offerDB.updateOne(
      { _id: offerIdToObj },
      {
        offer_title: OfferTitle,
        offer_banner: req.session.imagepath,
        offer_details: offerDetails,
        discount_type: discountType,
        discount_value: discountValue,
        offer_start_date: startDate,
        offer_end_date: endDate,
        offer_category: categoryId,
      }
    );

    await productVariants.updateMany(
      { offer: offerId },
      {
        $unset: {
          offer: 1,
        },
      }
    );

  

    const products = await productDB.find({ category_id: categoryId });

    let forProductId = [];
    products.forEach((data) => {
      forProductId.push(data._id);
    });



    forProductId.forEach(async (id) => {
      cont = 0;
      await productVariants.updateMany(
        { product: id },
        {
          $set: {
            offer: offerId,
          },
        }
      );

     
    });

    res.redirect("/admin/offers");
  } catch (error) 
  {

    console.log(error);
  }
};


const addOffer = async (req, res) => {

  if (req.files) {
    let filenames;

    req.files.forEach(function (file, index, arr) {
      filenames = file.filename;
    });

    req.session.imagepath = filenames;
  }

  let {
    OfferTitle,
    category,
    startDate,
    endDate,
    discountType,
    discountValue,
    offerDetails,
  } = req.body;
  let productsId = [];

  const catogoryId = new mongoose.Types.ObjectId(category);

  const data = await productDB.find({ category_id: catogoryId });



  data.forEach((data) => {
    productsId.push(data._id);
  });

  //discount type 1 = amount 0= percentage

  discountType == "amount" ? (discountType = 1) : (discountType = 0);
  


  const offerData = new offerDB({
    offer_title: OfferTitle,
    offer_banner: req.session.imagepath,
    offer_details: offerDetails,
    discount_type: discountType,
    discount_value: discountValue,
    offer_start_date: startDate,
    offer_end_date: endDate,
    offer_category: catogoryId,
  });



  await offerData.save();

  productsId.forEach(async (id) => {
    const response = await productVariants.updateOne(
      { product: id },
      {
        offer: offerData._id,
      }
    );

    console.log(response);
  });

  res.redirect("/admin/offers");
};

const deleteOffer = async (req, res) => {
  try {

    const { itemId, offerId } = req.body;
    id = new mongoose.Types.ObjectId(offerId);
      await productVariants.updateMany(
      { offer: id },
      {
        $unset: {
          offer: 1,
        },
      }
    );

    await offerDB.deleteOne({ _id: offerId });

    res.json(true);
  } catch (error) {
    console.log(error);
  }
};

const validation = (req, res) => {
  try {
    const {
      offerTitle,
      category,
      startDate,
      endDate,
      discountValue,
      offerDetails,
      imageinput,
    } = req.body;

    const response = {};

    response.offerTitle = validator.isEmpty(offerTitle);
    response.category = validator.isAlpha(category);
    response.startDate = validator.isDate(startDate);
    response.endDate = validator.isAfter(endDate, startDate);
    response.offerDetails = validator.isEmpty(offerDetails);
    response.discountValue = validator.isNumeric(discountValue);
    response.imageinput = validator.isLength(imageinput, { min: 1, max: 255 });

    console.log(response);
    console.log(req.body);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadOffers,
  addOffer,
  loadAddOffers,
  deleteOffer,
  loadEditOffer,
  editOffer,
  validation,
};
