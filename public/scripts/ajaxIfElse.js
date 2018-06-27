/* global $ */

//This function allows us to update the assignments grade
function reCalculateGrade(tbody, weight){
    var achieved = 0;
    var total = 0;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length-1; i++){
        if (! $(rows[i]).hasClass('deletedRow')){
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

function updateGrades(tbody){
    var weight = parseFloat(tbody.siblings("thead").find(".weight").first().text());
    var gradeClass = tbody.siblings("thead").first().find(".grade").first();
    var newGrade = parseFloat(reCalculateGrade(tbody, weight));
    var oldGrade = parseFloat(gradeClass.val());
    gradeClass.val(newGrade);
    var oldCourseGrade = parseFloat($("#currentCourseGrade").text());
    var newCourseGrade = oldCourseGrade - oldGrade + newGrade;
    $("#currentCourseGrade").text(newCourseGrade);
}

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
    $('#currentCourseGrade').text(currentGrade);
});


$(document).on('change', '.total', function(){
    $(this).css("background-color", 'GREENYELLOW');
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

$(document).on('change', '.achieved', function(){
    $(this).css("background-color", 'GREENYELLOW');
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
            <td>
                <form class="deleteBtn" > 
                    <button>Delete</button>
                </form>
            </td>
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
    $(this).html('Re-add');
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});

$(document).on("click", ".reAddSubassignmentBtn", function(){
    var tr = $(this).parent().parent();
    tr.removeClass('deletedRow');
    tr.find('input').removeClass("deleted");
    $(this).removeClass('reAddSubassignmentBtn');
    $(this).addClass('deleteSubassignmentBtn');
    $(this).html('Delete');
    var tbody = $(this).parents('.subassignmentBody').first();
    updateGrades(tbody);
});