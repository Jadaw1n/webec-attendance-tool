// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

function showPieChart(id, title, jData, width, height) {
  // Create the data table.
  var data = new google.visualization.DataTable(jData);
  // Set chart options
  var options = {
    'title' : title,
    'width' : width,
    'height' : height};
  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.PieChart(document.getElementById(id));
  chart.draw(data, options);
  return chart;
}

function showColChart(id, title, jData, width, height) {
  // Create the data table.
  var data = new google.visualization.DataTable(jData);
  // Set chart options
  var options = {
    'title' : title,
    'width' : width,
    'height' : height};
  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.ColumnChart(document.getElementById(id));
  chart.draw(data, options);
}

function showLineChart(id, title, jData, width, height) {
  // Create the data table.
  var data = new google.visualization.DataTable(jData);
  // Set chart options
  var options = {
    'title' : title,
    'width' : width,
    'height' : height};
  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.LineChart(document.getElementById(id));
  chart.draw(data, options);
}

function showStackColChart(id, title, jData, width, height) {
  // Create the data table.
  var data = new google.visualization.DataTable(jData);
  // Set chart options
  var options = {
    'title'     : title,
    'width'     : width,
    'height'    : height,
    'isStacked' : true
  };
  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.ColumnChart(document.getElementById(id));
  chart.draw(data, options);
}


function showStackedAreaChart(id, title, jData, width, height) {
    // Create the data table.
    var data = new google.visualization.DataTable(jData);
    // Set chart options
    var options = {
        'title'     : title,
        'width'     : width,
        'height'    : height,
        'isStacked' : true
    };
    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.AreaChart(document.getElementById(id));
    chart.draw(data, options);
}