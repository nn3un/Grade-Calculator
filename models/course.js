var mongoose = require("mongoose");

var CourseSchema = new mongoose.Schema({
    student: 
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    name: String,
    currentGrade: Number,
    Assignments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Assignment"
            }
        ]
});
module.exports = mongoose.model("Course", CourseSchema);