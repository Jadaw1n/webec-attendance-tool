const memberEntry = ({id, firstname, lastname}) => {
  return `
<tr>
  <td>${id}</td>
  <td><a href="#member:${id}">${firstname}</a></td>
  <td>${lastname}</td>
  <td class="right"><a href="#" class="deleteMember" data-id="${id}">entfernen</a></td>
</tr>
`;
};

const updateMemberTable = () => {
  api(`organisation/${User.getData().organisation.id}/members`).then(members => {
    $("#memberList").html(Object.values(members).filter(r => r.shown == 1).map(memberEntry));
  });
};

window.app.page("members", () => {
  // called on init

  $("#memberAddForm").submit(event => {
    event.preventDefault();

    const data = getFormData("memberAddForm");

    api(`organisation/${User.getData().organisation.id}/members`, data).then(msg => {
      if (msg.status === "success") {
        $("#memberAddForm")[0].reset();
        updateMemberTable();
      } else {
        // show errors
        $("#memberAddForm errors").text(msg.message);
      }
    });

    return false;
  });

  $("#memberList").on("click", "a.deleteMember", (event) => {
    event.preventDefault();

    const memberId = event.target.dataset.id;

    api(`organisation/${User.getData().organisation.id}/members/${memberId}`, null, "delete").then(msg => {
      updateMemberTable();
    });
  });

  return () => {
    // called every time the page is accessed
    updateMemberTable();
  }
});