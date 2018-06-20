/* global $ */

$("#assignmentForm").submit(function(e){
    e.preventDefault();
    var assignment = $(this).serialize();
    var actionURL = $(this).attr('action');
    $.post(actionURL, assignment, function(data){
        $("#assignment-list").append
        (
           `
            <li class="assignmentListItem">
                
                <!-- The edit assignment form that shows up when you press the edit button -->
                <form class="editForm" action="./assignment/${data._id}?_method=PUT"method="POST">
                    <label for="name">Name: </label>
                    <input value= ${data.name} type='text' name='assignment[name]' id="name">
                    <label for="weight">Weight: </label>
                    <input value= ${data.weight} type='text' name='assignment[weight]' id="weight">
                    <button>Update</button>
                </form>
                
                <p>Name: ${data.name} Weight: ${data.weight} </p>
                <button class="editButton">Edit</button>
                <form class="deleteForm" action="./assignment/${data._id}?_method=DELETE" method="POST">
                    <button>Delete</button>
                </form>
            </li>
            `
        );
        $("#assignmentForm").find(".newFormElement").val("");
    });
});


$(document).ready(function() {
    $("#assignment-list").on('click', '.editButton', function() {
        $(this).siblings('.editForm').toggle();
    });
    
    $("#assignment-list").on('submit', '.editForm', function(e){
        e.preventDefault();
        $("body").css("color", "red");
        var assignment = $(this).serialize();
        var actionUrl = $(this).attr('action');
        var $originialItem = $(this).parent(".assignmentListItem");
        $.ajax({
            url: actionUrl,
            type: "PUT",
            data: assignment,
            originialItem: $originialItem,
            success: function(data){
                var i = this.originialItem.index();
                this.originialItem.html(
                    `
                    <li class="assignmentListItem">
                        <form class="editForm" action="./assignment/${data._id}" method="POST">
                            <label for="name">Name: </label>
                            <input value=${data.name} type='text' name='assignment[name]' id="name">
                            <label for="weight">Weight: </label>
                            <input value=${data.weight} type='text' name='assignment[weight]' id="weight">
                            <button>Update</button>
                        </form>
                        <p>Name: ${data.name} Weight: ${data.weight}</p>
                        <button class="editButton">Edit</button>
                        <form class="deleteForm" action="./assignment/${data._id}?_method=DELETE" method="POST">
                            <button>Delete</button>
                        </form>
                    </li>
                    `
                );
                $(this).toggle();
            }
        });
    });
    
    $("#assignment-list").on('submit', '.deleteForm', function(e){
        e.preventDefault();
        var assignment = $(this).serialize();
        var actionUrl = $(this).attr('action');
        var $deletedItem = $(this).parent(".assignmentListItem");
        $.ajax({
            url: actionUrl,
            type: "DELETE",
            data: assignment,
            deletedItem: $deletedItem,
            success: function(data){
                this.deletedItem.remove();
            }
        });
    });
    
})