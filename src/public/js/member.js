window.app.page("member", () => {
  // called on init

  return (member_id) => {
    // called every time the page is accessed
    api(`organisation/${User.getData().organisation.id}/members/${member_id}`).then(msg => {
      const member = msg.member;

      if (msg.status === "success") {
        $("#memberFullName").text(`${member.firstname} ${member.lastname}`);
      } else {
        alert(msg.message);
        log(msg);
      }
    });
  }
});