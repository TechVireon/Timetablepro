const menuToggle = document.getElementById('menuToggle');
const topNav = document.getElementById('topNav');
const menuToggleSignup = document.getElementById('menuToggleSignup');
const topNavSignup = document.getElementById('topNavSignup');
const menuToggleLogin = document.getElementById('menuToggleLogin');
const topNavLogin = document.getElementById('topNavLogin');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

if (menuToggle && topNav) {
  menuToggle.addEventListener('click', () => topNav.classList.toggle('open'));
}

if (menuToggleSignup && topNavSignup) {
  menuToggleSignup.addEventListener('click', () => topNavSignup.classList.toggle('open'));
}

if (menuToggleLogin && topNavLogin) {
  menuToggleLogin.addEventListener('click', () => topNavLogin.classList.toggle('open'));
}

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}
