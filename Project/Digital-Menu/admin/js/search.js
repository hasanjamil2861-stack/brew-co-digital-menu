// Filter the table rows while typing in the search input
function setupSearch(input, table, message) {
  function applySearch() {
    const text = input.value.toLowerCase().trim();
    let visible = 0;

    table.querySelectorAll('tr').forEach(row => {
      // Search in all cells except the last one (the buttons)
      const cells = Array.from(row.cells).slice(0, -1);
      const rowText = cells.map(cell => cell.textContent).join(' ').toLowerCase();

      const match = rowText.includes(text);
      row.hidden = !match;
      if (match) visible++;
    });

    // Show "No results" when nothing matches
    message.hidden = visible > 0;
  }

  input.addEventListener('input', applySearch);
  return applySearch;
}