var calendarProperties;
var calendars = [];
var events = [];
var eventActions;
var eventFieldSet;
var eventTable;
var eventImport;

var clientId = '176534308723-g6v8gkp1fu7j12i44f1cvvb4svg4sl4i.apps.googleusercontent.com';
var scopes = ["https://www.googleapis.com/auth/calendar"];

function checkAuth() {
    gapi.auth.authorize(
        {client_id: clientId, scope: scopes.join(' '), immediate: true},
        handleAuthResult
    );
}

function handleAuthResult(authResult) {
  var authorizeButton = document.getElementById('authorize-button');
  if (authResult) {
    //authorizeButton.style.visibility = 'hidden';
    authorizeButton.parentNode.removeChild(authorizeButton);
    gapi.client.load('calendar', 'v3', listCalendars);
  } else {
    authorizeButton.style.visibility = '';
   }
}

$("#authorize-button").on("click", function(event) {
    event.preventDefault();
    gapi.auth.authorize({client_id: clientId, scope: scopes.join(' '), immediate: false}, handleAuthResult);
  return false;
});

function listCalendars() {
    var request = gapi.client.calendar.calendarList.list();
    request.execute(function(resp){
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
            if (calendar.primary) {
                ckb.setAttribute('selected', 'selected');
                ckb.setAttribute('checked', 'checked');
                lbl.innerHTML = calendar.id + ' (primary)';
            } else {
                lbl.innerHTML = calendar.id;
            }
            
            calendar.checkbox = ckb;
            calendar.label = lbl;
            
            calendars.push(calendar);
            fs.appendChild(calendar.checkbox);
            fs.appendChild(calendar.label);
            if (i < calendarsList.length - 1)
                fs.appendChild(document.createElement('BR'));
        }

        document.getElementById('calendar-properties').appendChild(getCalendarProperties());
        appendDatepicker('#calendar-from', 'first');
        appendDatepicker('#calendar-to', 'last');
    });
}

function getCalendarProperties() {
    if (calendarProperties === undefined) {
        var lg = document.createElement('LEGEND');
        lg.innerHTML = 'Kalender Einstellungen';
        // from
        var fromLabel = document.createElement('LABEL');
        fromLabel.setAttribute('for', 'calendar-from');
        fromLabel.innerHTML = 'Von';       
        var from = document.createElement('INPUT');
        from.setAttribute('type', 'text');
        from.setAttribute('id', 'calendar-from');        
        // to
        var toLabel = document.createElement('LABEL');
        toLabel.setAttribute('for', 'calendar-to');
        toLabel.innerHTML = 'Bis';       
        var to = document.createElement('INPUT');
        to.setAttribute('type', 'text');
        to.setAttribute('id', 'calendar-to');
        // maxResults
        var maxResLabel = document.createElement('LABEL');
        maxResLabel.setAttribute('for', 'calendar-max');
        maxResLabel.innerHTML = 'Max. Anzahl Events'; 
        var maxRes = document.createElement('INPUT');
        maxRes.setAttribute('type', 'number');
        maxRes.setAttribute('min', '0');
        maxRes.setAttribute('max', '2500');
        maxRes.setAttribute('value', '25');
        maxRes.setAttribute('id', 'calendar-max');
        maxRes.setAttribute('name', 'maxResults');
        // loadEvents
        var loadEvents = document.createElement('SPAN');
        loadEvents.setAttribute('onclick', 'listEvents()');
        loadEvents.setAttribute('class', 'btn btn-md btn-primary');
        loadEvents.innerHTML = 'Events laden';
        
        calendarProperties = document.createElement('FIELDSET');
        calendarProperties.appendChild(lg);
        calendarProperties.appendChild(fromLabel);
        calendarProperties.appendChild(from);
        calendarProperties.appendChild(toLabel);
        calendarProperties.appendChild(to);
        calendarProperties.appendChild(maxResLabel);
        calendarProperties.appendChild(maxRes);
        calendarProperties.appendChild(loadEvents);
    }
    return calendarProperties;
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

function listEvents() {
    // Inits the event container.
    events = [];
    document.getElementById('calendar-events').innerHTML = null;
    eventFieldSet = getEventFieldSet();
    document.getElementById('calendar-events').appendChild(eventFieldSet);
    
    for (i = 0; i < calendars.length; ++i) {
        if (calendars[i].checkbox.checked) {
            listEvent(calendars[i].id);
        }
    }
    
    appendEventImport();
}

function listEvent(calendar_id) {
    
    console.info('listEvent: ' + calendar_id);
    
    var calendar_from = $('#calendar-from').datepicker('getDate');
    calendar_from = calendar_from.getFullYear() + '-' + 
                    ('0' + (calendar_from.getMonth() + 1)).slice(-2) + '-' +
                    ('0' + calendar_from.getDate()).slice(-2) + 'T00:00:00.000Z';
    
    var calendar_to = $('#calendar-to').datepicker('getDate');
    calendar_to.setDate(calendar_to.getDate() + 1);
    calendar_to = calendar_to.getFullYear() + '-' +
                    ('0' + (calendar_to.getMonth() + 1)).slice(-2) + '-' +
                    ('0' + calendar_to.getDate()).slice(-2) + 'T00:00:00.000Z';
    
    var maxResults = document.getElementById('calendar-max').value;
    
    var request = gapi.client.calendar.events.list(
        {
            'calendarId': calendar_id,
            'timeMin': calendar_from, // >=
            'timeMax': calendar_to, // <
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': maxResults, // Max: 2500, default: 250
            'orderBy': 'startTime'
        });
        
    request.execute(function(resp) {
        var eventsList = resp.items;

        if (eventsList.length > 0) {
            // Loops through the event list.
            for (i = 0; i < eventsList.length; i++) {
                var event = eventsList[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                // Checked element
                var checked = document.createElement('INPUT');
                checked.setAttribute('type', 'checkbox');
                checked.setAttribute('name', 'active');
                checked.setAttribute('value', event.id);
                checked.setAttribute('id', event.id);                
                event.checked = checked;
                // calendar_id
                event.calendar_id = calendar_id;
                // Table row
                var tdChecked = document.createElement('TD');
                tdChecked.appendChild(event.checked);
                var tdCalendar = document.createElement('TD');
                tdCalendar.innerHTML = calendar_id;
                
                var aLink = document.createElement('A');
                aLink.setAttribute('href', event.htmlLink);
                aLink.setAttribute('target', '_blank');
                aLink.innerHTML = event.summary;                
                var tdSummary = document.createElement('TD');
                tdSummary.appendChild(aLink);
                
                var tdStart = document.createElement('TD');
                tdStart.innerHTML = getFormatedDateStr(event.start.dateTime);
                var tdEnd = document.createElement('TD');
                tdEnd.innerHTML = getFormatedDateStr(event.end.dateTime);
                var tdLocation = document.createElement('TD');
                tdLocation.innerHTML = event.location;
                
                var tr = document.createElement('TR');
                tr.setAttribute('id', event.id);
                tr.appendChild(tdChecked);
                tr.appendChild(tdCalendar);
                tr.appendChild(tdSummary);
                tr.appendChild(tdStart);
                tr.appendChild(tdEnd);
                tr.appendChild(tdLocation);
                
                eventTable.appendChild(tr);

                events.push(event);
            }
        }
    });
}

function getEventFieldSet() {
    // Table
    var thChecked = document.createElement('TH');
    thChecked.innerHTML = 'Import';
    var thCalendar = document.createElement('TH');
    thCalendar.innerHTML = 'Kalender';
    var thSummary = document.createElement('TH');
    thSummary.innerHTML = 'EventTitel';
    var thStart = document.createElement('TH');
    thStart.innerHTML = 'EventStart';
    var thEnd = document.createElement('TH');
    thEnd.innerHTML = 'EventEnde';
    var thLocation = document.createElement('TH');
    thLocation.innerHTML = 'Ort';
    var tr = document.createElement('TR');
    tr.appendChild(thChecked);
    tr.appendChild(thCalendar);
    tr.appendChild(thSummary);
    tr.appendChild(thStart);
    tr.appendChild(thEnd);
    tr.appendChild(thLocation);
    eventTable = document.createElement('TABLE');
    eventTable.setAttribute('id', 'calendar-events');
    eventTable.appendChild(tr);
    // Fieldset
    var eventLegend = document.createElement('LEGEND');
    eventLegend.innerHTML = 'Kalender Events';
    var eventSet = document.createElement('FIELDSET');
    eventSet.setAttribute('id', 'events-set');
    eventSet.appendChild(eventLegend);
    eventSet.appendChild(eventTable);
    
    return eventSet;
}

function getFormatedDateStr(dateToFormat) {
    return dateToFormat === undefined ? null : dateToFormat.substring(8,10) + 
            '.' + dateToFormat.substring(5,7) + 
            '.' + dateToFormat.substring(0,4) + 
            ' ' + dateToFormat.substring(11,19);
}

function appendEventImport() {
    if (eventImport === undefined) {
        eventImport = document.createElement('SPAN');
        eventImport.setAttribute('onclick', 'importEvents()');
        eventImport.setAttribute('class', 'btn btn-md btn-primary');
        eventImport.innerHTML = 'Events importieren';
        
        calendarProperties.appendChild(eventImport);
    }
}

function importEvents() {
    console.info('importEvents...');
}