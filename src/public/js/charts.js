// Loads the Visualization API and the corechart package.
google.charts.load('current', { 'packages': ['corechart'] });

function showPieChart(id, title, dataArray, width, height) {
  // Creates the data table.
  const data = google.visualization.arrayToDataTable(dataArray);
  // Sets chart options
  const options = { title, width, height };
  // Instantiate and draw chart, passing in some options.
  const chart = new google.visualization.PieChart(document.getElementById(id));
  chart.draw(data, options);
  return chart;
}

function showStackedAreaChart(id, title, dataArray, width, height) {
  // Creates the data table.
  const data = google.visualization.arrayToDataTable(dataArray);
  // Set chart options.
  const options = { title, width, height, 'isStacked': true };

  // Instantiates and draw chart, passing in some options.
  const chart = new google.visualization.AreaChart(document.getElementById(id));
  chart.draw(data, options);
}


function showColumnChart(id, title, dataArray) {
  // Creates the data table.
  const data = google.visualization.arrayToDataTable(dataArray);
  // Set chart options.
  const options = { title, 'isStacked': true };

  // Instantiates and draw chart, passing in some options.
  const chart = new google.visualization.ColumnChart(document.getElementById(id));
  chart.draw(data, options);
}

function chartAttendanceByReason(attendances, reasons, outputElementId) {
  // for when no reason was set
  reasons["0"] = { text: "Unbekannt" };

  const notAttended = attendances.filter(att => att.presence == "0");

  // base data array
  const statistics = [
    ["Grund", "Anzahl"],
    ["Anwesend", attendances.length - notAttended.length]
  ];

  // group data by reason code
  const notAttendedGrouped = notAttended
    .reduce((dict, att) => {
      if (dict[att.reason_id] === undefined) dict[att.reason_id] = 0;
      dict[att.reason_id]++;
      return dict;
    }, {});

  // insert into statistics array
  Object.keys(notAttendedGrouped).forEach(reason_id => statistics.push([reasons[reason_id].text, notAttendedGrouped[reason_id]]));

  // chart it
  showPieChart(outputElementId, "", statistics, 800, 500);
}