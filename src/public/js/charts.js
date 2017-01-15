// Loads the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

function showPieChart(id, title, jData, width, height) {
  // Creates the data table.
  var data = new google.visualization.DataTable(jData);
  // Sets chart options
  var options = {
    'title' : title,
    'width' : width,
    'height' : height};
  // Instantiate and draw chart, passing in some options.
  var chart = new google.visualization.PieChart(document.getElementById(id));
  chart.draw(data, options);
  return chart;
}

function showStackedAreaChart(id, title, jData, width, height) {
    // Creates the data table.
    var data = new google.visualization.DataTable(jData);
    // Set chart options.
    var options = {
        'title'     : title,
        'width'     : width,
        'height'    : height,
        'isStacked' : true
    };
    // Instantiates and draw chart, passing in some options.
    var chart = new google.visualization.AreaChart(document.getElementById(id));
    chart.draw(data, options);
}