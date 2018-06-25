/* global $ */

//This function allows us to update the assignments grade
function reCalculateGrade(tbody, weight){
    var achieved = 0;
    var total = 0;
    var rows = tbody.find("tr");
    for(var i = 0; i < rows.length; i++){
        var achievedNum = parseFloat($(rows[i]).find("td.achieved").first().text(), 10);
        achieved += achievedNum;
        var totalNum = parseFloat($(rows[i]).find("td.total").first().text(), 10);
        total += totalNum;
    }
    var grade = (achieved*weight/total).toFixed(3);
    if(isNaN(grade)){
        grade = weight;
    }
    return grade;
}


$(document).ready(function() {
    $(document).on('change', '.total', function(){
        $(this).css("background-color", 'GREENYELLOW');
            var tbody = $(this).parents('.subassignmentTable').first();
            var weight = parseFloat(tbody.siblings("thead").first().find(".weight").first().text(), 10);
            var gradeClass = tbody.siblings("thead").first().find(".grade").first();
            var newGrade = parseFloat(reCalculateGrade(tbody, weight), 10);
            var oldGrade = parseFloat(gradeClass.text(), 10);
            gradeClass.text(newGrade);
            var oldCourseGrade = parseFloat($("#currentCourseGrade").text(), 10);
            var newCourseGrade = oldCourseGrade - oldGrade + newGrade;
            $("#currentCourseGrade").text(newCourseGrade);
    })
})