window.app.page("event", () => {
  // called on init

  return (eventid) => {
    // called every time the page is accessed
    api(`organisation/${User.getData().organisation.id}/events/${eventid}`).then(event => {
      log(event);
    });
  }
});