const express=require('express');
const router=express.Router();

const Page=require('../models/page');
//Exports
module.exports=router;

//get /
router.get("/",(req,res)=>{
  Page.findOne({slug:'home'},(err,page)=>{
    if(err)
    console.log(err);
    else{
      res.render('index',{
        title:page.title,
        content:page.content
      });
    }
  });
});

//get a page
router.get("/:slug",(req,res)=>{

  var slug=req.params.slug;
  Page.findOne({slug:slug},(err,page)=>{
    if(err)
    console.log(err);
    if(!page){
      res.redirect('/');
    }
    else{
      res.render('index',{
        title:page.title,
        content:page.content
      });
    }
  });
});


