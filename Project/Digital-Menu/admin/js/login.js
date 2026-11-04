// =========================================================
// LOGIN PAGE
// =========================================================

const loginForm = document.getElementById('loginForm');

// Came here because the session expired? Tell the user
if (new URLSearchParams(window.location.search).get('expired')) {
  showMessage('Your session has expired. Please log in again.', 'info');
}

// Send the login to the server
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();

  const login = loginForm.login.value.trim();
  const password = loginForm.password.value;

  // Check the fields before sending
  if (!login || !password) {
    showMessage('Please fill in your username or email and your password.', 'error');
    return;
  }

  setButton('loading');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: login, password: password }),
    });

    const data = await response.json();

    // Wrong login: show the message from the server
    if (!response.ok) {
      showMessage(data.message, 'error');
      setButton('');
      return;
    }

    saveLogin(data);
  } catch (error) {
    showMessage('Cannot connect to the server. Is it running?', 'error');
    setButton('');
  }
});