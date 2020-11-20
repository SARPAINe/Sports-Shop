const express=require('express');
const router=express.Router();
const { body, validationResult } = require('express-validator');

const Category=require('../models/category');

//Exports
module.exports=router;

// get category index

router.get('/', (req, res) => {
  Category.find({},(err,categories)=>{
    res.render('admin/categories',{
      categories:categories
    });
  });
});

// get add category
router.get('/add-category', (req, res) => {
  var title="";


  res.render('admin/add_category',{
    title:title
  })
}); 

// get edit category
router.get('/edit-category/:id', (req, res) => {
  Category.findById(req.params.id,(err,foundCategory)=>{
    if(err) 
      return console.log(err);

    res.render('admin/edit_category',{
    title:foundCategory.title, 
    id:foundCategory._id
  });
  });

  
}); 

//post add category

router.post('/add-category', 
[
  body('title', 'title is required').notEmpty()
],
(req, res) => {
  
  var title=req.body.title;
  var slug=title.replace(/\s+/g, '-').toLowerCase();
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.render('admin/add_category',{
  title:title,
  errors:errors.errors
}
  );
}
  else
  {
    Category.findOne({slug:slug},(err,found)=>{
      if(found){
        req.flash('danger','Category title exists, choose another.');
        res.render('admin/add_category',{
        title:title
      });
      }else{
        const category=new Category({
          title:title,
          slug:slug
        });

        category.save((err)=>{
          if(err) 
          return console.log(err);

          Category.find({},(err,categories)=>{
          if(err){
            console.log(err);
          }
          else{
            req.app.locals.categories=categories;
          }
        });

          req.flash('success','category added!');
          res.redirect('/admin/categories');
        });
        
      }
    });
  }

}); 

//post edit category

router.post('/edit-category/:id', 
[
  body('title', 'title is required').notEmpty()
],
(req, res) => {
  
  var title=req.body.title;
  var slug=title.replace(/\s+/g, '-').toLowerCase();
  var id=req.params.id;
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
      // console.log(id);
      return res.render('admin/edit_category',{
      title:title,
      errors:errors.errors,
      id:id
    }
  );
}
  else
  {
    Category.findOne({slug:slug,_id:{'$ne':id}},(err,category)=>{
      if(category){
        req.flash('danger','Category title exists, choose another.');
        res.render('admin/edit_category',{
        title:title,
        id:id
      });
      }else{
        // console.log(typeof id);
        Category.findById(id,(err,category)=>{
          if(err)
          return console.log(err);

          category.title=title;
          category.slug=slug;
          category.save(err=>{
            if(err)
            return console.log(err);

            Category.find({},(err,categories)=>{
              if(err){
                console.log(err);
              }
              else{
                req.app.locals.categories=categories;
              }
            });

            req.flash('success','Category edited!');
            res.redirect('/admin/categories');
          });

        });
        
      }
    });
  }

}); 

//get delete category
router.get('/delete-category/:id', (req, res) => {
  Category.findByIdAndDelete(req.params.id,(err)=>{
    if(err) return console.log(err);

    Category.find({},(err,categories)=>{
              if(err){
                console.log(err);
              }
              else{
                req.app.locals.categories=categories;
              }
            });

    req.flash('success','Category deleted');
    res.redirect('/admin/categories');
  });
});
