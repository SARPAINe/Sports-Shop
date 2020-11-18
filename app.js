const bodyParser = require("body-parser");
const express=require("express");
const app=express();
const config=require('./config/database');
const ejs=require('ejs');
const session=require('express-session');
const { body, validationResult } = require('express-validator');
const fileUpload=require('express-fileupload');
//connect to db
const mongoose = require('mongoose');
mongoose.connect(config.database, {useNewUrlParser: true,useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to database!");
});

//view engine setup
app.set("view engine","ejs");

//set public folder
app.use(express.static("public"));

//set global errors variables
app.locals.errors=null;

//Express fileUpload middleware
app.use(fileUpload());

//body parser middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))


//express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//set routes
const pages=require('./routes/pages.js');
const adminPages=require('./routes/admin_pages.js');
const adminCategories=require('./routes/admin_categories');
const adminProducts=require('./routes/admin_products');
app.use('/',pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories',adminCategories); 
app.use('/admin/products',adminProducts); 


app.listen(3000, () => {
  console.log('App listening on port 3000!');
});