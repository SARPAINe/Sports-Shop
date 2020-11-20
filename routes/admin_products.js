const express=require('express');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const mkdrip=require('mkdirp');
const fs=require('fs-extra');
const resizeImg=require('resize-img');

var auth=require('../config/auth');
var isUser=auth.isUser;
var isAdmin=auth.isAdmin;

//get product model
const Product=require('../models/product');
//get category model
const Category=require('../models/category');

//Exports
module.exports=router;

// get products index

router.get('/',isAdmin, (req, res) => {
  let count;
  Product.countDocuments(function (err,c){
    count=c;
    console.log('inside '+count);
  });
  
  
  Product.find(function (err,products){
    console.log('outside '+count);
    res.render('admin/products',{
      products:products,
      count:count
    });
    
  });
});

// get add product

router.get('/add-product',isAdmin, (req, res) => {
  var title="";
  var desc="";
  var price="";
  Category.find((err,categories)=>{
    res.render('admin/add_product',{
      title:title, 
      desc:desc,
      price:price,
      categories:categories
    });

  });
  

}); 

// get edit product
router.get('/edit-product/:id', isAdmin,(req, res) => {

  var errors;
  if(req.session.errors)
  errors=req.session.errors;
  req.session.errors=null;

  Category.find((err,categories)=>{

    Product.findById(req.params.id,(err,p)=>{
      if(err)
      {
        console.log(err);
        res.redirect('/admin/products');
      }else{
        var galleryDir='public/product_images/'+p._id+'/gallery';
        var galleryImages=null;

        fs.readdir(galleryDir,(err,files)=>{
          if(err)
          console.log("yo ho ho"+err);
          else{
            // console.log(p.desc);
            
            var temp;
            if(p.category[p.category.length-1]==" ")
            temp=p.category.slice(0,p.category.length-1);
            else
            temp=p.category;
            // console.log(temp+"good");
            galleryImages=files;
            res.render('admin/edit_product',{
              title:p.title, 
              errors:errors,
              desc:p.desc,
              price:parseFloat(p.price).toFixed(2),
              category:temp.replace(/\s+/g,'-').toLowerCase(),
              categories:categories,
              image:p.image,
              galleryImage:galleryImages,
              id:p._id
            });
          }
        });
      }
    });


  });
  
}); 

//post add product

router.post('/add-product', 
[
  body('title', 'title is required').notEmpty(),
body('desc', 'Description is required').notEmpty(),
body('price', 'Price is required').isDecimal()
],
(req, res) => {
  
  var title=req.body.title;
  var slug=title.replace(/\s+/g,'-').toLowerCase();
  var desc=req.body.desc;
  var price=req.body.price;
  var category=req.body.category;
  // var imageFile=typeof req.files.image!=="undefined"? req.files.image.name:"";


  // console.log(req.files);
  if(req.files==null){
    
    var imageFile="";
  }
  else
  var imageFile=req.files.image.name;
  // console.log(imageFile);

  var errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    Category.find((err,categories)=>{
    res.render('admin/add_product',{
      title:title, 
      desc:desc,
      price:price,
      categories:categories,
      errors:errors.errors
    });

  });
  }
  else
  {
    Product.findOne({slug:slug},(err,found)=>{
      if(found){
        req.flash('danger','Product title exists, choose another.');
        res.render('admin/add_product',{
        title:title, 
        desc:desc,
        price:price,
        categories:categories
    });
      }else{
        var price2=parseFloat(price).toFixed(2);
        const product=new Product({
          title:title,
          slug:slug,
          desc:desc,
          price:price2,
          category:category,
          image:imageFile
        });

        product.save((err)=>{
          if(err) 
          return console.log(err);

          mkdrip('public/product_images/'+product._id,err=>{
            return console.log('num1'+err);
          });
          mkdrip('public/product_images/'+product._id+'/gallery',err=>{
            return console.log('num2'+err);
          });
          mkdrip('public/product_images/'+product._id+'/gallery/thumbs',err=>{
            return console.log('num3'+err);
          });

          if(imageFile!=""){
            var productImage=req.files.image;
            var path='public/product_images/'+product._id+'/'+imageFile;
            productImage.mv(path,err=>{
              return console.log(err);
            })
          }

          req.flash('success','Product added!');
          res.redirect('/admin/products');
        });
        
      }
    });
  }

}); 

//post edit product

router.post('/edit-product/:id', 
[
  body('title', 'title is required').notEmpty(),
body('desc', 'Description is required').notEmpty(),
body('price', 'Price is required').isDecimal()
],
(req, res) => {
  
  var title=req.body.title;
  var slug=title.replace(/\s+/g,'-').toLowerCase();
  var desc=req.body.desc;
  var price=req.body.price;
  var category=req.body.category;
  var pimage=req.body.pimage;
  var id=req.params.id;
  console.log(id);
  // var imageFile=typeof req.files.image!=="undefined"? req.files.image.name:"";


  // console.log(req.files);
  if(req.files==null){
    
    var imageFile="";
  }
  else
  var imageFile=req.files.image.name;
  // console.log(imageFile);

  var errors = validationResult(req).errors;
  console.log(errors.length);

  if(errors.length>0){
    req.session.errors=errors;
    res.redirect('/admin/products/edit-product/'+id);
  }
  else{
    Product.findOne({slug:slug,_id:{'$ne':id}},(err,p)=>{
      if(err)
        console.log(err);
      if(p){
        req.flash('danger','Product title exists,choose another.');
        res.redirect('/admin/products/edit-product/'+id);
      }else{
        Product.findById(id,(err,p)=>{
          if(err)
          return console.log(err);
          
          p.title=title;
          p.slug=slug;
          p.desc=desc;
          p.price=parseFloat(price).toFixed(2);
          p.category=category;
          if(imageFile!="")
            p.image=imageFile;
          var timage;
          if(pimage[pimage.length-1]==" ")
          timage=pimage.slice(0,pimage.length-1);
          // console.log(timage+"good");
          p.save(err=>{
            if(err)
              console.log(err);
            if(imageFile!=""){
              if(pimage!=""){
                fs.remove('public/product_images/'+id+'/'+timage,err=>{
                  if(err)
                  console.log(err);
                });
              }
              var productImage=req.files.image;
              var path='public/product_images/'+id+'/'+imageFile;
              productImage.mv(path,err=>{
                return console.log(err);
              });

            }
            
            req.flash('success','Product edited!');
            res.redirect('/admin/products/edit-product/'+id); 
        
          


          });

        }); 
      }

    });
  }

}); 

//post product gallery
router.post('/product-gallery/:id', (req, res) => {
  var productImage=req.files.file;
  var id=req.params.id;
  var path='public/product_images/'+id+'/gallery/'+req.files.file.name;
  var thumbsPath='public/product_images/'+id+'/gallery/thumbs/'+req.files.file.name;

  productImage.mv(path,err=>{
    if(err)
    console.log(err);

    resizeImg(fs.readFileSync(path),{width:100,height:100}).then(buf=>{
      fs.writeFileSync(thumbsPath,buf);
    });
  });

  res.sendStatus(200);
});

//get delete gallery image
router.get('/delete-image/:image',isAdmin, (req, res) => {
  var originalImage='public/product_images/'+req.query.id+'/gallery/'+req.params.image;
  var thumbsImage='public/product_images/'+req.query.id+'/gallery/thumbs/'+req.params.image;

  fs.remove(originalImage,err=>{
    if(err)
    {
    console.log(err)
    }else{
      fs.remove(thumbsImage,err=>{
        if(err)
        {
          console.log(err);
        }
        else{
          req.flash('success','Image deleted');
          res.redirect('/admin/products/edit-product/'+req.query.id);
        }
      });
    }
  })
});

//get delete product
router.get('/delete-product/:id',isAdmin, (req, res) => {
    var id=req.params.id;
    var path='public/product_images/'+id;

    fs.remove(path,err=>{
      if(err)
      {console.log(err);
      }
      else{
        Product.findByIdAndRemove(id,err=>{
          if(err)
          {
            console.log(err);
          }
          req.flash('success','Product deleted');
          res.redirect('/admin/products');
          
        });
      }
    });
});
