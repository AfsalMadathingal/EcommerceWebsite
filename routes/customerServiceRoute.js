const express = require('express')
const customerServiceRoute = express();
const customerServiceController = require('../controller/customerServiceController');




customerServiceRoute.get('/',customerServiceController.loadCustomerService)



module.exports = customerServiceRoute;