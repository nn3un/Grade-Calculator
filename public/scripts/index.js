/* global RadialProgress */
/* global $ */
var courses= $('.courses').toArray();
console.log(courses);
courses.forEach(function(course){
    var bar = new RadialProgress(course, {thick: 10, fixedTextSize:0.25, colorText: 'black'});
    bar.setValue(parseFloat($(course).attr('data-grade'))/100);
})