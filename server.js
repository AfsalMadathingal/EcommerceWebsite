const mongoose = require('mongoose')
const express= require('express')
const session = require('express-session')
var hbs = require('hbs')
const path = require('path');
const logger = require('morgan')
const nocache = require("nocache");
const http = require('http');
const app=express()
require('dotenv').config()
const hbsHelper = require('./controller/hbsHelper.js')
const {initializeSocket} = require('./controller/customerServiceAdminSide.js')
const server = http.createServer(app);

//Establish a connection to data base
mongoose.connect("mongodb://127.0.0.1:27017/OURSHOP")


//body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

//session
app.use('/',session({
    secret:'secret',
    resave: false,
    saveUninitialized: true,
}))

// Logger
// app.use(logger('dev'))

//using nocache
app.use(nocache())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper(hbsHelper.formatDate(hbs), hbsHelper.incHelper(hbs), hbsHelper.mulHelper(hbs), hbsHelper.subHelper(hbs), hbsHelper.addHelper(hbs));

//static assets
app.use(express.static('public/assets'));



//for customer service chat 
initializeSocket(server)


server.listen(3000, () => {
    console.log("connected to http://localhost:3000/");
})


//for admin route
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);


//for user routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);
 


//error route
app.use((req, res, next) => {
    res.status(404).render('errorpage', { title: 'Page Not Found' });
  });