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