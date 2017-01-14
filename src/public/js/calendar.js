var calendars = [];
var events = {};

var client_id = '176534308723-g6v8gkp1fu7j12i44f1cvvb4svg4sl4i.apps.googleusercontent.com';

var scopes = ["https://www.googleapis.com/auth/calendar"];


window.app.page("calendar", () => {
  $("#calendarLoadEvents").on("click", listCalendarEvents);
  appendDatepicker('#calendar-from', 'first');
  appendDatepicker('#calendar-to', 'last');
  $("#calendarImportEvents").on("click", importEvents);

  return (eventid) => {
    // called every time the page is accessed

  }
});

function handleAuthResult(authResult) {
  var authorizeButton = document.getElementById('authorize-button');
  if (authResult) {
    authorizeButton.parentNode.removeChild(authorizeButton);
    gapi.client.load('calendar', 'v3', listCalendars);
  } else {
    authorizeButton.textContent = "Authorisierung fehlgeschlagen";
  }
}

$("#authorize-button").on("click", function (event) {
  event.preventDefault();
  gapi.auth.authorize({ client_id, scope: scopes.join(' '), immediate: false }, handleAuthResult);
});

function listCalendars() {
  var request = gapi.client.calendar.calendarList.list();
  request.execute(function (resp) {
    var calendarsList = resp.items;
    var fs = document.createElement('FIELDSET');
    document.getElementById('calendars').innerHTML = null;
    document.getElementById('calendars').appendChild(fs);
    var lg = document.createElement("LEGEND");
    lg.innerHTML = 'Kalender';
    fs.appendChild(lg);

    calendars = [];
    for (i = 0; i < calendarsList.length; ++i) {
      var calendar = calendarsList[i];

      var lbl = document.createElement('LABEL');
      lbl.setAttribute('for', calendar.id);

      var ckb = document.createElement('INPUT');
      ckb.setAttribute('type', 'checkbox');
      ckb.setAttribute('name', 'calendar');
      ckb.setAttribute('value', calendar.id);
      ckb.setAttribute('id', calendar.id);

      lbl.innerHTML = calendar.summary;

      if (calendar.primary) {
        ckb.setAttribute('selected', 'selected');
        ckb.setAttribute('checked', 'checked');
        lbl.innerHTML += ' (primary)';
      }

      calendar.checkbox = ckb;
      calendar.label = lbl;

      calendars.push(calendar);
      fs.appendChild(calendar.checkbox);
      fs.appendChild(calendar.label);
      if (i < calendarsList.length - 1)
        fs.appendChild(document.createElement('BR'));
    }

    document.getElementById('calendar-properties').style.display = "block";
  });
}

function appendDatepicker(id, type) {
  var date = new Date();
  if (type === 'first') {
    date = new Date('January 1, ' + new Date().getFullYear());
  } else if (type === 'last') {
    date = new Date('December 31, ' + new Date().getFullYear());
  }

  $(id).datepicker({
    showWeek: true,
    firstDay: 1,
    changeMonth: true,
    changeYear: true,
    dateFormat: 'dd.mm.yy'
  }).datepicker("setDate", date);
}

const eventToHtml = (event) => {
  const {id, summary, start, end, calendar_name, location} = event;
  events[id] = event;

  return `
<tr id="${id}">
  <td>
    <input name="active" value="${id}" id="${id}" checked="checked" type="checkbox">
  </td>
  <td>${calendar_name}</td>
  <td>${summary || ""}</td>
  <td>${getFormattedDateStr(start)}</td>
  <td>${getFormattedDateStr(end)}</td>
  <td>${location || ""}</td>
</tr>
`;
};

const flattenEvents = (evts, calendar) => evts.concat(calendar.items.map(item => { item.calendar_name = calendar.summary; return item }));

const orderEvents = (a, b) => {
  const a_start = a.start.dateTime || a.start.date;
  const b_start = b.start.dateTime || b.start.date;
  if (a_start > b_start) {
    return 1;
  } else if (b_start < a_start) {
    return -1;
  }
  return 0;
};

function listCalendarEvents() {
  $("#calendarEventList").html("Loading...");
  $("#calendar-events").toggle();

  Promise
    .all(calendars.filter(c => c.checkbox.checked).map(listEvents))
    .then((calendarsWithEvents) => {
      $("#calendarEventList").html(
        calendarsWithEvents
          // get all events from calendars in a flat event list
          .reduce(flattenEvents, [])
          // order by date
          .sort(orderEvents)
          // produce html
          .map(eventToHtml)
      );
    });
}

function listEvents({id: calendar_id}) {
  return new Promise(function (resolve, reject) {
    const calendar_from = $('#calendar-from').datepicker('getDate');
    const calendar_to = $('#calendar-to').datepicker('getDate');
    calendar_to.setDate(calendar_to.getDate() + 1);

    const maxResults = document.getElementById('calendar-max').value;

    const request = gapi.client.calendar.events.list(
      {
        'calendarId': calendar_id,
        'timeMin': calendar_from.toISOString(), // >=
        'timeMax': calendar_to.toISOString(), // <
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': maxResults, // Max: 2500, default: 250
        'orderBy': 'startTime'
      });

    request.execute(resolve);
  });
}

function getFormattedDateStr({date, dateTime}) {
  if (date !== undefined) {
    return date.substring(8, 10) +
      '.' + date.substring(5, 7) +
      '.' + date.substring(0, 4);
  }
  return dateTime.substring(8, 10) +
    '.' + dateTime.substring(5, 7) +
    '.' + dateTime.substring(0, 4) +
    ' ' + dateTime.substring(11, 16);
}

function importEvents() {
  $("#calendarImportEvents").text("Import gestartet...").prop('disabled', true);

  const propertyList = ['summary', 'start', 'end', 'description', 'location'];
  const selectedEvents = $("#calendarEventList input:checked")
    .toArray() // jquery to normal array
    .map(input => propertyList.reduce((obj, key) => { obj[key] = events[input.id][key]; return obj; }, {}));


  api(`organisation/${User.getData().organisation.id}/events/import`, selectedEvents).then(msg => {
    if (msg.status == "success") {
      window.location.hash = "events";
    } else {
      log(msg);
      alert("An error happened!\n" + JSON.stringify(msg));
    }
  });
}