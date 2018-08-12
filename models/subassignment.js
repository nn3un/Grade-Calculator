var mongoose = require("mongoose");

var SubassignmentSchema = new mongoose.Schema({
    name: String,
    total: Number,
    achieved: String
});

module.exports = mongoose.model("Subassignment", SubassignmentSchema);