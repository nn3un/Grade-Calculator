/* global $ */

//Updates the total weight field
function updateTotalWeight() {
    var assignmentListItems = $('#assignment-list').find('.assignmentListItem').toArray();
    var totalWeight = 0;
    assignmentListItems.forEach(function(assignmentListItem){
        var weight = parseFloat($(assignmentListItem).find('.weight').first().val());
        totalWeight += weight;
    });
    $("#totalWeight").val(totalWeight);
}

//An array to store the new assignment Ids

var assignmentIds;
//Creates an assignment 
$("#assignmentForm").submit(function(e){
    e.preventDefault();
    var assignment = $(this).serialize();
    //Post to courseless assignment route
    $.post("./assignment", assignment, function(data){
        assignmentIds.push(data.assignment._id);
        //Add the information to the list of assignments
        $("#assignment-list").append
        (
            `
            <li class="assignmentListItem list-group-item bg-light">
                <form class="editForm" action="${data.url}?_method=PUT" method="POST">
                    <label for="name" class="font-weight-bold">Name: </label>
                    <input value=${data.assignment.name} type='text' name='assignment[name]' id="name" disabled required>
                    <label for="weight" class="font-weight-bold">Weight: </label>
                    <input class= "weight" value=${data.assignment.weight} type='number' name='assignment[weight]' id="weight" disabled required>
                    <button class="updateAssignmentBtn btn btn-outline-dark iconButton"><i class="fas fa-check"></i></button>
                </form>
                <button style="display:inline" class="editButton iconButton btn btn-outline-dark"><i class="fas fa-edit"></i></button>
                <form style="display:inline" class="deleteForm" action="${data.url}?_method=DELETE" method="POST">
                    <button class="btn btn-outline-dark iconButton"><i class="fas fa-trash"></i></button>
                </form>
            </li>
            `
        );
        //empty the new form elemesnts and update total weight
        $(".form-group").find(".newFormElement").val("");
        updateTotalWeight();
    });
});


$(document).ready(function() {
    assignmentIds = [];
    //Add onclick listener for the edit button, which shows the edit form
    $("#assignment-list").on('click', '.editButton', function() {
        //when the edit button is clicked the inputs are enabled, the update button shows up, and the edit and delete button disappear
        $(this).siblings('.editForm').find("input").prop('disabled', false);
        $(this).siblings('.editForm').find(".updateAssignmentBtn").show();
        $(this).hide();
        $(this).siblings('.deleteForm').hide();
    });
    
    //Edits assignment
    $("#assignment-list").on('submit', '.editForm', function(e){
        e.preventDefault();
        var assignment = $(this).serialize();
        var actionUrl = $(this).attr('action');
        var $originialItem = $(this).parent(".assignmentListItem");
        //PUT to courseless assignment route
        $.ajax({
            url: actionUrl,
            type: "PUT",
            data: assignment,
            originialItem: $originialItem,
            success: function(data){
                //Change the view from edit to show
                this.originialItem.html(
                    `
                        <form class="editForm" action="${data.url}?_method=PUT" method="POST">
                            <label class="font-weight-bold" for="name">Name: </label>
                            <input value=${data.assignment.name} type='text' name='assignment[name]' id="name" disabled required>
                            <label class="font-weight-bold" for="weight">Weight: </label>
                            <input class="weight" value=${data.assignment.weight} type='number' name='assignment[weight]' id="weight" disabled required>
                            <button class="updateAssignmentBtn btn btn-outline-dark iconButton"><i class="fas fa-check"></i></button>
                        </form>
                        <button style="display:inline" class="editButton btn btn-outline-dark iconButton"><i class="fas fa-edit"></i></button>
                        <form style="display:inline" class="deleteForm" action="${data.url}?_method=DELETE" method="POST">
                            <button class="btn btn-outline-dark iconButton"><i class="fas fa-trash"></i></button>
                        </form>
                    `
                );
                $(this).toggle();
            }
            
            
        });
        updateTotalWeight();
    });
    
    //Deletes assignment
    $("#assignment-list").on('submit', '.deleteForm', function(e){
        e.preventDefault();
        var assignment = $(this).serialize();
        var actionUrl = $(this).attr('action');
        var $deletedItem = $(this).parent(".assignmentListItem");
        //DELETE to courseless assignment form
        $.ajax({
            url: actionUrl,
            type: "DELETE",
            data: assignment,
            deletedItem: $deletedItem,
            success: function(data){
                //Remove assignment from list
                var i = this.deletedItem.index();
                assignmentIds.splice(i, 1);
                this.deletedItem.remove();
                updateTotalWeight();
            }
        });
    });
    
    //Add course
    $("#courseForm").on('submit', function(e){
        e.preventDefault();
        var actionURL = $(this).attr('action');
        var dataToSend = $(this).serialize();
        //add assignment ids to the dataToSend
        for (var i = 0; i < assignmentIds.length; i++){
            dataToSend += "&assignments%5B"+i+"%5D="+assignmentIds[i];
        }
        //On success go back to course show page
        $.post(actionURL, dataToSend, function(data){
            window.location.href = data;
        });
    });
})