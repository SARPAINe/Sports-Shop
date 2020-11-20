const express=require('express');
const router=express.Router();
const { body, validationResult } = require('express-validator');

const Page=require('../models/page');

var auth=require('../config/auth');
var isUser=auth.isUser;
var isAdmin=auth.isAdmin;

//Exports
module.exports=router;

// get page index

router.get('/',isAdmin, (req, res) => {
  Page.find({}).sort({sorting:1}).exec((err,foundPages)=>{
    res.render('admin/pages',{
      pages:foundPages
    });
  });
});

// get add page
router.get('/add-page',isAdmin, (req, res) => {
  var title="";
  var slug="";
  var content="";

  res.render('admin/add_page',{
    title:title, 
    slug:slug,
    content:content
  })
}); 

// get edit page
router.get('/edit-page/:id',isAdmin, (req, res) => {
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

//post add page

router.post('/add-page', 
[
  body('title', 'title is required').notEmpty(),
body('content', 'Content is required').notEmpty()
],
(req, res) => {
  
  var title=req.body.title;
  var slug=req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if(slug=="") slug=req.body.title.replace(/\s+/g, '-').toLowerCase();
  var content=req.body.content;
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.render('admin/add_page',{
  title:title,
  slug:slug,
  content:content,
  errors:errors.errors
}
  );
}
  else
  {
    Page.findOne({slug:slug},(err,found)=>{
      if(found){
        req.flash('danger','Page slug exists, choose another.');
        res.render('admin/add_page',{
        title:title,
        slug:slug,
        content:content,
        errors:errors.errors
      });
      }else{
        const page=new Page({
          title:title,
          slug:slug,
          content:content,
          sorting:100
        });

        page.save((err)=>{
          if(err) 
          return console.log(err);

          Page.find({}).sort({sorting:1}).exec((err,pages)=>{
            if(err){
              console.log(err);
            }
            else{
              req.app.locals.pages=pages;
            }
          });


          req.flash('success','page added!');
          res.redirect('/admin/pages');
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

            Page.find({}).sort({sorting:1}).exec((err,pages)=>{
            if(err){
              console.log(err);
            }
            else{
              req.app.locals.pages=pages;
            }
          });

            req.flash('success','Page added!');
            res.redirect('/admin/pages');
          });

        });
        
      }
    });
  }

}); 

//get delete page
router.get('/delete-page/:id',isAdmin, (req, res) => {
  Page.findByIdAndDelete(req.params.id,(err)=>{
    if(err) return console.log(err);

    Page.find({}).sort({sorting:1}).exec((err,pages)=>{
            if(err){
              console.log(err);
            }
            else{
              req.app.locals.pages=pages;
            }
          });

    req.flash('success','Page deleted');
    res.redirect('/admin/pages');
  });
});
