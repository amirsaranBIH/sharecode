var codeEditor = document.getElementById('code-editor');
var saveButton = document.getElementById('save-button');

var currentCode = codeEditor.value;

codeEditor.addEventListener('input', () => {
  if (currentCode === codeEditor.value) {
    saveButton.disabled = true;
  } else {
    saveButton.disabled = false;
  }
});

saveButton.addEventListener('click', () => {
  currentCode = codeEditor.value;
  saveButton.disabled = true;
});
