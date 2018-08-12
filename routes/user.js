var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");
var middleware =require("../middleware");

//checks if legitimate user is signed in
router.get("/", middleware.checkCorrectUser, function(req, res){
    User.findById(req.params.userid).populate('courses').exec(function(err, foundUser){
        if (err){
            req.flash("error", "Cannot find User data");
        }
        else{
            res.render("user/index", {user: foundUser});
        }
    });
});

module.exports = router;