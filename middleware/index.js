var User = require("../models/user.js");

module.exports = {
    //Checks if a user is logged in
    checkCorrectUser: function(req, res, next){
        if(req.isAuthenticated()){
            if (req.params.userid == req.user._id){
                next();
            }
            else{
                res.redirect("/login");
            }
        }
        else{
            res.redirect("/login");
        }
    }
};