// Page elements
const form = document.getElementById('categoryForm');
const nameInput = document.getElementById('categoryName');
const table = document.getElementById('categoriesTable');

// Search (from search.js)
const applySearch = setupSearch(
  document.getElementById('searchInput'),
  table,
  document.getElementById('noResults')
);

// Create a button with a text and a click action
function makeButton(text, action) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className = 'btn btn-small';
  btn.addEventListener('click', action);
  return btn;
}

// Load all categories and show them in the table
async function loadCategories() {
  const categories = await fetch('/api/categories').then(res => res.json());
  table.textContent = '';

  categories.forEach(category => {
    const row = document.createElement('tr');

    // Name and slug cells
    const nameCell = document.createElement('td');
    nameCell.textContent = category.name;

    const slugCell = document.createElement('td');
    slugCell.textContent = category.slug;

    // Status as a colored label
    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = category.isActive ? 'badge badge-on' : 'badge badge-off';
    badge.textContent = category.isActive ? 'Active' : 'Inactive';
    statusCell.append(badge);

    // Action buttons
    const actionsCell = document.createElement('td');
    actionsCell.append(
      makeButton('Edit', () => editCategory(category)),
      makeButton(category.isActive ? 'Deactivate' : 'Activate', () => toggleCategory(category._id)),
      makeButton('Delete', () => deleteCategory(category._id))
    );

    row.append(nameCell, slugCell, statusCell, actionsCell);
    table.append(row);
  });

  // Keep the search filter after reloading the table
  applySearch();
}

// Add a new category
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nameInput.value }),
  });

  form.reset();
  loadCategories();
});

// Edit the name
async function editCategory(category) {
  const newName = prompt('New name:', category.name);
  if (!newName) return;

  await fetch(`/api/categories/${category._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName }),
  });

  loadCategories();
}

// Activate / deactivate
async function toggleCategory(id) {
  await fetch(`/api/categories/${id}/toggle`, { method: 'PATCH' });
  loadCategories();
}

// Delete after confirmation (popup from modal.js)
async function deleteCategory(id) {
  const ok = await askDelete('Are you sure you want to delete this category? All its items will be deleted too.');
  if (!ok) return;

  await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  loadCategories();
}

loadCategories();