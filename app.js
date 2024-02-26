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


mongoose.connect(process.env.MONGO_URL ||'mongodb://127.0.0.1:27017/OURSHOP')
const PORT = process.env.PORT


app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/',session({
    secret:'secret',
    resave: false,
    saveUninitialized: true,
}))


// app.use(logger('dev'))


app.use(nocache())
app.set('view', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper(hbsHelper.formatDate(hbs), hbsHelper.incHelper(hbs), hbsHelper.mulHelper(hbs), hbsHelper.subHelper(hbs), hbsHelper.addHelper(hbs));

app.use(express.static('public/assets'));



initializeSocket(server)

server.listen(PORT, () => {
    console.log(`connected to http://localhost:${PORT}/`);
})


const adminRoute = require("./routes/adminRoute.js");
app.use("/admin", adminRoute);

const userRoute = require("./routes/userRoute.js");
app.use("/", userRoute);
 
app.use((req, res, next) => {
    res.status(404).render('errorpage', { title: 'Page Not Found' });
  });