/* global $ */

//This function allows us to update the assignments grade

function reCalculateGrade(tbody, weight, newAchieved, newTotal){
    var achieved = newAchieved;
    var total = newTotal;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length; i++){
        if(!$(rows[i]).hasClass("newSubassignmentRow")){
            //For every other row than the newSubassignmentrow, the acheivel and total should be added
            var achievedNum = parseFloat($(rows[i]).find("td.achieved").first().text());
            achieved += achievedNum;
            var totalNum = parseFloat($(rows[i]).find("td.total").first().text());
            total += totalNum; 
        }
    }
    var grade = (achieved*weight/total);
    if(isNaN(grade)){
        grade = weight;
    }
    return grade;
}

//Update the assignment and course grade
function updateGrades(tbody, coursePUTurl){
    var weight = parseFloat(tbody.siblings("thead").find(".weight").first().text());
    var gradeClass = tbody.siblings("thead").first().find(".grade").first();
    var newGrade = parseFloat(reCalculateGrade(tbody, weight, 0, 0));
    var oldGrade = parseFloat(gradeClass.text());
    gradeClass.text(newGrade.toFixed(3));
    var oldCourseGrade = parseFloat($("#currentCourseGrade").text());
    var newCourseGrade = oldCourseGrade - oldGrade + newGrade;
    $("#currentCourseGrade").text(newCourseGrade.toFixed(3));
    //PUT to the course route to update the current grade
    $.ajax({
        url: coursePUTurl,
        data: "course%5BcurrentGrade%5D=" + newCourseGrade,
        type: "PUT",
        success: function(data){
            console.log(data);
        }
    });
}

//Sets up the assignment grade
$(document).ready(function(){
    var tables = $('body').find(".subassignmentTable");
    var currentGrade = 0;
    for (var i = 0; i < tables.length; i++){
        //For every assignment calculate the achieved score, and add it to currentGrade
        var weight = parseFloat($(tables[i]).children("thead").first().find(".weight").first().text());
        var tbody = $(tables[i]).children("tbody");
        var achieved = reCalculateGrade(tbody, weight, 0, 0);
        if (isNaN(achieved)){
            achieved = 0;
        }
        var gradeClass = $(tables[i]).children("thead").first().find(".grade").first();
        gradeClass.text(achieved.toFixed(3));
        currentGrade += parseFloat(achieved);
    }
    
    //update current grade and PUT to course route
    $('#currentCourseGrade').text(currentGrade.toFixed(3));
    $.ajax({
        url: window.location.href+"?_method=PUT",
        data: "course%5BcurrentGrade%5D=" + parseFloat(currentGrade),
        type: "PUT",
        success: function(data){
            console.log('success');
        }
    });
    
    //Setting up the size of the info div, to match the table divs
    /*var widthRatio = $(".subassignmentTable").first().width()/$("#not-table").first().width();
    $("#not-table").width(widthRatio*100 + "%");
    $("#not-table").addClass("mx-auto");*/
});


//-------------------------------------------Adding New Subassignment-----------------------------------------------------------
//Allows the new Assignment form to show up
$("body").on("click", ".newSubassignmentBtn", function(){
    var newSubassignmentRow = $(this).parent().parent().parent().siblings('tbody').first().find('.newSubassignmentRow').first();
    if(newSubassignmentRow.css('display') == 'none'){
        newSubassignmentRow.show();
    }
});

//Adds the new subassignment and adds it to the table
$("body").on("submit", ".newSubassignmentForm", function(e){
    e.preventDefault();
    var tbody = $(this).siblings(".subassignmentTable").children("tbody").first();
    var newSubassignmentRow = tbody.find(".newSubassignmentRow").first();
    var subassignment = $(this).serialize();
    var actionUrl = $(this).attr("action");
    
    //POST to the subassignment route
    $.post(actionUrl, subassignment, function(data){
        var SubassignmentPutUrl = actionUrl+data._id;
        var SubassignmentDeleteUrl = actionUrl+data._id;
        //Add the new subassignment row
        newSubassignmentRow.before(
            `
            <tr data-actionUrl = "${ SubassignmentPutUrl }" data-subassignmentId = "${data._id}" >
               <td class='name'>${data.name}</td> 
               <td class="achieved">${data.achieved}</td> 
               <td> / </td>
               <td class="total">${data.total}</td> 
               <td>
               <button class="editBtn btn btn-outline-dark iconButton" style="display:inline"><i class="fas fa-edit"></i></button><form class="deleteBtn" action="${ SubassignmentDeleteUrl }" method="POST" style="display:inline"> <button class="btn btn-outline-dark iconButton"><i class="fas fa-trash"></i></button></form></td>
            </tr>    
            `
        );
        //Calculate new grade and update relevant fields
        updateGrades(tbody, data.url);
        newSubassignmentRow.hide()
});
});

//------------------------------------------------Editing existing subassignment------------------------------------------------------------------------

//Shows the edit form when clicked
$('body').on("click", ".editBtn", function(){
    var tr = $(this).parent().parent();
    var subassignmentId = tr.attr('data-subassignmentId');
    var subassignmentName = tr.children(".name").first().text();
    var subassignmentAchieved = tr.children(".achieved").first().text();
    var subassignmentTotal = tr.children(".total").first().text();
    var subassignmentPutUrl = tr.attr("data-actionUrl");
    tr.html(
        `
        <td><input type='text' form='${subassignmentId}' name="subassignment[name]" value='${subassignmentName}'> </td>
        <td><input type='number' form='${subassignmentId}' name="subassignment[achieved]" value='${subassignmentAchieved}' required></td>
        <td>/</td>
        <td><input type='number' form='${subassignmentId}' name="subassignment[total]" value='${subassignmentTotal}' required</td>
        <td><button form='${subassignmentId}' class="btn btn-outline-dark iconButton"> <i class="fas fa-check"></i></button><form id='${subassignmentId}' class="editSubassignmentForm" method="POST" action="${subassignmentPutUrl}"></form></td>
        `
        );
});

//Updates the subassignment
$("body").on("submit", ".editSubassignmentForm", function(e){
    e.preventDefault();
    var tr = $(this).parent().parent();
    var actionUrl = $(this).attr("action");
    var subassignment = $(this).serialize();
    var tbody = tr.parent();
    //PUT to subassignment route
    $.ajax({
        url: actionUrl,
        data: subassignment,
        type: "PUT",
        success: function(data){
            //Change the row with the updated information
            tr.html(
            `
               <td class="name">${data.name}</td> 
               <td class="achieved">${data.achieved}</td> 
               <td> / </td>
               <td class="total">${data.total}</td> 
               <td>
                    <button class="editBtn btn btn-outline-dark iconButton"><i class="fas fa-edit"></i></button>
                    <form class="deleteBtn" action="${ actionUrl }" method="POST" style="display:inline"> 
                        <button class="btn btn-outline-dark iconButton"><i class="fas fa-trash"></i></button>
                    </form>
                </td>
            `
            );
            //recalculate the achieved field for the assignment and the current course grade 
            updateGrades(tbody, data.url);
        }
        });
});


//----------------------------------Deleting existing subassignment------------------------------------------
$('body').on('submit', ".deleteBtn", function(e){
    e.preventDefault();
    var actionUrl = $(this).attr('action');
    var tr = $(this).parent().parent();
    var tbody = tr.parent();
    var $deletedItem = $(this).parent().parent();
    $.ajax({
        url: actionUrl,
        deletedItem: $deletedItem,
        type: "DELETE",
        success: function(data){
            //Remove the row and update relevant grade fields
            this.deletedItem.remove();
            updateGrades(tbody, data.url)
        }
    }
    );
});

