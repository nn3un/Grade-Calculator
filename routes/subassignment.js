var express = require("express");
var router = express.Router({ mergeParams: true });
var User = require("../models/user");
var Course = require("../models/course");
var middleware = require("../middleware");
var Assignment = require("../models/assignment");
var Subassignment = require("../models/subassignment");

//CREATE subassignment route
router.post("/", middleware.checkCorrectUser, function(req, res) {
    var subassignment = req.body.subassignment;
    Subassignment.create(subassignment, function(err, data) {
        if (err) {
            req.flash("error", "Couldn't add subassignment, please try again");
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid);
        }
        else {
            //find the course and push the assignment in
            Assignment.findById(req.params.assignmentid).populate('subassignments').exec(function(err, foundAssignment) {
                if (err) {
                    //if there's an error, go back to editing
                    req.flash("error", "couldn't find parent assignment in database");
                    res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid);
                }
                else {
                    foundAssignment.subassignments.push(data);
                    foundAssignment.save();
                    data.url = "/user/" + req.params.userid + "/course/" + req.params.courseid + "?_method=PUT";
                    res.json(data);
                    }
                    //send the course back to ajax so that they can use the information to update the view
                    
                
            });
        }
    });
});

//UPDATE subassignment route
router.put("/:subassignmentId", middleware.checkCorrectUser, function(req, res) {
    Subassignment.findByIdAndUpdate(req.params.subassignmentId, req.body.subassignment, { new: true }, function(err, updated) {
        if (err) {
            //if failed go back to course show page
            req.flash("error", "Error updating");
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid);
        }
        else {
            updated.url = "/user/" + req.params.userid + "/course/" + req.params.courseid + "?_method=PUT";
            res.json(updated);
        }
    });
});

//DELETE subassignment route
router.delete("/:subassignmentId", middleware.checkCorrectUser, function(req, res) {
    Subassignment.findByIdAndRemove(req.params.subassignmentId, function(err, deletedSub) {
        if (err) {
            //if error stay at current page
            req.flash("error", "Error Deleting");
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid + "/edit");
        }
        else {
            //Remove subassignment from assignment's list
            Assignment.findByIdAndUpdate(req.params.assignmentid, { $pull: { subassignments: deletedSub._id } , new: true},  function(err, updated) {
                if (err) {
                    console.log(err);
                }
                else {
                    deletedSub.url = "/user/" + req.params.userid + "/course/" + req.params.courseid + "?_method=PUT";
                    res.json(deletedSub);
                }
            });
        }
    });
});

module.exports = router;