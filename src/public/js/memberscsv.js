let csvImportData = [];

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

function handleFileSelect(evt) {
  const file = evt.target.files[0];
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      csvImportData = results.data.filter(line => line.firstname !== undefined && line.lastname !== undefined).map(line => ({ firstname: line.firstname, lastname: line.lastname }));
      $("#memberCSVPreview").html(csvImportData.map(line => `<tr><td>${line.firstname}</td><td>${line.lastname}</td></tr>`));
    },
    error: (error) => {
      alert(error);
      log(error);
    }
  });

  // List some properties.
  var output = [];
  output.push("<span id='member-csv-file-name'>", escape(file.name), '</span>');

  if (file.size !== null) {
    output.push(' - ', file.size, ' Bytes');
  }
  if (file.lastModifiedDate) {
    output.push(' - zuletzt verändert: ', file.lastModifiedDate.toLocaleDateString());
  }
  document.getElementById('csvInfos').innerHTML = output.join('');
}

window.app.page("memberscsv", () => {
  document.getElementById('member-csv-file').addEventListener('change', handleFileSelect, false);

  $("#memberImportButton").on("click", (event) => {
    event.preventDefault();
    $("#memberImportButton").text("Import gestartet...").prop('disabled', true);

    api(`organisation/${User.getData().organisation.id}/members/import`, csvImportData).then(msg => {
      $("#memberCSVPreview").html("");
      if (msg.status === "success") {
        window.location.hash = "members";
      } else {
        // show errors
        $("#select-file errors").text(msg.message);
      }
    });
  });
  return () => {

  }
});
