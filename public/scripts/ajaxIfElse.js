/* global $ */

//This function allows us to update the assignments grade
function reCalculateGrade(tbody, weight){
    var achieved = 0;
    var total = 0;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length-1; i++){
        if (!$(rows[i]).hasClass('deletedRow')){
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

//--------------------------------------Set up ------------------------------------------//
$(document).ready(function() {
    var tables = $('body').find(".subassignmentTable");
    var currentGrade = 0;
    for (var i = 0; i < tables.length; i++){
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

$(document).on('change', 'input', function(){
    if ($(this).val() !== $(this).prop("defaultValue")){
        $(this).addClass("updated");
    }
    else{
        $(this).removeClass("updated");
    }
});

$(document).on('change', '.total', function(){
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

$(document).on('change', '.achieved', function(){
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

$(document).on("click", ".addSubassignment", function(){
    var tr = $(this).parent().parent();
    var name = tr.find(".newName").val();
    var achieved = tr.find(".newAchieved").val();
    var total = tr.find(".newTotal").val();
    tr.before(
        `
        <tr class="added">
            <td><input class="name" value="${name}" ></td> 
            <td><input class="achieved" value="${achieved}" ></td> 
            <td> / </td>
            <td><input class="total" value="${total}" ></td> 
            <td><button class="deleteSubassignmentBtn btn btn-outline-dark iconButton"><i class="fas fa-times"></i></button></td>
        </tr>
        `);
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

$(document).on("click", ".deleteSubassignmentBtn", function(){
    var tr = $(this).parent().parent();
    tr.addClass('deletedRow');
    tr.find('input').addClass("deleted");
    $(this).removeClass('deleteSubassignmentBtn');
    $(this).addClass('reAddSubassignmentBtn');
    if(tr.hasClass('adjusted') || tr.hasClass('added')){
       $(this).parent().html("<button class='reAddSubassignmentBtn btn btn-outline-dark iconButton'><i class='fas fa-plus'></i></button><button class='removeSubassignmentBtn btn btn-outline-dark iconButton'><i class='fas fa-trash'></i></button>");
    }
    else{
        $(this).parent().html("<button class='reAddSubassignmentBtn btn btn-outline-dark iconButton'><i class='fas fa-plus'></i></button>");
    }
    var tbody = tr.parent();
    updateGrades(tbody);
});

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

$(document).on("click", ".removeSubassignmentBtn", function(){
    var tr = $(this).parent().parent();
    tr.remove();
});

$(document).on('focusin', '.grade', function(){
    $(this).data('val', $(this).val());
})

$(document).on("change", ".grade", function(){
    var currentGrade = parseFloat($(this).val());
    var oldGrade = parseFloat($(this).data('val'));
    var weight = parseFloat($(this).parent().siblings('.weight').first().text());
    var total = parseFloat(prompt("To show how much you will need to get in the future assignment, could you tell us, what the future subassignment's weight will be?", "100"));
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
            <td><input class="achieved" value="${achieved}" ></td> 
            <td> / </td>
            <td><input class="total" value='${total}' ></td> 
            <td><button class="deleteSubassignmentBtn btn btn-outline-dark iconButton"><i class='fas fa-times'></i></button></td>
        </tr>
        `
    );
    var changeInCourseGrade = currentGrade - oldGrade;
    var newCourseGrade = (parseFloat($('#currentCourseGrade').text()) + changeInCourseGrade).toFixed(3);
    $('#currentCourseGrade').text(newCourseGrade);
    
});

