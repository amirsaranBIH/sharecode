// Exits from the flash message on clicking the 'X'
if (document.getElementById('exit-flash-box')) {
  var exitFlashBoxButton = document.getElementById('exit-flash-box');

  exitFlashBoxButton.addEventListener('click', () => {
    exitFlashBoxButton.parentNode.style.display = 'none';
  });
}

$('#navicon').click(() => {
  if (document.getElementById('navicon').style.top !== '142px') {
    document.getElementById('navicon').style.top = '142px';
    document.getElementsByClassName('navicon-lines')[0].style.transform = 'rotateZ(-45deg)';
  } else {
    document.getElementById('navicon').style.top = '-30px';
    document.getElementsByClassName('navicon-lines')[0].style.transform = 'rotateZ(-45deg) translateY(15px)';
  }
  $('.header-navigation ul').slideToggle(600);
});
