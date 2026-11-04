// =========================================================
// PROTECTS THE ADMIN PAGES
// Put this script in the <head> of every admin page
// =========================================================

const token = localStorage.getItem('brewToken');

// Not logged in: go to the login page
if (!token) {
  window.location.replace('login.html');
}

// Log out (and go back to the login page)
function logout(expired) {
  localStorage.removeItem('brewToken');
  localStorage.removeItem('brewUser');
  window.location.replace('login.html' + (expired ? '?expired=1' : ''));
}

// ---------- Add the token to every request to the server ----------
// Like this, categories.js, items.js... work without any change

const originalFetch = window.fetch;

window.fetch = async function (url, options = {}) {
  options.headers = {
    ...options.headers,
    Authorization: 'Bearer ' + token,
  };

  const response = await originalFetch(url, options);

  // The server says the token is wrong or expired: log out
  if (response.status === 401) {
    logout(true);
  }

  return response;
};

// ---------- User name + Log out button in the navbar ----------

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar || !token) return;

  // The user saved at login
  let user = { username: 'admin' };
  try {
    user = JSON.parse(localStorage.getItem('brewUser')) || user;
  } catch (error) {
    // Keep "admin"
  }

  const box = document.createElement('div');
  box.className = 'user-box';

  // Circle with the first letter of the name
  const avatar = document.createElement('span');
  avatar.className = 'user-avatar';
  avatar.textContent = user.username.charAt(0).toUpperCase();

  // Name
  const name = document.createElement('span');
  name.className = 'user-name';
  name.textContent = user.username;

  // Log out button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'logout-btn';
  button.textContent = 'Log out';
  button.addEventListener('click', () => logout(false));

  box.append(avatar, name, button);
  navbar.append(box);
});