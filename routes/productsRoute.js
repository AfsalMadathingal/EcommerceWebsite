const express=require('express')
const productRoute=express();
const productsController= require ('../controller/UserSideProducts')




//routing to product related request
productRoute.get('/allproducts',productsController.loadAllproduct)
productRoute.get('/lowtohigh',productsController.loadLowToHigh)
productRoute.get('/hightolow',productsController.loadHighToLow)
productRoute.post('/addtocart/:id',productsController.addToCart)

//offer related request
productRoute.get('/dealsAndOffers',productsController.loadDealsAndOffers)
productRoute.get('/:id',productsController.loadProduct);




module.exports=productRoute