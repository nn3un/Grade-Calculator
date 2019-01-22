/* global $ */

//This function allows us to update the assignments grade
function reCalculateGrade(tbody, weight){
    var achieved = 0;
    var total = 0;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length-1; i++){
        if (!$(rows[i]).hasClass('deletedRow')){
            //For every row add to the achieved and total 
            var achievedNum = parseFloat($(rows[i]).find(".achieved").first().val(), 10);
            achieved += achievedNum;
            var totalNum = parseFloat($(rows[i]).find(".total").first().val(), 10);
            total += totalNum;
        }
    }
    var grade = (achieved*weight/total).toFixed(3);
    if(isNaN(grade)){
        grade = weight;
    }
    return grade;
}


function getSumOfNewTotalsAndOldAchieveds(tbody, newTotal){
    var oldAchieved = 0;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length-1; i++){
        if (! $(rows[i]).hasClass('deletedRow')){
            var totalNum = parseFloat($(rows[i]).find(".total").first().val(), 10);
            newTotal += totalNum;
            var achievedNum = parseFloat($(rows[i]).find(".achieved").first().val(), 10);
            oldAchieved += achievedNum;
        }
    }
    var sums = [newTotal, oldAchieved];
    return sums;
}

//Update the assignment and course grade
function updateGrades(tbody){
    var weight = parseFloat(tbody.siblings("thead").find(".weight").first().text());
    var gradeClass = tbody.siblings("thead").first().find(".grade").first();
    var newGrade = parseFloat(reCalculateGrade(tbody, weight));
    var oldGrade = parseFloat(gradeClass.val());
    gradeClass.val(newGrade);
    var oldCourseGrade = parseFloat($("#currentCourseGrade").text());
    var newCourseGrade = oldCourseGrade - oldGrade + newGrade;
    $("#currentCourseGrade").text(newCourseGrade.toFixed(3));
}

//--------------------------------------Set up --------------------------------//
$(document).ready(function() {
    var tables = $('body').find(".subassignmentTable");
    var currentGrade = 0;
    for (var i = 0; i < tables.length; i++){
        //For every table add update the total achieved and add to the course current grade
        var weight = parseFloat($(tables[i]).children("thead").first().find(".weight").first().text());
        var tbody = $(tables[i]).children("tbody");
        var achieved = reCalculateGrade(tbody, weight);
        if (isNaN(achieved)){
            achieved = 0;
        }
        var gradeClass = $(tables[i]).children("thead").first().find(".grade").first();
        gradeClass.val(achieved);
        currentGrade += parseFloat(achieved);
    }
    $('#currentCourseGrade').text(currentGrade.toFixed(3));
});


//Change the background color of an input when it's value changes
$(document).on('change', 'input', function(){
    if ($(this).val() !== $(this).prop("defaultValue")){
        $(this).addClass("updated");
    }
    else{
        $(this).removeClass("updated");
    }
});

//When the total weight of an assignment changes, update the grades too
$(document).on('change', '.total', function(){
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

//When the achieved of an assignment changes, update the grades too
$(document).on('change', '.achieved', function(){
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

//Add subassignment
$(document).on("click", ".addSubassignment", function(){
    var tr = $(this).parent().parent();
    var name = tr.find(".newName").val();
    var achieved = tr.find(".newAchieved").val();
    var total = tr.find(".newTotal").val();
    tr.before(
        `
        <tr class="added">
            <td><input class="name" value="${name}" ></td> 
            <td><input type="text" class="achieved" value="${achieved}" required></td> 
            <td> / </td>
            <td><input type='number' step='0.01' class="total" value="${total}" required></td> 
            <td><button class="deleteSubassignmentBtn btn btn-outline-dark iconButton"><i class="fas fa-times"></i></button></td>
        </tr>
        `);
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

//Delete subassignment
$(document).on("click", ".deleteSubassignmentBtn", function(){
    var tr = $(this).parent().parent();
    tr.addClass('deletedRow');
    tr.find('input').addClass("deleted");
    $(this).removeClass('deleteSubassignmentBtn');
    $(this).addClass('reAddSubassignmentBtn');
    //If the row is not part of the original course, add a trash option, otherwise add a re-add option
    if(tr.hasClass('adjusted') || tr.hasClass('added')){
       $(this).parent().html("<button class='reAddSubassignmentBtn btn btn-outline-dark iconButton'><i class='fas fa-plus'></i></button><button class='removeSubassignmentBtn btn btn-outline-dark iconButton'><i class='fas fa-trash'></i></button>");
    }
    else{
        $(this).parent().html("<button class='reAddSubassignmentBtn btn btn-outline-dark iconButton'><i class='fas fa-plus'></i></button>");
    }
    var tbody = tr.parent();
    updateGrades(tbody);
});

//Re-add the deleted assignment
$(document).on("click", ".reAddSubassignmentBtn", function(){
    var tr = $(this).parent().parent();
    tr.removeClass('deletedRow');
    tr.find('input').removeClass("deleted");
    $(this).removeClass('reAddSubassignmentBtn');
    $(this).addClass('deleteSubassignmentBtn');
    $(this).parent().html("<button class='deleteSubassignmentBtn btn btn-outline-dark iconButton'><i class='fas fa-times'></i></button>");
    var tbody = tr.parent();
    updateGrades(tbody);
});

//permanently remove a subassignment
$(document).on("click", ".removeSubassignmentBtn", function(){
    var tr = $(this).parent().parent();
    tr.remove();
});

//Listens for focusin and stores the old value
$(document).on('focusin', '.grade', function(){
    $(this).data('val', $(this).val());
})

//When a change happens to an assignment's total, we have to add an adjustment row, so that
//the student knows how much they might need in that future assignment to get their assignment grade 
//their desired level
$(document).on("change", ".grade", function(){
    var currentGrade = parseFloat($(this).val());
    var oldGrade = parseFloat($(this).data('val'));
    var weight = parseFloat($(this).parent().siblings('.weight').first().text());
    var total = parseFloat(prompt("You just changed your grade for this assignment to the grade you wish you have in the future. To show you what kind of score you would need in a child subassignment to acheive this dream score, could you please write down the weight of the future subassignment as a percentage of the subassignments total weight?", "100"));
    var tbody = $(this).parents('thead').first().siblings('.subassignmentBody').first();
    var sums = getSumOfNewTotalsAndOldAchieveds(tbody, total);
    var sumOfTotals = sums[0];
    var sumOfAchieveds = sums[1];
    var achieved = (sumOfTotals*currentGrade/weight-sumOfAchieveds).toFixed(3);
    var addSubassignmentRow = $(this).parents('.subassignmentTable').first().find('.newSubassignment').first();
    addSubassignmentRow.before(
        `
        <tr class="adjusted">
            <td><input class="name" value="Adjustment Grade" ></td> 
            <td><input type='number' step='0.01' class="achieved" value="${achieved}" required></td> 
            <td> / </td>
            <td><input type='number' step='0.01' class="total" value='${total}' required></td> 
            <td><button class="deleteSubassignmentBtn btn btn-outline-dark iconButton"><i class='fas fa-times'></i></button></td>
        </tr>
        `
    );
    var changeInCourseGrade = currentGrade - oldGrade;
    var newCourseGrade = (parseFloat($('#currentCourseGrade').text()) + changeInCourseGrade).toFixed(3);
    $('#currentCourseGrade').text(newCourseGrade);
    
});

