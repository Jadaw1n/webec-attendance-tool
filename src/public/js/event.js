const attendanceToHtml = ({id: member_id, firstname, lastname}, {id: attendance_id, presence, reason_id}, reasons) => {
  const isPresent = presence == "1" ? "checked" : "";
  const reasonsEnabled = presence == "1" ? "disabled" : "";

  const reasonDropDown = `
<select class="form-control" ${reasonsEnabled}>
  <option value="0"></option>
  ${Object.values(reasons)
    .filter(reason => reason.shown == "1")
    .map(reason => `<option value="${reason.id}" ${reason_id == reason.id && "selected"}>${reason.text}</option>`)
    .join('')}
</select>
`;

  return `
<tr data-id="${attendance_id}">
  <td>${member_id}</td>
  <td>${firstname}</td>
  <td>${lastname}</td>
  <td class="no-padding">
      <label class="switch">
          <input type="checkbox" ${isPresent}>
          <div class="slider"></div>
      </label>
  </td>
  <td class="no-padding">
      <div class="btn-group">
      ${reasonDropDown}
      </div>
  </td>
</tr>
  `;
};

function saveAttendance(eventid, $row) {
  const attendance_id = $row[0].dataset.id;
  const data = {
    presence: $row.find("input")[0].checked,
    reason: $row.find("select")[0].selectedOptions[0].value
  };

  api(`organisation/${User.getData().organisation.id}/events/${eventid}/attendance/${attendance_id}`, data).then(msg => {
    if (msg.status != "success") {
      alert("Es trat ein Fehler beim speichern auf!");
    }
  });
}

window.app.page("event", () => {
  // called on init
  let eventid = 0;

  $("#attendanceList").on("change", "input", (event) => {
    $select = $(event.target).parents("tr").find("select");
    $select.prop('disabled', event.target.checked);
    if (event.target.checked) {
      $select[0].selectedIndex = 0;
    }

    saveAttendance(eventid, $(event.target).parents("tr"));
  });

  $("#attendanceList").on("change", "select", (event) => {
    saveAttendance(eventid, $(event.target).parents("tr"));
  });

  return (eid) => {
    eventid = eid;

    $("#attendanceList").html("Loading...");

    Promise.all([
      api(`organisation/${User.getData().organisation.id}/reasons`),
      api(`organisation/${User.getData().organisation.id}/events/${eventid}`)
    ]).then(([reasons, {status, event, members}]) => {
      if (status != "success") return log(status), alert(status);

      log(event);

      $("#eventName").text(event.subject + " " + event.start);
      $("#eventDescription").text(event.description);

      $("#attendanceList").html(Object.values(event.ownAttendance).map(att => {
        return attendanceToHtml(members[att.member_id], att, reasons);
      }));
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