var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");
var passwordValidator = require("password-validator")
var schema = new passwordValidator();
schema.is().min(8).is().max(20).has().lowercase().has().digits()

router.get("/", function(req, res) {
    res.render("landing");
});

//--------------------------------------------------Register page-----------------------------------------------
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    
    //Check if password is valid
    if(!schema.validate(req.body.password)){
        req.flash("error", "Password must be valid");
        return res.redirect("/register");
    }
    
    //Register to mongoose
    User.register(newUser, req.body.password, function(err, user){
        if (err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Sign up successful");
            res.redirect("/user/"+user._id);
        });
    });
});


//----------------------------------------------Login page--------------------------------------------------------
router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res){
        //When a user is found go to the user's homepage
        User.findOne({username: req.body.username}, function(err, foundUser){
            if (err){
                req.flash("error", err.message);
            }
            else{
                req.flash("success", "Login successful");
                res.redirect("user/"+foundUser.id);
            }
        });
    });

router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;