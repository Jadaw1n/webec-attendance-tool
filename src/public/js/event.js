window.app.page("event", () => {
  // called on init

  return (eventid) => {
    // called every time the page is accessed
    api(`organisation/${User.getData().organisation.id}/events/${eventid}`).then(event => {
      log(event);
    });
    
    setChartEventReasons();
  }
});

function setChartEventReasons() {
    var jData = {};
    jData.cols = [];
    jData.cols[jData.cols.length] = {'id':'','label':'Topping','pattern':'','type':'string'};
    jData.cols[jData.cols.length] = {'id':'','label':'Slices','pattern':'','type':'number'};
    jData.rows = [];
    jData.rows[jData.rows.length] = {'c':[{'v':'Anwesend','f':null},{'v':3,'f':null}]};
    
    api(`organisation/${User.getData().organisation.id}/reasons`).then(reasons => {
        const reasonsData = Object.values(reasons);
        for (i = 0; i < reasonsData.length; ++i) {
            jData.rows[jData.rows.length] = {'c':[{'v': reasonsData[i].text,'f':null},{'v':3,'f':null}]};
        }
        showPieChart('chart-event-reasons', null, jData, 800, 500);
    });
}