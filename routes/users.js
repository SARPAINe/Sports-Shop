const express=require('express');
const router=express.Router();
var bcrypt=require('bcryptjs');
const passport = require('passport');
const User=require('../models/user');
const { body, validationResult } = require('express-validator');
const { outputFile } = require('fs-extra');
//Exports
module.exports=router;

//get register/
router.get("/register",(req,res)=>{
  res.render('register',{
    title:'Register'
  });
});

//post register
router.post("/register",[
body('name', 'Name is required').notEmpty(),
body('email', 'Email is required').notEmpty(),
body('username', 'Username is required').notEmpty(),
body('password', 'Password is required').notEmpty(),
body('password2', "Passwords don't match").custom((value,{req, loc, path}) => {
  if (value !== req.body.password) {
      // trow error if passwords do not match
      throw new Error("Passwords don't match");
      } else {
          return value;
      }
    })
],
(req,res)=>{
  var name=req.body.name;
  var email=req.body.email;
  var username=req.body.username;
  var password=req.body.password;
  var password2=req.body.password2;

  var errors = validationResult(req);
  // console.log(errors);
  // console.log(errors.errors.length);

  if(errors.errors.length!=0){
    res.render('register',{
      errors:errors.errors,
      user:null,
      title:'Register'

    });
  }
  else{

    User.findOne({username:username},(err,user)=>{
      if(err)console.log(err);
      if(user){
        req.flash('danger',"Username exists,choose another!");
        res.redirect('/user/register');
      }
      else{
        var user=new User({
          name:name,
          email:email,
          username:username,
          password:password,
          admin:0
        });

        bcrypt.genSalt(10,(err,salt)=>{
          bcrypt.hash(user.password,salt,(err,hash)=>{
            if(err)console.log(err);
            user.password=hash;
            user.save(err=>{
              if(err){console.log(err)}
              else{
                req.flash('success','You are now registered!');
                res.redirect('/users/login');
              }
            })
          })
        })
      }
    })
  }
});

//get login/
router.get("/login",(req,res)=>{
  if(res.locals.user)res.redirect('/');
  else{
    
    res.render('login',{
      title:"Log in"
    });
  }
});

//post login/
router.post("/login",(req,res,next)=>{
  passport.authenticate('local', { failureRedirect: '/users/login' ,failureFlash:true,successRedirect:'/'})(req, res,next);
});

//get logout/
router.get("/logout",(req,res)=>{
  req.logout();

  req.flash('success','You are logged out!');
  res.redirect('/users/login');
});




