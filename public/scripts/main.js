if (document.getElementById('exit-flash-box')) {
  var exitFlashBoxButton = document.getElementById('exit-flash-box');

  exitFlashBoxButton.addEventListener('click', () => {
    exitFlashBoxButton.parentNode.style.display = 'none';
  });
}
