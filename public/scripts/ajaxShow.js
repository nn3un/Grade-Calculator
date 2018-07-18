/* global $ */

//This function allows us to update the assignments grade

function reCalculateGrade(tbody, weight, newAchieved, newTotal){
    var achieved = newAchieved;
    var total = newTotal;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length; i++){
        if(!$(rows[i]).hasClass("newSubassignmentRow")){
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

//Sets up the assignment grade
$(document).ready(function(){
    var tables = $('body').find(".subassignmentTable");
    var currentGrade = 0;
    for (var i = 0; i < tables.length; i++){
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
    $('#currentCourseGrade').text(currentGrade.toFixed(3));
    $.ajax({
        url: window.location.href+"?_method=PUT",
        data: "course%5BcurrentGrade%5D=" + currentGrade,
        type: "PUT",
        success: function(data){
            console.log('success');
        }
    });
});


//-------------------------------------------Adding New Subassignment-----------------------------------------------------------
//Allows the new Assignment form to show up
$("body").on("click", ".newSubassignmentBtn", function(){
    var newSubassignmentRow = $(this).parent().parent().parent().siblings('tbody').first().find('.newSubassignmentRow').first();
    //var newSubassignmentForm = $(this).parent().parent().parent().parent().siblings(".newSubassignmentForm");
    if(newSubassignmentRow.css('display') == 'none'){
        newSubassignmentRow.show();
    }
});

//Adds the new subassignment and adds it to the table
$("body").on("submit", ".newSubassignmentForm", function(e){
    e.preventDefault();
    var tbody = $(this).siblings(".subassignmentTable").children("tbody").first();
    var newSubassignmentRow = tbody.find(".newSubassignmentRow").first();
    var weight = parseFloat($(this).siblings(".subassignmentTable").children("thead").first().find(".weight").first().text());
    var gradeClass = $(this).siblings(".subassignmentTable").children("thead").first().find(".grade").first();
    var subassignment = $(this).serialize();
    var actionUrl = $(this).attr("action");
    $.post(actionUrl, subassignment, function(data){
        
        var SubassignmentPutUrl = actionUrl+data._id;
        var SubassignmentDeleteUrl = actionUrl+data._id;
        newSubassignmentRow.before(
            `
            <tr data-actionUrl = "${ SubassignmentPutUrl }" data-subassignmentId = "${data._id}" >
               <td class='name'>${data.name}</td> 
               <td class="achieved">${data.achieved}</td> 
               <td> / </td>
               <td class="total">${data.total}</td> 
               <td><button class="editBtn btn btn-outline-dark iconButton" style="display:inline"><i class="fas fa-edit"></i></button><form class="deleteBtn" action="${ SubassignmentDeleteUrl }" method="POST" style="display:inline"> <button class="btn btn-outline-dark iconButton"><i class="fas fa-trash"></i></button></form></td>
            </tr>    
            `
        );
        var newGrade = parseFloat(reCalculateGrade(tbody, weight, 0, 0));
        var oldGrade = parseFloat(gradeClass.text());
        var oldCourseGrade = parseFloat($("#currentCourseGrade").text());
        var newCourseGrade = oldCourseGrade - oldGrade + newGrade;
        gradeClass.text(newGrade.toFixed(3));
        $("#currentCourseGrade").text(newCourseGrade.toFixed(3));
        newSubassignmentRow.hide();
            $.ajax({
                url: data.url,
                data: "course%5BcurrentGrade%5D=" + newCourseGrade,
                type: "PUT",
                success: function(data){
                    console.log('success');
                }
            }
    );
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
        <td><input type='text' form='${subassignmentId}' name="subassignment[achieved]" value='${subassignmentAchieved}'></td>
        <td>/</td>
        <td><input type='text' form='${subassignmentId}' name="subassignment[total]" value='${subassignmentTotal}'></td>
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
    $.ajax({
        url: actionUrl,
        data: subassignment,
        type: "PUT",
        success: function(data){
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
            var tbody = tr.parent();
            var weight = parseFloat(tbody.siblings("thead").first().find(".weight").first().text(), 10);
            var gradeClass = tbody.siblings("thead").first().find(".grade").first();
            var newGrade = parseFloat(reCalculateGrade(tbody, weight, 0, 0));
            var oldGrade = parseFloat(gradeClass.text());
            var oldCourseGrade = parseFloat($("#currentCourseGrade").text());
            var newCourseGrade = oldCourseGrade - oldGrade + newGrade;
            gradeClass.text(newGrade.toFixed(3));
            $("#currentCourseGrade").text(newCourseGrade.toFixed(3));
            $.ajax({
                url: data.url,
                data: "course%5BcurrentGrade%5D=" + newCourseGrade,
                type: "PUT",
                success: function(data){
                    console.log('success');
                }
            });
        }
        });
});


//----------------------------------Deleting existing subassignment------------------------------------------
$('body').on('submit', ".deleteBtn", function(e){
    e.preventDefault();
    var actionUrl = $(this).attr('action');
    var tr = $(this).parent().parent();
    var tbody = tr.parent();
    var weight = parseFloat(tbody.siblings("thead").first().find(".weight").first().text(), 10);
    var gradeClass = tbody.siblings("thead").first().find(".grade").first();
    var $deletedItem = $(this).parent().parent();
    $.ajax({
        url: actionUrl,
        deletedItem: $deletedItem,
        type: "DELETE",
        success: function(data){
            this.deletedItem.remove();
            var newGrade = parseFloat(reCalculateGrade(tbody, weight, 0, 0));
            var oldGrade = parseFloat(gradeClass.text());
            gradeClass.text(newGrade.toFixed(3));
            var oldCourseGrade = parseFloat($("#currentCourseGrade").text());
            var newCourseGrade = oldCourseGrade - oldGrade + newGrade;
            $("#currentCourseGrade").text(newCourseGrade.toFixed(3));
            $.ajax({
                url: data.url,
                data: "course%5BcurrentGrade%5D=" + newCourseGrade,
                type: "PUT",
                success: function(data){
                    console.log('success');
                }
            });
        }
    }
    );
});

