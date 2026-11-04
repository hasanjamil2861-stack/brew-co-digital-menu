// =========================================================
// SHARED CODE FOR THE LOGIN AND REGISTER PAGES
// =========================================================

// Already logged in? Go straight to the dashboard
if (localStorage.getItem('brewToken')) {
  window.location.replace('index.html');
}

// Page elements used by both pages
const messageBox = document.getElementById('authMessage');
const submitBtn = document.getElementById('submitBtn');

// Show a message above the form ("error" = red, "info" = brown)
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = 'auth-message ' + type;
  messageBox.hidden = false;

  // Shake the card when there is an error
  if (type === 'error') {
    const card = document.querySelector('.auth-card');
    card.classList.remove('shake');
    void card.offsetWidth; // restart the animation
    card.classList.add('shake');
  }
}

// Hide the message
function hideMessage() {
  messageBox.hidden = true;
}

// Button states: "loading" (spinner) and "success" (green)
function setButton(state) {
  submitBtn.classList.remove('loading', 'success');
  submitBtn.disabled = state === 'loading' || state === 'success';

  if (state) {
    submitBtn.classList.add(state);
  }
}

// Save the token and the user, then open the dashboard
function saveLogin(data) {
  localStorage.setItem('brewToken', data.token);
  localStorage.setItem('brewUser', JSON.stringify(data.user));

  setButton('success');
  setTimeout(() => window.location.replace('index.html'), 700);
}

// Show / hide password buttons (the eye icon)
document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    const show = input.type === 'password';

    input.type = show ? 'text' : 'password';
    button.classList.toggle('visible', show);
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
});