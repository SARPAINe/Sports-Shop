const express=require('express');
const router=express.Router();
var fs=require('fs-extra');

const Product=require('../models/product');
const Category=require('../models/category');
//Exports
module.exports=router;

//get all products
router.get("/",(req,res)=>{
  Product.find((err,products)=>{
    if(err)
    console.log(err);
    else{
      res.render('all_products',{
        title:'All products',
        products:products
      });
    }
  });
  // res.send('lol');
});

//get products by category
router.get("/:category",(req,res)=>{
  var categorySlug=req.params.category;
  Category.findOne({slug:categorySlug},(err,c)=>{
    Product.find({category:categorySlug},(err,products)=>{
      if(err)
      console.log(err);
      else{
        res.render('cat_products',{
        title:c.title,
        products:products
      });
    }
    });
  })
  // res.send('lol');
});

//get product detail
router.get("/:category/:product",(req,res)=>{
  var galleryImages=null;
  var loggedIn=(req.isAuthenticated())?true:false;
  console.log(loggedIn);
  Product.findOne({slug:req.params.product},(err,product)=>{
    if(err)
      console.log(err);
    else{
      var galleryDir='public/product_images/'+product._id+'/gallery';
      fs.readdir(galleryDir,(err,files)=>{
        if(err)
        console.log(err);
        else{
          galleryImages=files;
          
          res.render('product',{
            title:product.title,
            p:product,
            galleryImages:galleryImages,
            loggedIn:loggedIn
          });
        }
      });
    }
  });
});




