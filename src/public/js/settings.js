const reasonEntry = ({id, text}) => {
  return `
<tr>
  <td>${id}</td>
  <td>${text}</td>
  <td class="right"><a class="deleteReason" href="#" data-id="${id}">entfernen</a></td>
</tr>
`;
};

const updateReasonTable = () => {
  api(`organisation/${User.getData().organisation.id}/reasons`).then(reasons => {
    $("#reasonList").html(Object.values(reasons).filter(r => r.shown == 1).map(reasonEntry));
  });
};

window.app.page("settings", () => {
  // called on init

  $("#reasonAddForm").submit(event => {
    event.preventDefault();

    const data = getFormData("reasonAddForm");

    api(`organisation/${User.getData().organisation.id}/reasons`, data).then(msg => {
      if (msg.status === "success") {
        $("#reasonAddForm")[0].reset();
        updateReasonTable();
      } else {
        // show errors
        $("#reasonAddForm errors").text(msg.message);
      }
    });

    return false;
  });

  $("#reasonList").on("click", "a.deleteReason", (event) => {
    event.preventDefault();

    const reasonId = event.target.dataset.id;

    api(`organisation/${User.getData().organisation.id}/reasons/${reasonId}`, null, "delete").then(msg => {
      updateReasonTable();
    });
  });

  return () => {
    // called every time the page is accessed
    updateReasonTable();
  }
});