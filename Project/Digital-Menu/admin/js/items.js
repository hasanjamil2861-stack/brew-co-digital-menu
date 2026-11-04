// Page elements
const form = document.getElementById('itemForm');
const categorySelect = document.getElementById('categorySelect');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const table = document.getElementById('itemsTable');

// Search (from search.js)
const applySearch = setupSearch(
  document.getElementById('searchInput'),
  table,
  document.getElementById('noResults')
);

// Id of the item we are editing (null = adding)
let editId = null;

// Create a button with a text and a click action
function makeButton(text, action) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className = 'btn btn-small';
  btn.type = 'button';
  btn.addEventListener('click', action);
  return btn;
}

// Create a table cell with a text
function makeCell(text) {
  const cell = document.createElement('td');
  cell.textContent = text;
  return cell;
}

// Fill the category dropdown
async function loadCategories() {
  const categories = await fetch('/api/categories').then(res => res.json());

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category._id;
    option.textContent = category.name;
    categorySelect.append(option);
  });
}

// Load all items and show them in the table
async function loadItems() {
  const items = await fetch('/api/items').then(res => res.json());
  table.textContent = '';

  items.forEach(item => {
    const row = document.createElement('tr');

    // Image cell (only if the item has an image)
    const imageCell = document.createElement('td');
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      img.className = 'thumb';
      imageCell.append(img);
    }

    // Status as a colored label
    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = item.isActive ? 'badge badge-on' : 'badge badge-off';
    badge.textContent = item.isActive ? 'Active' : 'Inactive';
    statusCell.append(badge);

    // Action buttons
    const actionsCell = document.createElement('td');
    actionsCell.append(
      makeButton('Edit', () => startEdit(item)),
      makeButton(item.isActive ? 'Deactivate' : 'Activate', () => toggleItem(item._id)),
      makeButton('Delete', () => deleteItem(item._id))
    );

    row.append(
      imageCell,
      makeCell(item.name),
      makeCell(item.category ? item.category.name : '-'),
      makeCell('$' + item.price.toFixed(2)),
      statusCell,
      actionsCell
    );
    table.append(row);
  });

  // Keep the search filter after reloading the table
  applySearch();
}

// Add or edit when the form is submitted
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const url = editId ? `/api/items/${editId}` : '/api/items';
  const method = editId ? 'PUT' : 'POST';

  // FormData takes all the inputs (and the image) from the form
  await fetch(url, { method: method, body: new FormData(form) });

  resetForm();
  loadItems();
});

// Put the item data in the form to edit it
function startEdit(item) {
  editId = item._id;
  form.name.value = item.name;
  form.price.value = item.price;
  form.category.value = item.category ? item.category._id : '';
  form.description.value = item.description;
  submitBtn.textContent = 'Save Changes';
  cancelBtn.hidden = false;
  window.scrollTo(0, 0);
}

// Go back to "add" mode
function resetForm() {
  editId = null;
  form.reset();
  submitBtn.textContent = 'Add Item';
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener('click', resetForm);

// Activate / deactivate
async function toggleItem(id) {
  await fetch(`/api/items/${id}/toggle`, { method: 'PATCH' });
  loadItems();
}

// Delete after confirmation (popup from modal.js)
async function deleteItem(id) {
  const ok = await askDelete('Are you sure you want to delete this item?');
  if (!ok) return;

  await fetch(`/api/items/${id}`, { method: 'DELETE' });
  loadItems();
}

loadCategories();
loadItems();