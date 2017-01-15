const memberEntry = ({id, firstname, lastname}) => {
  return `
<tr>
  <td>${id}</td>
  <td><a href="#member:${id}">${firstname}</a></td>
  <td>${lastname}</td>
  <td class="right"><a href="#" class="deleteMember" data-id="${id}">entfernen</a></td>
</tr>
`;
};

const updateMemberTable = () => {
  api(`organisation/${User.getData().organisation.id}/members`).then(members => {
    $("#memberList").html(Object.values(members).filter(r => r.shown == 1).map(memberEntry));
  });
};

window.app.page("members", () => {
  // called on init

  $("#memberAddForm").submit(event => {
    event.preventDefault();

    const data = getFormData("memberAddForm");

    api(`organisation/${User.getData().organisation.id}/members`, data).then(msg => {
      if (msg.status === "success") {
        $("#memberAddForm")[0].reset();
        updateMemberTable();
      } else {
        // show errors
        $("#memberAddForm errors").text(msg.message);
      }
    });

    return false;
  });

  $("#memberList").on("click", "a.deleteMember", (event) => {
    event.preventDefault();

    const memberId = event.target.dataset.id;

    api(`organisation/${User.getData().organisation.id}/members/${memberId}`, null, "delete").then(msg => {
      updateMemberTable();
    });
  });

  return () => {
    // called every time the page is accessed
    updateMemberTable();
    setChartMembersReasons();
  }
});

function setChartMembersReasons() {
    var jData = {};
    jData.cols = [];
    jData.cols[jData.cols.length] = {'id':'','label':'Topping','pattern':'','type':'string'};
    jData.cols[jData.cols.length] = {'id':'','label':'Anwesend','pattern':'','type':'number'};
 
    api(`organisation/${User.getData().organisation.id}/reasons`).then(reasons => {
        const reasonsData = Object.values(reasons);
        for (i = 0; i < reasonsData.length; ++i) {
            jData.cols[jData.cols.length] = {'id':'','label': reasonsData[i].text ,'pattern':'','type':'number'};
        }
        
        jData.rows = [];
        
        api(`organisation/${User.getData().organisation.id}/members`).then(members => {
            const membersJdata = Object.values(members);
            
            console.info('setChartMembersReasons(): ' + membersJdata.length);

            for (i = 0; i < membersJdata.length; ++i) {
                var row = {'c':[
                        {'v':membersJdata[i].firstname + ' ' + membersJdata[i].lastname, 'f':null},
                        {'v':12,'f':null}
                    ]};
                for (j = 0; j < reasonsData.length; ++j) {
                    row.c[row.c.length] = {"v":1,"f":null};
                }
                jData.rows[jData.rows.length] = row;
            }
            showStackedAreaChart('chart-members-reasons', null, jData, 800, 500);
        });
    });
}