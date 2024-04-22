//Requiring Nessesery Modules
const express = require("express");
const adminRoute = express();
const adminHelper = require("../controller/adminHelper");
const category_management = require("../controller/catogoryManagement")
const productsManagement =require('../controller/productsManagement')
const dashboarHelper = require('../controller/dashboardHelper')
const offer = require('../controller/offerHelper')
const coupons = require('../controller/couponsHelper')
const adminCustomerServiceHelper = require('../controller/customerServiceAdminSide');
const auth = require("../middleware/adminAuth");
const upload =require('../middleware/upload')







//Admin Login Related Routes
adminRoute.get("/",adminHelper.loadadminLogin);
adminRoute.post("/login", adminHelper.verifyAdmin);
adminRoute.get("/logout", adminHelper.logout);

//Dashboard Related Routes
adminRoute.get("/dashboard",auth.checkSession, dashboarHelper.loadDahboard);
adminRoute.post('/chartdata',dashboarHelper.chartData)
adminRoute.get('/salesreport/:range',auth.checkSession,dashboarHelper.salesreport)
adminRoute.post('/salesReport/filterReport', auth.checkSession, dashboarHelper.salesReportFilter);

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
adminRoute.delete('/deleteoldimage',productsManagement.deleteImage)

//manage orders Related Routes
adminRoute.get('/ordersManagement',auth.checkSession,productsManagement.loadOrders)
adminRoute.patch('/ordersManagement/changeStatus',auth.checkSession,productsManagement.changeOrderStatus)
adminRoute.get('/ordersManagement/:id',auth.checkSession,productsManagement.viewOrder)


//manage offers and coupons
adminRoute.get('/offers',auth.checkSession,offer.loadOffers)
adminRoute.get('/createoffer',auth.checkSession,offer.loadAddOffers)
adminRoute.get('/editoffer/:id',auth.checkSession,offer.loadEditOffer)
adminRoute.post('/editoffer',upload,auth.checkSession,offer.editOffer)
adminRoute.post('/deleteoffer',auth.checkSession,offer.deleteOffer)
adminRoute.post('/createOffer',upload,auth.checkSession,offer.addOffer)
adminRoute.get('/coupons',auth.checkSession,coupons.loadCoupons)
adminRoute.post('/createCoupon',auth.checkSession,coupons.addCoupons)
adminRoute.post('/editcoupon',auth.checkSession,coupons.editCoupon)
adminRoute.post('/deletecoupon',auth.checkSession,coupons.deleteCoupon)
adminRoute.post('/validation',offer.validation)

//customer service
adminRoute.get('/customerService',auth.checkSession,adminCustomerServiceHelper.loadCustomerServiceAdmin)







module.exports = adminRoute;
