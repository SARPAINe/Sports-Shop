const express=require('express');
const router=express.Router();

//Exports
module.exports=router;

router.get("/",(req,res)=>{
  res.render('index',{
    title:"Home"
  });
});

