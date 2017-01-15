window.app.page("member", () => {
  // called on init

  return (member_id) => {
    // called every time the page is accessed
    api(`organisation/${User.getData().organisation.id}/members/${member_id}`).then(msg => {
      const member = msg.member;

      if (msg.status === "success") {
        $("#memberFullName").text(`${member.firstname} ${member.lastname}`);
      } else {
        alert(msg.message);
        log(msg);
      }
    });
    
    setChartMemberReasons();
  }
});

function setChartMemberReasons() {
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
        showPieChart('chart-member-reasons', null, jData, 800, 500);
        
        console.info('setChartMemberReasons() end');
    });
}