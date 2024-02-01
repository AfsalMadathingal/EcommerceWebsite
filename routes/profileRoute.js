//Requiring Nessesery Modules
const express=require('express')
const profileRoute=express();
const profile= require ('../controller/userProfile.js');
const productRoute = require('./productsRoute.js');




//Personal info related routes
profileRoute.get('/personalinformation/:id',profile.loadProfile)
profileRoute.get('/changePassword',profile.loadChangePassword)
profileRoute.patch('/changePassword',profile.resetPassword)
profileRoute.patch('/editprofile',profile.editProfile)




//Manage Address realated Routes
profileRoute.get('/manageaddress/:id',profile.loadAddress)
profileRoute.get('/addressedit/:id',profile.loadEditAddress)
profileRoute.patch('/editaddress',profile.editAddress)
profileRoute.get('/manageaddress/addaddress/:id',profile.loaAddNewAddress)
profileRoute.post('/manageaddress/addaddress/:id',profile.AddNewAddress)
profileRoute.delete('/deleteAddress',profile.deleteAddress)


//Cart Related Routes
profileRoute.get('/mycart/load/:id',profile.loadCart)
profileRoute.post('/mycart/remove',profile.deleteItemCart)
profileRoute.post('/mycart/update',profile.updateCart)
profileRoute.get('/mycart/checkout',profile.loadChekOut)



//Order Related Routes
profileRoute.get('/mycart/checkout/placeOrder',profile.placeOrder)
profileRoute.get('/myorders/:id',profile.loadOrders)
profileRoute.patch('/cancelOrder',profile.cancelOrder)
profileRoute.get('/myorders/view/:id',profile.viewOrder)
productRoute.get('myorders/invoice/:id',profile.viewInvoice)




profileRoute.get('/returnproducts/:id',(req,res)=>{

    res.render('user/returnedProducts',)
})

profileRoute.get('/mywhishlist/:id',(req,res)=>{

    res.render('user/myWishlist')
})

profileRoute.get('/mywallet/:id',(req,res)=>{

    res.render('user/myWallet')
})















module.exports=profileRoute;

