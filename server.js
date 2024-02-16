const mongoose = require('mongoose')
const express= require('express')
var hbs = require('hbs')
const session = require("express-session")
const path = require('path');
const logger = require('morgan')
const nocache = require("nocache");
const app=express()
var router=express.Router()
require('dotenv').config()
const Razorpay = require('razorpay')
const hbsHelper = require('./controller/hbsHelper.js')


//Establish a connection to data base
mongoose.connect("mongodb://127.0.0.1:27017/OURSHOP")

// Logger
app.use(logger('dev'))

//using nocache
app.use(nocache())

//converting json to body as object
app.use(express.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials', function (err) {});
hbs.registerHelper(hbsHelper.formatDate(hbs), hbsHelper.incHelper(hbs), hbsHelper.mulHelper(hbs), hbsHelper.subHelper(hbs), hbsHelper.addHelper(hbs));

//static assets
app.use(express.static('public/assets'));

//listening port 3000
app.listen(3000,()=>{
    console.log("connected to http://localhost:3000/");
})



//for user routes
const user_route = require("./routes/userRoute");
app.use("/", user_route);
 

//for admin route
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);





//error route
app.use((req, res, next) => {
    res.status(404).render('errorpage', { title: 'Page Not Found' });
  });