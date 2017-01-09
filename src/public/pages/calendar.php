<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>calendarJS</title>
        <script
            src="https://code.jquery.com/jquery-2.1.4.min.js"
            integrity="sha256-8WqyJLuWKRBVhxXIL1jBDD7SDxU936oZkCnxQbWwJVw="
            crossorigin="anonymous"></script>
        <script type='text/javascript' src="js/calendar.js"></script>
        <script type='text/javascript' src="https://apis.google.com/js/client.js?onload=checkAuth"></script>
        <link type="text/css" rel="stylesheet" href="lib/jquery-ui-1.12.1/jquery-ui.min.css"/>
        <script src="lib/jquery-ui-1.12.1/jquery-ui.js"></script>
        <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/timepicker/1.3.5/jquery.timepicker.min.css">
        <script src="//cdnjs.cloudflare.com/ajax/libs/timepicker/1.3.5/jquery.timepicker.min.js"></script>
    </head>
    <body>
        <main>
            <section id='properties'>
                <fieldset>
                    <legend>Kalender Einstellungen</legend>
                    <label for='calendar-from'>Von</label>
                    <input type='text' id='calendar-from'>
                    <label for='calendar-to'>Bis</label>
                    <input type='text' id='calendar-to'>
                    <label for='calendar-to'>Max. Anzahl Events</label>
                    <input type='number' min='0' max='2500' value='250' id='calendar-max' name='maxResults'>
                </fieldset>
            </section>
            <section id='calendars'></section>
            <nav id='actions'>
                <fieldset id='calendar-actions'>
                    <legend>Kalender Aktionen</legend>
                    <!--<span onclick="changeCalendar()">Kalender wechseln</span> | -->
                    <span onclick='listCalendars()'>Kalender laden</span> | 
                    <span onclick='listEvents()'>Events laden</span>
                </fieldset>
            </nav>
            <section id='events'></section>
        </main>
    </body>
</html>
