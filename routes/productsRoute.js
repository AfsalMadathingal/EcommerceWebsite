const express=require('express')
const productRoute=express();
const productsController= require ('../controller/UserSideProducts')




//routing to product related request
productRoute.get('/allproducts',productsController.loadAllproduct)
productRoute.get('/lowtohigh',productsController.loadLowToHigh)
productRoute.get('/hightolow',productsController.loadHighToLow)
productRoute.post('/addtocart/:id',productsController.addToCart)
productRoute.get('/all-product-search',productsController.searchProduct)

//offer related request
productRoute.get('/dealsAndOffers',productsController.loadDealsAndOffers)

//category 
// productRoute.get('/product/view/men/',productsController.loadMenProduct)
// productRoute.get('/product/view/women/',productsController.loadWomenProduct)
// productRoute.get('/product/view/kids/',productsController.loadKidsProduct)

//single product 
productRoute.get('/:id',productsController.loadProduct);




module.exports=productRoute