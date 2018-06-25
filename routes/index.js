var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res) {
    res.render("landing");
});

router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if (err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Sign up successful");
            res.redirect("/");
        });
    });
});

router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        //successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res){
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