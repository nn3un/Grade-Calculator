var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var Course = require("../models/course");
var middleware =require("../middleware");
var Assignment = require("../models/assignment");
var Subassignment = require("../models/subassignment");

//CREATE assignment route
router.post("/", middleware.checkCorrectUser, function(req, res) {
    var assignment = req.body.assignment;
    Assignment.create(assignment, function(err, newAssignment) {
        if(err){
            req.flash("error", "Couldn't add course, please try again");
            res.redirect("./new");
        }
        else{
            //find the course and push the assignment in
            Course.findById(req.params.courseid).populate('Assignments').exec(function(err, foundCourse) {
                if(err){
                    //if there's an error, go back to editing
                    req.flash("error", "couldn't find parent course for assignment");
                    res.redirect("/user/"+ foundCourse.student._id + "/course/" + foundCourse._id  + "/edit");
                }
                else{
                    foundCourse.Assignments.push(newAssignment);
                    foundCourse.save();
                    //send the course back to ajax so that they can use the information to update the view
                    newAssignment.assignmentUrl = "/user/"+ req.params.userid + "/course/" + req.params.courseid  + "/assignment/"+newAssignment._id+"?_method=PUT";
                    res.json(newAssignment);
                }
            });
        }
    });
});

//UPDATE assignment route
router.put("/:assignmentId", middleware.checkCorrectUser, function(req, res){
    Assignment.findByIdAndUpdate(req.params.assignmentId, req.body.assignment, {new: true}, function(err, updated){
        if(err){
            req.flash("error", "Error updating");
            res.redirect("/user/"+req.params.userid+"/course/new");
        }
        else{
            updated.assignmentUrl = "/user/"+ req.params.userid + "/course/" + req.params.courseid  + "/assignment/"+updated._id+"?_method=PUT";
            res.json(updated);
        }
    });
});

//DELETE courseless assignment route
router.delete("/:assignmentId", middleware.checkCorrectUser, function(req, res){
    Assignment.findByIdAndRemove(req.params.assignmentId, function(err, deleted){
        if(err){
            //if error stay at current page
            req.flash("error", "Error Deleting");
            res.redirect("/user/"+ req.params.userid + "/course/" + req.params.courseid  + "/edit");
        }
        else{
            deleted.subassignments.forEach(function(subassignment){
                Subassignment.findByIdAndRemove(subassignment._id, function(err, deletedSubassignment){
                    if(err){
                        console.log(err);
                    }
                });
            });
            Course.findByIdAndUpdate(req.params.courseid, {$pull: {Assignments: deleted._id}}, {new: true}, function(err, updated) {
                if(err){
                    //if there's an error, go back to editing
                    req.flash("error", "couldn't find parent course for assignment to delete");
                    res.redirect("/user/"+ updated.student._id + "/course/" + updated._id  + "/edit");
                }
                else{
                    res.json(deleted);
                }
            });
        }
    });
});

module.exports = router;