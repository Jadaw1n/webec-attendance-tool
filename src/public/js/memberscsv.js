var file;

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
  console.info('API support');
} else {
  alert('The File APIs are not fully supported in this browser.');
}

function handleFileSelect(evt) {
  // FileList object
  file = evt.target.files[0];

  // List some properties.
  var output = [];
  output.push("<span id='member-csv-file-name'>", escape(file.name), '</span>');

  if(file.size !== null) {
    output.push(' - ', file.size, ' Bytes');
  }
  if(file.lastModifiedDate) {
    output.push(' - zuletzt verändert: ', file.lastModifiedDate.toLocaleDateString());
  }
  document.getElementById('list').innerHTML = output.join('');
}

document.getElementById('member-csv-file').addEventListener('change', handleFileSelect, false);

