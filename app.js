const bodyParser = require("body-parser");
const express=require("express");
const app=express();
const path=require('path');
const config=require('./config/database');
const ejs=require('ejs');
const session=require('express-session');
const { body, validationResult } = require('express-validator');
const fileUpload=require('express-fileupload');
const passport=require('passport');

//connect to db
const mongoose = require('mongoose');
mongoose.connect(config.database, {useNewUrlParser: true,useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to database!");
});

const MongoStore = require('connect-mongo')(session);

//view engine setup
app.set('views',path.join(__dirname,'views'));
app.set("view engine","ejs");

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//set global errors variables
app.locals.errors=null;

//get page model
var Page=require('./models/page');

//get all pages to pass through header.ejs
Page.find({}).sort({sorting:1}).exec((err,pages)=>{
  if(err){
    console.log(err);
  }
  else{
    app.locals.pages=pages;
  }
});

//get page model
var Category=require('./models/category');

//get all categories to pass through header.ejs
Category.find({},(err,categories)=>{
  if(err){
    console.log(err);
  }
  else{
    app.locals.categories=categories;
  }
});

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
  store: new MongoStore({ mongooseConnection: mongoose.connection })
  // cookie: { secure: true }
}))


//express messages middleware

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport config
require('./config/passport')(passport);
//passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get("*",(req,res,next)=>{
  //cart will be available on every get request because of this below line
  res.locals.cart=req.session.cart;
  res.locals.user=req.user || null;
  next();
});


//set routes
const pages=require('./routes/pages.js');
const products=require('./routes/products.js');
const adminPages=require('./routes/admin_pages.js');
const adminCategories=require('./routes/admin_categories');
const adminProducts=require('./routes/admin_products');
const cart=require('./routes/cart.js');
const users=require('./routes/users.js');


app.use('/products',products);
app.use('/cart',cart);
app.use('/users',users);
app.use('/',pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories',adminCategories); 
app.use('/admin/products',adminProducts); 

let port=process.env.PORT;
if(port == null || port ==""){
  port=3000;
}

app.listen(port, () => {
  console.log('Server has started!');
});