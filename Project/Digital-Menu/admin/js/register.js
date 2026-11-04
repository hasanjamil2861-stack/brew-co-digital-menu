// =========================================================
// REGISTER PAGE
// =========================================================

const registerForm = document.getElementById('registerForm');
const strengthBox = document.getElementById('strength');
const strengthText = document.getElementById('strengthText');

// Simple email check: something@something.something
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Password strength (0 to 4) ----------

function passwordScore(password) {
  let score = 0;

  if (password.length >= 8) score++;                              // long enough
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;  // small + capital letters
  if (/[0-9]/.test(password)) score++;                            // a number
  if (/[^A-Za-z0-9]/.test(password)) score++;                     // a symbol like ! @ #

  return score;
}

// Update the 4 bars while typing
registerForm.password.addEventListener('input', () => {
  const password = registerForm.password.value;
  const score = passwordScore(password);
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

  // "level-0" to "level-4" changes the colors in the CSS
  strengthBox.className = 'strength level-' + (password ? score : 'none');

  strengthText.textContent = password
    ? 'Password strength: ' + labels[score]
    : 'Use 8+ characters with letters, numbers and symbols';
});

// ---------- Send the new account to the server ----------

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();

  const username = registerForm.username.value.trim();
  const email = registerForm.email.value.trim();
  const password = registerForm.password.value;
  const confirm = registerForm.confirm.value;

  // Check everything before sending
  if (username.length < 3) {
    showMessage('Username must have at least 3 characters.', 'error');
    return;
  }
  if (!emailPattern.test(email)) {
    showMessage('Please enter a valid email.', 'error');
    return;
  }
  if (password.length < 8) {
    showMessage('Password must have at least 8 characters.', 'error');
    return;
  }
  if (password !== confirm) {
    showMessage('The two passwords are not the same.', 'error');
    return;
  }

  setButton('loading');

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, email: email, password: password }),
    });

    const data = await response.json();

    // Username or email already used, registration closed...
    if (!response.ok) {
      showMessage(data.message, 'error');
      setButton('');
      return;
    }

    // Account created: logged in directly
    saveLogin(data);
  } catch (error) {
    showMessage('Cannot connect to the server. Is it running?', 'error');
    setButton('');
  }
});