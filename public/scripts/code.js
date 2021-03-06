var codeEditor = document.getElementById('code-editor'),
    saveButton = document.getElementById('save-button'),
    downloadButton = document.getElementById('download-code-button'),
    copyButton = document.getElementById('copy-code-button'),
    language = document.getElementsByClassName('project-language')[0],
    projectName = document.querySelector('.project-header h1').innerText;

var currentCode = codeEditor.value;

// Socket connection and logic
if (io) {
  var socket = io.connect(window.location.origin);
}

socket.on('code', data => {
  codeEditor.value = data;
  checkCodeChange();
});

// Checks if you made changes in code
codeEditor.addEventListener('input', () => {
  checkCodeChange();
  // Emits the code to all contributors live
  socket.emit('code', codeEditor.value);
});

// Save code to DB
if (saveButton) {
  saveButton.addEventListener('click', e => {
    e.preventDefault();
    currentCode = codeEditor.value;
    saveButton.disabled = true;
    document.getElementById('code-form').submit();
  });
}

// Download file
downloadButton.addEventListener('click', () => {
  var willDownload = confirm('Are you sure you want to download this code? Press "OK" to download or press "Cancel" to cancel the download.');

  if (willDownload) {
    var blob = new Blob([currentCode], {type: `text/${language.innerText.toLowerCase()};charset=utf-8`});
    var extension = language.innerText.toLowerCase();
    var fileName = projectName.replace(/ /g, '-').toLowerCase().trim();
    saveAs(blob, `${fileName}.${extension}`);
  }
});

// Copy code in text editor
copyButton.addEventListener('click', () => {
  var isDisabled = codeEditor.disabled;
  codeEditor.disabled = false;
  codeEditor.select();
  document.execCommand('Copy');
  codeEditor.disabled = isDisabled;
  clearSelection();
  alert('Copied code.');
});

// Clears the selection on the page when its selected to be copied
function clearSelection() {
 if (window.getSelection) {
   window.getSelection().removeAllRanges();
 } else if (document.selection) {
   document.selection.empty();
 }
}

// Checks if the code is changed since last save
function checkCodeChange() {
  if (currentCode === codeEditor.value) {
    saveButton.disabled = true;
  } else {
    saveButton.disabled = false;
  }
}
