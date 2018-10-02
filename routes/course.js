var express = require("express");
var router = express.Router({ mergeParams: true });
var User = require("../models/user");
var Course = require("../models/course");
var middleware = require("../middleware");
var Assignment = require("../models/assignment");
var Subassignment = require("../models/subassignment");

//NEW course route
router.get("/new", middleware.checkCorrectUser, function(req, res) {
    User.findById(req.params.userid, function(err, foundUser) {
        if (err) {
            req.flash("error", "new failed");
        }
        else {
            res.render("course/new", { user: foundUser });
        }
    });
});

//CREATE new course route
router.post("/", middleware.checkCorrectUser, function(req, res) {
    var temp = [];
    
    //Create assignments according to the assignment ids and add them to a temp array
    if (req.body.assignments !== null && req.body.assignments !== undefined) {
        console.log(req.body.assignments);
        var assignments = Array.prototype.slice.call(req.body.assignments);
        console.log(assignments);
        assignments.forEach(function(assignmentId) {
            Assignment.findById(assignmentId, function(err, foundAssignment) {
                if (err) {
                    req.flash("error", "couldn't find assignment");
                    res.redirect(".");
                }
                else {
                    temp.push(foundAssignment);
                }
            });
        });
    }
    
    //Find user and add the course
    User.findById(req.params.userid, function(err, foundUser) {
        if (err) {
            //if user not found, go back to the form
            req.flash("error", "Couldn't find User, please try again");
            console.log("couldn't find user")
            res.redirect(".");
        }
        else {
            Course.create(req.body.course, function(err, newCourse) {
                if (err) {
                    //if creattion failed go back to new
                    req.flash("error", "Couldn't add course, please try again");
                    res.redirect(".");
                }
                else {
                    //add info and redirect to user's profile page
                    newCourse.student = req.user._id;
                    newCourse.Assignments = temp;
                    newCourse.save();
                    foundUser.courses.push(newCourse);
                    foundUser.save();
                    req.flash("success", "Added course");
                    res.json("/user/" + foundUser._id);
                }
            });
        }
    })
});



//SHOW course route
router.get("/:courseid", middleware.checkCorrectUser, function(req, res) {
    Course.findById(req.params.courseid).populate({ path: 'Assignments', populate: { path: 'subassignments' } }).exec(function(err, foundCourse) {
        if (err) {
            req.flash("error", "Error in show route");
            res.redirect("/user/" + req.params.userid);
        }
        else {
            res.render("course/show", { course: foundCourse });
        }
    });
});

router.get("/:courseid/ifElse", middleware.checkCorrectUser, function(req, res) {
    Course.findById(req.params.courseid).populate({ path: 'Assignments', populate: { path: 'subassignments' } }).exec(function(err, foundCourse) {
        if (err) {
            req.flash("error", "Error in show route");
            console.log(err);
            res.redirect("/user/" + req.params.userid);
        }
        else {
            res.render("course/ifElse", { course: foundCourse });
        }
    });
});



//EDIT course route
router.get("/:courseid/edit", middleware.checkCorrectUser, function(req, res) {
    Course.findById(req.params.courseid).populate('Assignments').exec(function(err, foundCourse) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid);
        }
        else {
            res.render("course/edit", { course: foundCourse });
        }
    });
});

//UPDATE course route
router.put("/:courseid", middleware.checkCorrectUser, function(req, res) {
    Course.findByIdAndUpdate(req.params.courseid, req.body.course, function(err, updated) {
        if (err) {
            req.flash("error", "Error updating");
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid + "/edit");
        }
        else if(req.body.course.name != null){
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid);
        }
        else{
            res.json(updated.courseGrade)
        }
    });
});

//DELETE course route
router.delete("/:courseId", middleware.checkCorrectUser, function(req, res) {
    Course.findByIdAndRemove(req.params.courseId, function(err, deleted) {
        if (err) {
            req.flash("error", "Error Deleting");
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseId);
        }
        else {
            //Delete all assignments for the course
            deleted.Assignments.forEach(function(assignment) {
                Assignment.findByIdAndRemove(assignment._id, function(err, deletedAssignment) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        //Delete all subassignment for every course
                        deletedAssignment.subassignments.forEach(function(subassignment) {
                            Subassignment.findByIdAndRemove(subassignment._id, function(err, deletedSubassignment) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });
            });
            //Delete the course from the users' courses' list
            User.findByIdAndUpdate(req.params.userid, { $pull: { courses: deleted._id } }, { new: true }, function(err, updated) {
                if (err) {
                    //if there's an error, go back to editing
                    req.flash("error", "couldn't find student");
                }
                res.redirect("/user/" + req.params.userid);
            });
        }
    });
});





//Courseless assignment routes, put here in lack of a better place

//CREATE courseless assignment route
router.post("/assignment", middleware.checkCorrectUser, function(req, res) {
    var assignment = req.body.assignment;
    Assignment.create(assignment, function(err, newAssignment) {
        if (err) {
            //if failed to create go back to form
            req.flash("error", "Couldn't add course, please try again");
            res.redirect("./new");
        }
        else {
            //send back info about newAssignemnt
            var assignmentUrl = "/user/"+ req.params.userid + "/course/assignment/" + newAssignment._id;
            res.json({assignment: newAssignment, url: assignmentUrl});
        }
    });
});

//UPDATE courseless assignment route
router.put("/assignment/:assignmentId", middleware.checkCorrectUser, function(req, res) {
    Assignment.findByIdAndUpdate(req.params.assignmentId, req.body.assignment, { new: true }, function(err, updated) {
        if (err) {
            //if error go back to form
            req.flash("error", "Error updating");
            res.redirect("/user/" + req.params.userid + "/course/new");
        }
        else {
            //else send back information about updated assignment
            var assignmentUrl = "/user/"+ req.params.userid + "/course/assignment/" + updated._id;
            res.json({assignment: updated, url: assignmentUrl});
        }
    });
});

//DELETE courseless assignment route
router.delete("/assignment/:assignmentId", middleware.checkCorrectUser, function(req, res) {
    Assignment.findByIdAndRemove(req.params.assignmentId, function(err, deleted) {
        if (err) {
            //if error go back to form
            req.flash("error", "Error Deleting");
            res.redirect("/user/" + req.params.userid + "/course/new");
        }
        else{
            res.json(deleted);
        }
    });
});


module.exports = router;
