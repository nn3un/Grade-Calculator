var mongoose = require("mongoose");

var AssignmentSchema = new mongoose.Schema({
    name: String,
    weight: Number,
    grade: Number,
    subassignments:[
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subassignment" 
            }
            
        ]
});

module.exports = mongoose.model("Assignment", AssignmentSchema);