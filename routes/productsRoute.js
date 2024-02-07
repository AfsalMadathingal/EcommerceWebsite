const express=require('express')
const productRoute=express();

const productsController= require ('../controller/UserSideProducts')





productRoute.get('/allproducts',productsController.loadAllproduct)
productRoute.post('/addtocart/:id',productsController.addToCart)
productRoute.get('/:id',productsController.loadProduct);








module.exports=productRoute