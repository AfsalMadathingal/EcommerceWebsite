//requiring express
const express = require("express");
const adminRoute = express();
// for encrypt and decrypt password
const bcrypt = require("bcrypt");
//number of salt rounds for bcrypt
const saltRounds = 10;

//controller
const adminHelper = require("../controller/adminHelper");
const category_management = require("../controller/catogoryManagement")
const productsManagement =require('../controller/productsManagement')
const dashboarHelper = require('../controller/dashboardHelper')

//middleware
const auth = require("../middleware/adminAuth");
const upload =require('../middleware/upload')


//Logout and Login Route
adminRoute.get("/",adminHelper.loadadminLogin);
adminRoute.post("/login", adminHelper.verifyAdmin);
adminRoute.get("/logout", adminHelper.logout);


//Dashboard Related Routes
adminRoute.get("/dashboard",auth.checkSession, dashboarHelper.loadDahboard);
adminRoute.post('/chartdata',dashboarHelper.chartData)
adminRoute.get('/salesreport/:range',dashboarHelper.salesreport)





//user Management Related Routes
adminRoute.get("/user_management",auth.checkSession,adminHelper.loadUserManagement);
adminRoute.post('/block',auth.checkSession,adminHelper.blockUser)
adminRoute.post('/unblock',auth.checkSession,adminHelper.unblockUser)

//catogory Management Related Routes
adminRoute.get("/category_management",auth.checkSession,category_management.loadCategory);
adminRoute.post('/create_category',auth.checkSession,category_management.addCategory)
adminRoute.post('/edit_category',auth.checkSession,category_management.editCategory)
adminRoute.post('/delete_category',auth.checkSession,category_management.deleteCategory)

//products Management Related Routes
adminRoute.get("/products_management",auth.checkSession,productsManagement.loadProducts);
adminRoute.get('/add_products',auth.checkSession,productsManagement.loadAddProducts)
adminRoute.get('/editproduct/:id',auth.checkSession,productsManagement.loadEditProduct)
adminRoute.post('/create_products',upload,productsManagement.addNewProduct,productsManagement.loadProducts)
adminRoute.post('/editProducts',productsManagement.updateProduct,productsManagement.loadProducts)
adminRoute.post('/delete_product',auth.checkSession,productsManagement.deleteProduct)
adminRoute.post('/uploadimage',upload,productsManagement.editImage)

//manage orders Related Routes
adminRoute.get('/ordersManagement',auth.checkSession,productsManagement.loadOrders)
adminRoute.patch('/ordersManagement/changeStatus',auth.checkSession,productsManagement.changeOrderStatus)






module.exports = adminRoute;
