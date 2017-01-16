window.app.page("member", () => {
  // called on init

  return (member_id) => {
    // called every time the page is accessed
    Promise
      .all([
        api(`organisation/${User.getData().organisation.id}/members/${member_id}`),
        api(`organisation/${User.getData().organisation.id}/reasons`)
      ])
      .then(([msg, reasons]) => {
        const member = msg.member;

        if (msg.status === "success") {
          $("#memberFullName").text(`${member.firstname} ${member.lastname}`);

          chartAttendanceByReason(member.ownAttendance, reasons, 'chart-member-reasons');

        } else {
          alert(msg.message);
          log(msg);
        }
      });
  }
});
