var codeEditor = document.getElementById('code-editor'),
    saveButton = document.getElementById('save-button'),
    downloadButton = document.getElementById('download-code-button'),
    copyButton = document.getElementById('copy-code-button'),
    language = document.getElementsByClassName('project-language')[0];

var currentCode = codeEditor.value;

// Checks if you made changes in code
codeEditor.addEventListener('input', () => {
  if (currentCode === codeEditor.value) {
    saveButton.disabled = true;
  } else {
    saveButton.disabled = false;
  }
});

// Save code to DB
if (saveButton) {
  saveButton.addEventListener('click', (e) => {
    e.preventDefault();
    currentCode = codeEditor.value;
    saveButton.disabled = true;
    document.getElementById('code-form').submit();
  });
}

// Download file
downloadButton.addEventListener('click', (e) => {
  e.preventDefault();
  var blob = new Blob([currentCode], {type: `text/${language.innerText.toLowerCase()};charset=utf-8`});
  saveAs(blob, `sharecode.${language.innerText.toLowerCase()}`);
});

// Copy code in text editor
copyButton.addEventListener('click', () => {
  codeEditor.disabled = false;
  codeEditor.select();
  document.execCommand('Copy');
  codeEditor.disabled = true;
  clearSelection();
  alert('Copied text');
});

// Clears the selection on the page when its selected to be copied
function clearSelection() {
 if (window.getSelection) {
   window.getSelection().removeAllRanges();
 } else if (document.selection) {
   document.selection.empty();
 }
}
