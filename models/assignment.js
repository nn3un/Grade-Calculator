var mongoose = require("mongoose");

var AssignmentSchema = new mongoose.Schema({
    name: String,
    weight: String,
    grade: String,
    subassignments:[
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subassignment" 
            }
            
        ]
});

module.exports = mongoose.model("Assignment", AssignmentSchema);