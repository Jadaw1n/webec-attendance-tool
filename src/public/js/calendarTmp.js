var CLIENT_ID = '176534308723-g6v8gkp1fu7j12i44f1cvvb4svg4sl4i.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar"];
var calendars = [];
var events = [];
var eventActions;
var eventFieldSet;
var eventFrame; // events as calendar iframe
var eventTable; // events as list/table
var isEventTable;
var eventPost; // event create board

function checkAuth() {
    gapi.auth.authorize(
        {
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
        },
        handleAuthResult
    );
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        gapi.client.load(
            'calendar',
            'v3',
            listCalendars // null
        );
    } else {
        gapi.auth.authorize(
            {
                client_id: CLIENT_ID,
                scope: SCOPES,
                immediate: false
            },
            handleAuthResult
        );
    }
}

function changeCalendar() {
    // Does not signOut?... -> TODO
    gapi.auth.signOut();
}

function listCalendars() {
    /*if (gapi.client.calendar === undefined) {
        checkAuth();
    } else {*/
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
            var calendar = {
                'id': calendarsList[i].id,
                'accessRole': calendarsList[i].accessRole,
                'backgroundColor': calendarsList[i].backgroundColor,
                'colorId': calendarsList[i].colorId,
                'etag': calendarsList[i].etag,
                'foregroundColor': calendarsList[i].foregroundColor,
                'kind': calendarsList[i].kind,
                'primary': calendarsList[i].primary === undefined ? false : calendarsList[i].primary,
                'selected': calendarsList[i].selected,
                'summary': calendarsList[i].summary,
                'timeZone': calendarsList[i].timeZone,
                'checkbox': null,
                'label': null
            };

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
    });
    //}
}

function listEvents() {
    // Inits the event container.
    events = [];
    document.getElementById('events').innerHTML = null;
    eventFieldSet = getEventFieldSet();
    document.getElementById('events').appendChild(eventFieldSet);
    
    for (i = 0; i < calendars.length; ++i) {
        if (calendars[i].checkbox.checked) {
            listEvent(calendars[i].id);
        }
    }
    
    isEventTable = true;
    getShowCalendar();
    getEventActions();
    getEventFrame();
}

function listEvent(calendar_id) {
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
                var tdStatus = document.createElement('TD');
                tdStatus.innerHTML = event.status;
                var tdCreated = document.createElement('TD');
                tdCreated.innerHTML = getFormatedDateStr(event.created);
                var tdCreator = document.createElement('TD');
                tdCreator.innerHTML = event.creator.email;
                
                var tr = document.createElement('TR');
                tr.setAttribute('id', event.id);
                tr.appendChild(tdChecked);
                tr.appendChild(tdCalendar);
                tr.appendChild(tdSummary);
                tr.appendChild(tdStart);
                tr.appendChild(tdEnd);
                tr.appendChild(tdLocation);
                tr.appendChild(tdStatus);
                tr.appendChild(tdCreated);
                tr.appendChild(tdCreator);
                
                eventTable.appendChild(tr);

                events.push(event);
            }
        }
    });
}

$( function() {
    $( "#calendar-from" ).datepicker({
        showWeek: true,
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd.mm.yy'
    }).datepicker("setDate", new Date('January 1, ' + new Date().getFullYear()));
});

$( function() {
    $( "#calendar-to" ).datepicker({
        showWeek: true,
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd.mm.yy'
    }).datepicker("setDate", new Date('December 31, ' + new Date().getFullYear()));
});

function getEventFieldSet() {
    // Table
    var thChecked = document.createElement('TH');
    thChecked.innerHTML = 'Checked';
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
    var thStatus = document.createElement('TH');
    thStatus.innerHTML = 'Status';
    var thCreated = document.createElement('TH');
    thCreated.innerHTML = 'Erstellt';
    var thCreator = document.createElement('TH');
    thCreator.innerHTML = 'Ersteller';
    var tr = document.createElement('TR');
    tr.appendChild(thChecked);
    tr.appendChild(thCalendar);
    tr.appendChild(thSummary);
    tr.appendChild(thStart);
    tr.appendChild(thEnd);
    tr.appendChild(thLocation);
    tr.appendChild(thStatus);
    tr.appendChild(thCreated);
    tr.appendChild(thCreator);
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

var showEventsList = 'als Liste anzeigen';
var showEventsCalendar = 'als Kalender anzeigen';
function getShowCalendar() {
    var show = document.createElement('SPAN');
    show.setAttribute('id','calendar');
    show.setAttribute('onclick', 'showCalendar()');
    if (isEventTable) {
        show.innerHTML = showEventsCalendar;
    } else {
        show.innerHTML = showEventsList;
    }
    
    var showOld = document.getElementById('calendar');
    if (showOld) {
        showOld.parentNode.removeChild(showOld);
    } else {
        document.getElementById('calendar-actions').innerHTML += ' | ';
    }
    
    document.getElementById('calendar-actions').appendChild(show);
}

function showCalendar() {
    var show = document.getElementById('calendar');
    // Removes appended node.
    var evtPost = document.getElementById('calendar-event-create');
    if (evtPost) {
        evtPost.parentNode.removeChild(evtPost);
    }
    var calEvents = document.getElementById('calendar-events');
    if (calEvents) {
        calEvents.parentNode.removeChild(calEvents);
    }
    // Appends node according to the isEventTable value.
    if (isEventTable) {
        if (eventFrame === undefined) {
            getEventFrame();
        }
        document.getElementById('events-set').appendChild(eventFrame);
        
        show.innerHTML = showEventsList;
        isEventTable = false;
    } else {
        document.getElementById('events-set').appendChild(eventTable);
        
        show.innerHTML = showEventsCalendar;
        isEventTable = true;
    }
}

function getEventFrame() {
    var calendarsStr = 'https://calendar.google.com/calendar/embed?';
    var timeZone;
    
    for (i = 0; i < calendars.length; ++i) {
        if (calendars[i].primary || calendars[i].checkbox.checked) {
            calendarsStr += 'src=' + calendars[i].id + '&';
            if (calendars[i].primary) {
                timeZone = 'ctz=' + calendars[i].timeZone;
            }
        }
    }
    calendarsStr += timeZone;
    
    eventFrame = document.createElement('IFRAME');
    eventFrame.setAttribute('id', 'calendar-events');
    eventFrame.setAttribute('src', calendarsStr);
    eventFrame.setAttribute('width', '800');
    eventFrame.setAttribute('height', '600');
    eventFrame.setAttribute('frameborder','0');
    eventFrame.setAttribute('scrolling','no');
}

function getEventActions() {
    if (eventActions === undefined) {
        var legend = document.createElement('LEGEND');
        legend.innerHTML = 'Event Aktionen';
        
        var postEvent = document.createElement('SPAN');
        postEvent.setAttribute('onclick','postEvent()');
        postEvent.innerHTML = 'Event erstellen';
        
        var deleteEvents = document.createElement('SPAN');
        deleteEvents.setAttribute('onclick','deleteEvents()');
        deleteEvents.innerHTML = 'Events löschen';
        
        var importEvent = document.createElement('SPAN');
        importEvent.setAttribute('onclick','importEvent()');
        importEvent.innerHTML = 'Events importieren';
        
        eventActions = document.createElement('FIELDSET');
        eventActions.setAttribute('id','event-actions');
        eventActions.appendChild(legend);
        eventActions.appendChild(postEvent);
        eventActions.innerHTML += ' | ';
        eventActions.appendChild(deleteEvents);
        eventActions.innerHTML += ' | ';
        eventActions.appendChild(importEvent);
        document.getElementById('actions').appendChild(eventActions);
    }
}

function deleteEvents() {
    for (i = 0; i < events.length; ++i) {
        if (events[i] !== null && events[i].checked.checked) {
            var request = gapi.client.calendar.events.delete({
                'calendarId': events[i].calendar_id,
                'eventId': events[i].id
            });

            request.execute(function(resp) {
                if ($.isEmptyObject(resp.result)) {
                }
            });
            
            console.info(events[i].summary + ', ' + events[i].id + ', ' + events[i].calendar_id);
            var tr = document.getElementById(events[i].id);
            tr.parentNode.removeChild(tr);
            events[i] = null;
        }
    }
}

function postEvent() {
    if (eventPost === undefined) {
        getEventPost();
    }
    var calEvents = document.getElementById('calendar-events');
    calEvents.parentNode.removeChild(calEvents);
    document.getElementById('events-set').appendChild(eventPost);
    // Add datepicker to the date input fields.
    $('.create-event-date').datepicker({
        showWeek: true,
        firstDay: 1,
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd.mm.yy'
    }).datepicker('setDate', new Date());
    var now = new Date();
    $('.create-event-time').timepicker({
        timeFormat: 'HH:mm:ss',
        interval: 15,
        minTime: '00:00:00',
        maxTime: '23:59:59',
        defaultTime: now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds(),
        startTime: '00:00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true
    });
}

function getEventPost() {
    // 1. row : calendar
    var tdKalenderName = document.createElement('TD');
    tdKalenderName.innerHTML = 'Kalender';
    
    var selKalender = document.createElement('SELECT');
    selKalender.setAttribute('id', 'create-event-calendar')
    for (i = 0; i < calendars.length; ++i) {
        if (calendars[i].accessRole === 'owner' || calendars[i].accessRole === 'writer') {
            var opt = document.createElement('OPTION');
            opt.setAttribute('value', calendars[i].id);
            opt.innerHTML = calendars[i].id;
            selKalender.appendChild(opt);
        }
    }
    var tdKalenderValue = document.createElement('TD');
    tdKalenderValue.setAttribute('colspan', '2');
    tdKalenderValue.appendChild(selKalender);
    
    var trKalender = document.createElement('TR');
    trKalender.appendChild(tdKalenderName);
    trKalender.appendChild(tdKalenderValue);

    // 2. row : summary
    var tdSummaryName = document.createElement('TD');
    tdSummaryName.innerHTML = 'Titel';
    
    var ipSummary = document.createElement('INPUT');
    ipSummary.setAttribute('id', 'create-event-summary');
    ipSummary.setAttribute('type', 'text');
    ipSummary.setAttribute('size', '75');
    var tdSummaryValue = document.createElement('TD');
    tdSummaryValue.setAttribute('colspan', '2');
    tdSummaryValue.appendChild(ipSummary);
    
    var trSummary = document.createElement('TR');
    trSummary.appendChild(tdSummaryName);
    trSummary.appendChild(tdSummaryValue);

    // 3. row : location
    var tdLocationName = document.createElement('TD');
    tdLocationName.innerHTML = 'Ort';
    
    var ipLocation = document.createElement('INPUT');
    ipLocation.setAttribute('id', 'create-event-location');
    ipLocation.setAttribute('type', 'text');
    ipLocation.setAttribute('size', '75');
    var tdLocationValue = document.createElement('TD');
    tdLocationValue.setAttribute('colspan', '2');
    tdLocationValue.appendChild(ipLocation);
    
    var trLocation = document.createElement('TR');
    trLocation.appendChild(tdLocationName);
    trLocation.appendChild(tdLocationValue);

    // 4. row : description
    var tdDescriptionName = document.createElement('TD');
    tdDescriptionName.innerHTML = 'Beschreibung';
    
    var taDescription = document.createElement('TEXTAREA');
    taDescription.setAttribute('id', 'create-event-description');
    taDescription.setAttribute('rows', '4');
    taDescription.setAttribute('cols', '58');
    var tdDescriptionValue = document.createElement('TD');
    tdDescriptionValue.setAttribute('colspan', '2');
    tdDescriptionValue.appendChild(taDescription);
    
    var trDescription = document.createElement('TR');
    trDescription.appendChild(tdDescriptionName);
    trDescription.appendChild(tdDescriptionValue);

    // 5. row : start
    var tdStartName = document.createElement('TD');
    tdStartName.innerHTML = 'Start';
    
    var ipStart = document.createElement('INPUT');
    ipStart.setAttribute('id', 'create-event-start');
    ipStart.setAttribute('class', 'create-event-date');
    ipStart.setAttribute('type', 'text');
    var tdStartValue = document.createElement('TD');
    tdStartValue.appendChild(ipStart);
    
    var ipStartTime = document.createElement('INPUT');
    ipStartTime.setAttribute('id', 'create-event-start-time');
    ipStartTime.setAttribute('class', 'create-event-time');
    ipStartTime.setAttribute('type', 'text');
    var tdStartTimeValue = document.createElement('TD');
    tdStartTimeValue.appendChild(ipStartTime);
    
    var trStart = document.createElement('TR');
    trStart.appendChild(tdStartName);
    trStart.appendChild(tdStartValue);
    trStart.appendChild(tdStartTimeValue);

    // 6. row : end
    var tdEndName = document.createElement('TD');
    tdEndName.innerHTML = 'Ende';
    
    var ipEnd = document.createElement('INPUT');
    ipEnd.setAttribute('id', 'create-event-end');
    ipEnd.setAttribute('class', 'create-event-date');
    ipEnd.setAttribute('type', 'text');
    var tdEndValue = document.createElement('TD');
    tdEndValue.appendChild(ipEnd);
    
    var ipEndTime = document.createElement('INPUT');
    ipEndTime.setAttribute('id', 'create-event-end-time');
    ipEndTime.setAttribute('class', 'create-event-time');
    ipEndTime.setAttribute('type', 'text');
    var tdEndTimeValue = document.createElement('TD');
    tdEndTimeValue.appendChild(ipEndTime);

    var trEnd = document.createElement('TR');
    trEnd.appendChild(tdEndName);
    trEnd.appendChild(tdEndValue);
    trEnd.appendChild(tdEndTimeValue);

    // 7. row : post
    var postEvent = document.createElement('SPAN');
    postEvent.setAttribute('onclick','postEventOn()');
    postEvent.innerHTML = 'Event erstellen';

    var tdPost = document.createElement('TD');
    tdPost.setAttribute('colspan','3');
    tdPost.appendChild(postEvent);
    
    var trPost = document.createElement('TR');
    trPost.appendChild(tdPost);
    
    // Table
    eventPost = document.createElement('TABLE');
    eventPost.setAttribute('id', 'calendar-event-create');
    eventPost.appendChild(trKalender);
    eventPost.appendChild(trSummary);
    eventPost.appendChild(trLocation);
    eventPost.appendChild(trDescription);
    eventPost.appendChild(trStart);
    eventPost.appendChild(trEnd);
    eventPost.appendChild(trPost);
}

function postEventOn() {
    var i = 0;
    var tz;
    while(i < calendars.length && tz === undefined) {
        if (calendars[i].id === document.getElementById('create-event-calendar').value) {
            tz = calendars[i].timeZone;
        }
        ++i;
    }
    
    var start = document.getElementById('create-event-start').value;
    var startTime = document.getElementById('create-event-start-time').value;
    var startStr = start.substring(6,10) + '-' + start.substring(3,5) + '-' + start.substring(0,2) + 'T' + startTime; // + '-01:00:00'
    var end = document.getElementById('create-event-end').value;
    var endTime = document.getElementById('create-event-end-time').value;
    var endStr = end.substring(6,10) + '-' + end.substring(3,5) + '-' + end.substring(0,2) + 'T' + endTime;
    
    var event = {
        'summary': document.getElementById('create-event-summary').value,
        'location': document.getElementById('create-event-location').value,
        'description': document.getElementById('create-event-location').value,
        'start': {
          'dateTime': startStr,
          'timeZone': tz
        },
        'end': {
          'dateTime': endStr,
          'timeZone': tz
        }
    };
    
    var request = gapi.client.calendar.events.insert({
        'calendarId': document.getElementById('create-event-calendar').value,
        'resource': event
    });

    request.execute(function(event) {
        listEvents();
    });
}

