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
    var currentGrade = 0;
    if (req.body.assignments !== null) {
        var assignments = Array.prototype.slice.call(req.body.assignments);
        assignments.forEach(function(assignmentId) {
            Assignment.findById(assignmentId, function(err, foundAssignment) {
                if (err) {
                    req.flash("error", "couldn't find assignment");
                    res.redirect("/new");
                }
                else {
                    temp.push(foundAssignment);
                    currentGrade += parseFloat(foundAssignment.weight);
                }
            });
        });
    }
    User.findById(req.params.userid, function(err, foundUser) {
        if (err) {
            req.flash("error", "Couldn't add course, please try again");
            res.redirect("./new");
        }
        else {
            Course.create(req.body.course, function(err, newCourse) {
                if (err) {
                    req.flash("error", "Couldn't add course, please try again");
                    res.redirect("./new");
                }
                else {
                    newCourse.student = req.user._id;
                    newCourse.currentGrade = currentGrade;
                    newCourse.Assignments = temp;
                    newCourse.save();
                    foundUser.courses.push(newCourse);
                    foundUser.save();
                    req.flash("success", "Added course");
                    res.json("/user/" + foundUser.id);
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
            console.log(err);
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
        else {
            res.redirect("/user/" + req.params.userid + "/course/" + req.params.courseid);
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
            deleted.Assignments.forEach(function(assignment) {
                Assignment.findByIdAndRemove(assignment._id, function(err, deletedAssignment) {
                    if (err) {
                        console.log(err);
                    }
                    else {
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





//Courseless assignment routes, put in here in lack of a better place

//CREATE courseless assignment route
router.post("/assignment", middleware.checkCorrectUser, function(req, res) {
    var assignment = req.body.assignment;
    Assignment.create(assignment, function(err, newAssignment) {
        if (err) {
            req.flash("error", "Couldn't add course, please try again");
            res.redirect("./new");
        }
        else {
            res.json(newAssignment);
        }
    });
});

//UPDATE courseless assignment route
router.put("/assignment/:assignmentId", middleware.checkCorrectUser, function(req, res) {
    Assignment.findByIdAndUpdate(req.params.assignmentId, req.body.assignment, { new: true }, function(err, updated) {
        if (err) {
            req.flash("error", "Error updating");
            res.redirect("/user/" + req.params.userid + "/course/new");
        }
        else {
            res.json(updated);
        }
    });
});

//DELETE courseless assignment route
router.delete("/assignment/:assignmentId", middleware.checkCorrectUser, function(req, res) {
    Assignment.findByIdAndRemove(req.params.assignmentId, function(err, deleted) {
        if (err) {
            req.flash("error", "Error Deleting");
            res.redirect("/user/" + req.params.userid + "/course/new");
        }
        else {
            res.json(deleted);
        }
    });
});


module.exports = router;
