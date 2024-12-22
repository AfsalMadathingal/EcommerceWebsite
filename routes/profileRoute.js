//Requiring Nessesery Modules
const express=require('express')
const profileRoute=express();
const profile= require ('../controller/userProfile.js');
const paymentRouter = require('../routes/payment')





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
profileRoute.get('/mycart/count/:id',profile.countCart)
profileRoute.get('/mycart/load/:id',profile.loadCart)
profileRoute.post('/mycart/remove',profile.deleteItemCart)
profileRoute.post('/mycart/update',profile.updateCart)
profileRoute.get('/mycart/checkout',profile.loadChekOut)



//Order Related Routes
profileRoute.use('/payment',paymentRouter)
profileRoute.post('/mycart/createorder',profile.placeOrder)
profileRoute.get('/myorders/success',profile.orderSuccess)
profileRoute.get('/myorders/:id',profile.loadOrders)
profileRoute.patch('/cancelOrder',profile.cancelOrder)
profileRoute.get('/myorders/view/:id',profile.viewOrder)
profileRoute.get('/myorders/invoice/:id',profile.viewInvoice)


//wallet Related Routes 
profileRoute.get('/mywallet/:id',profile.loadWallet)
profileRoute.post('/addbalance',profile.addBalance)


//return products
profileRoute.patch('/returnProduct/',profile.returnProduct)



//WishList Related Routes
profileRoute.get('/mywhishlist',profile.loadWishList)
profileRoute.post('/addtowishlist',profile.addToWishList)
profileRoute.post('/removefromwishlist',profile.removeFromWishList)


//referral related routes

profileRoute.get('/myreferrals/:id',profile.loadReferral)


















module.exports=profileRoute;

