/* global $ */
var assignmentIds = [];

$("#assignmentForm").submit(function(e){
    e.preventDefault();
    var assignment = $(this).serialize();
    $.post("./assignment", assignment, function(data){
        assignmentIds.push(data._id);
        var i = $("#assignment-list li").length;
        $("#assignment-list").append
        (
            `
            <li class="assignmentListItem list-group-item">
                <form class="editForm" action="./assignment/${data._id}?_method=PUT" method="POST">
                    <label for="name">Name: </label>
                    <input value=${data.name} type='text' name='assignment[name]' id="name">
                    <label for="weight">Weight: </label>
                    <input value=${data.weight} type='text' name='assignment[weight]' id="weight">
                    <button class="btn btn-outline-dark iconButton"><i class="fas fa-check"></i></button>
                </form>
                <p>Name: ${data.name} Weight: ${data.weight}</p>
                <button class="editButton iconButton btn btn-outline-dark"><i class="fas fa-edit"></i></button>
                <form style="display:inline" class="deleteForm" action="./assignment/${data._id}?_method=DELETE" method="POST">
                    <button class="btn btn-outline-dark iconButton"><i class="fas fa-trash"></i></button>
                </form>
            </li>
            `
        );
        $(".form-group").find(".newFormElement").val("");
    });
});


$(document).ready(function() {
    $("#assignment-list").on('click', '.editButton', function() {
        $(this).siblings('.editForm').toggle();
    });
    
    $("#assignment-list").on('submit', '.editForm', function(e){
        e.preventDefault();
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
                    <li class="assignmentListItem list-group-item">
                        <form class="editForm" action="./assignment/${data._id}" method="POST">
                            <label for="name">Name: </label>
                            <input value=${data.name} type='text' name='assignment[name]' id="name">
                            <label for="weight">Weight: </label>
                            <input value=${data.weight} type='text' name='assignment[weight]' id="weight">
                            <button class="btn btn-outline-dark iconButton"><i class="fas fa-check"></i></button>
                        </form>
                        <p>Name: ${data.name} Weight: ${data.weight}</p>
                        <button class="editButton btn btn-outline-dark iconButton"><i class="fas fa-edit"></i></button>
                        <form style="display:inline" class="deleteForm" action="./assignment/${data._id}?_method=DELETE" method="POST">
                            <button class="btn btn-outline-dark iconButton"><i class="fas fa-trash"></i></button>
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
                var i = this.deletedItem.index();
                assignmentIds.splice(i);
                this.deletedItem.remove();
            }
        });
    });
    
    $("#courseForm").on('submit', function(e){
        e.preventDefault();
        var actionURL = $(this).attr('action');
        var dataToSend = $(this).serialize();
        for (var i = 0; i < assignmentIds.length; i++){
            dataToSend += "&assignments%5B"+i+"%5D="+assignmentIds[i];
        }
        $.post(actionURL, dataToSend, function(data){
            window.location.href = data;
        });
    });
})