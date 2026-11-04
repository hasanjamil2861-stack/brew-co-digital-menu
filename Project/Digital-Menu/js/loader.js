// =========================================================
// BREW CO. LOADING SCREEN
// Shows for 5 seconds, only the first time in a visit
// (or on every refresh if the loader has data-always="true")
// =========================================================

(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const DURATION = 5000; // 5 seconds

  // Each part of the site remembers on its own (menu / admin)
  const KEY = loader.dataset.key || 'brewLoaderSeen';

  // data-always="true" = show it on every refresh (like the login page)
  const ALWAYS = loader.dataset.always === 'true';

  // Already seen in this visit?
  let seen = false;
  try {
    seen = sessionStorage.getItem(KEY) === 'yes';
  } catch (error) {
    seen = false;
  }

  // Seen before and not "always": remove it directly
  if (seen && !ALWAYS) {
    loader.remove();
    return;
  }

  // No scrolling while loading
  document.body.classList.add('is-loading');

  const fill = document.getElementById('loaderFill');
  const percent = document.getElementById('loaderPercent');
  const start = performance.now();

  // Move the bar and the number from 0% to 100%
  function update(now) {
    const progress = Math.min((now - start) / DURATION, 1);

    // Starts fast, slows down at the end (looks more real)
    const eased = 1 - Math.pow(1 - progress, 2);
    const value = Math.round(eased * 100);

    fill.style.width = value + '%';
    percent.textContent = value + '%';

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      finish();
    }
  }

  // Close the loader in a circle, then remove it
  function finish() {
    loader.classList.add('loader-done');
    document.body.classList.remove('is-loading');

    try {
      sessionStorage.setItem(KEY, 'yes');
    } catch (error) {
      // Private mode: the loader will just show again next time
    }

    // Tell the page the loader is done (the dashboard redraws its chart)
    window.dispatchEvent(new Event('loader:done'));

    setTimeout(() => loader.remove(), 1000);
  }

  requestAnimationFrame(update);
})();