/* global RadialProgress */
/* global $ */
$(document).ready(function(e) {
    var $input = $('#refresh');

    $input.val() == 'yes' ? location.reload(true) : $input.val('yes');
});

var courses= $('.courses').toArray();
//Create the progress bars
courses.forEach(function(course){
    var bar = new RadialProgress(course, {thick: 10, fixedTextSize:0.25, colorText: 'black', colorFg: '#5173ad', colorBg: 'white'});
    bar.setValue(parseFloat($(course).attr('data-grade'))/100);
})

