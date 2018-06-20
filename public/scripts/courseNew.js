/* global $ */
$('#newAssignmentBtn').click(function(){
    var i = $("#assignment-list li").length;
    $("#assignment-list").append
        (
           `
            <li>
                <input type='text' name='assignments[${i}][name]' placeholder='AssignmentName i.e homework' form = "courseForm">
                <label>Weight</label><input type='text', name='assignments[${i}][weight]' placeholder='weight in percent' form = "courseForm">
            </li>
            `
        );
})