const createEventCard = ({id, start, subject, description}) => {
  const startFmt = start.split(" ")[1].slice(0, -3);
  const descriptionFmt = description == null ? "" : description.replace(/(?:\r\n|\r|\n)/g, '<br />');
  return `
<div class="col-xs-12 col-md-6 col-lg-4">
    <div class="panel panel-default">
        <div class="panel-heading">${startFmt} - <a href="#event:${id}">${subject}</a></div>
        <div class="panel-body">
            <p>${descriptionFmt}</p>
        </div>
    </div>
</div>
`;
};

const createDayPart = (day, events) => {
  const dayParts = day.split('-');
  const dateFmt = `${dayParts[2]}.${dayParts[1]}.${dayParts[0]}`;
  return `
<h3>${dateFmt}</h3>
<div class="row">
${events.map(createEventCard).join('')}
</div>
`;
};

window.app.page("events", () => {
  // called on init

  $("#newEventForm [type=date]").datepicker({
    showWeek: true,
    firstDay: 1,
    changeMonth: true,
    changeYear: true,
    dateFormat: 'dd.mm.yy'
  }).datepicker("setDate", new Date());

  $("#newEventForm").submit(event => {
    event.preventDefault();

    const data = getFormData("newEventForm");

    api(`organisation/${User.getData().organisation.id}/events`, data).then(msg => {
      if (msg.status === "success") {
        $("#newEventForm")[0].reset();
        window.location.hash = "event:" + msg.id;
      } else {
        // show errors
        $("#newEventForm errors").text(msg.message);
      }
    });

    return false;
  });

  return () => {
    // called every time the page is accessed
    $("#allEvents").html("Events werden geladen...");

    api(`organisation/${User.getData().organisation.id}/events`).then(events => {
      const eventsByDate = Object.values(events).reduce((group, event) => {
        const date = event.start.split(" ")[0];

        if (group[date] === undefined) group[date] = [];

        group[date].push(event);

        return group;
      }, {});


      $("#allEvents").html(Object.keys(eventsByDate).map(date => createDayPart(date, eventsByDate[date])));
    });
    
    setChartEventsReasons();
  }
});

function setChartEventsReasons() {
    /*api(`organisation/${User.getData().organisation.id}/events`).then(events => {
        const eventsData = Object.values(events);
        console.info(eventsData);
    });
    
    api(`organisation/${User.getData().organisation.id}/members`).then(members => {
        const membersData = Object.values(members);
        console.info(membersData);
    });
    
    api(`organisation/${User.getData().organisation.id}/reasons`).then(reasons => {
        const reasonsData = Object.values(reasons);
        console.info(reasonsData);
    });*/
    
    var jData = {
    "cols": [
          {"id":"","label":"Topping","pattern":"","type":"string"},
          {"id":"","label":"Anwesend","pattern":"","type":"number"},
          {"id":"","label":"Ferien","pattern":"","type":"number"},
          {"id":"","label":"Krank","pattern":"","type":"number"},
          {"id":"","label":"Militär","pattern":"","type":"number"},
          {"id":"","label":"Sonstiges","pattern":"","type":"number"},
          {"id":"","label":"Unentschuldigt","pattern":"","type":"number"}
        ],
    "rows": [
          {"c":[{"v":"Event1","f":null},{"v":12,"f":null},{"v":1,"f":null},{"v":0,"f":null},{"v":0,"f":null},{"v":2,"f":null},{"v":3,"f":null}]},
          {"c":[{"v":"Event2","f":null},{"v":8,"f":null},{"v":0,"f":null},{"v":2,"f":null},{"v":0,"f":null},{"v":2,"f":null},{"v":5,"f":null}]},
          {"c":[{"v":"Event3","f":null},{"v":15,"f":null},{"v":2,"f":null},{"v":0,"f":null},{"v":1,"f":null},{"v":0,"f":null},{"v":1,"f":null}]}
        ]
    };
    
    showStackedAreaChart('chart-events-reasons', null, jData, 800, 500);
}