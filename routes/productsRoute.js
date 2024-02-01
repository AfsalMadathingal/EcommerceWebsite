const express=require('express')
const productRoute=express();

const productsController= require ('../controller/UserSideProducts')







productRoute.get('/:id',productsController.loadProduct);




productRoute.post('/addtocart/:id',productsController.addToCart)






module.exports=productRoute