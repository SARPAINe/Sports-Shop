const express=require('express');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const mkdrip=require('mkdirp');
const fs=require('fs-extra');
const resizeImg=require('resize-img');

//get product model
const Product=require('../models/product');
//get category model
const Category=require('../models/category');

//Exports
module.exports=router;

// get products index

router.get('/', (req, res) => {
  var count;
  Product.countDocuments(function (err,c){
    count=c;
  });

  Product.find(function (err,products){
    res.render('admin/products',{
      products:products,
      count:count
    });
    
  });
});

// get add product

router.get('/add-product', (req, res) => {
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

// get edit page
router.get('/edit-page/:id', (req, res) => {
  Page.findById(req.params.id,(err,foundPage)=>{
    if(err) 
      return console.log(err);

    res.render('admin/edit_page',{
    title:foundPage.title, 
    slug:foundPage.slug,
    content:foundPage.content,
    id:foundPage._id
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
  console.log(imageFile);

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
          })
          mkdrip('public/product_images/'+product._id+'/gallery',err=>{
            return console.log('num2'+err);
          })
          mkdrip('public/product_images/'+product._id+'/gallery/thumbs',err=>{
            return console.log('num3'+err);
          })

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

//post edit page

router.post('/edit-page/:id', 
[
  body('title', 'title is required').notEmpty(),
body('content', 'Content is required').notEmpty()
],
(req, res) => {
  
  var title=req.body.title;
  var slug=req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug=="") slug=req.body.title.replace(/\s+/g, '-').toLowerCase();
  var content=req.body.content;
  var id=req.params.id;
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
      // console.log(id);
      return res.render('admin/edit_page',{
      title:title,
      slug:slug,
      content:content,
      errors:errors.errors,
      id:id
    }
  );
}
  else
  {
    Page.findOne({slug:slug,_id:{'$ne':id}},(err,page)=>{
      if(page){
        req.flash('danger','Page slug exists, choose another.');
        res.render('admin/edit_page',{
        title:title,
        slug:slug,
        content:content,
        errors:errors.errors,
        id:id
      });
      }else{
        // console.log(typeof id);
        Page.findById(id,(err,page)=>{
          if(err)
          return console.log(err);

          page.title=title;
          page.slug=slug;
          page.content=content;

          page.save(err=>{
            if(err)
            return console.log(err);

            req.flash('success','Page added!');
            res.redirect('/admin/pages');
          });

        });
        
      }
    });
  }

}); 

//get delete page
router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndDelete(req.params.id,(err)=>{
    if(err) return console.log(err);
    req.flash('success','Page deleted');
    res.redirect('/admin/pages');
  });
});
