// Page elements
const categoriesTable = document.getElementById('trashCategories');
const itemsTable = document.getElementById('trashItems');
const categoriesCount = document.getElementById('categoriesCount');
const itemsCount = document.getElementById('itemsCount');
const categoriesEmpty = document.getElementById('categoriesEmpty');
const itemsEmpty = document.getElementById('itemsEmpty');
const emptyTrashBtn = document.getElementById('emptyTrashBtn');

// Create a button with a text, an extra class and a click action
function makeButton(text, extraClass, action) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className = 'btn btn-small ' + extraClass;
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

// Show a date like "4 Nov 2026"
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Show the count, and the "empty" message if there is nothing
function updateSection(table, count, emptyMessage, length) {
  count.textContent = length;
  emptyMessage.hidden = length > 0;
  table.closest('.table-box').hidden = length === 0;
}

// Load the trash and show both tables
async function loadTrash() {
  const trash = await fetch('/api/trash').then(res => res.json());

  showCategories(trash.categories);
  showItems(trash.items);

  // Nothing to empty
  emptyTrashBtn.disabled = trash.categories.length + trash.items.length === 0;
}

// Deleted categories table
function showCategories(categories) {
  categoriesTable.textContent = '';
  updateSection(categoriesTable, categoriesCount, categoriesEmpty, categories.length);

  categories.forEach((category, index) => {
    const row = document.createElement('tr');
    row.style.animationDelay = index * 0.05 + 's';

    // Action buttons
    const actionsCell = document.createElement('td');
    actionsCell.append(
      makeButton('Restore', 'btn-restore', () => restore('categories', category._id, row)),
      makeButton('Delete forever', '', () => deleteForever('categories', category._id, row))
    );

    row.append(
      makeCell(category.name),
      makeCell(formatDate(category.deletedAt)),
      actionsCell
    );
    categoriesTable.append(row);
  });
}

// Deleted items table
function showItems(items) {
  itemsTable.textContent = '';
  updateSection(itemsTable, itemsCount, itemsEmpty, items.length);

  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.style.animationDelay = index * 0.05 + 's';

    // Image cell (only if the item has an image)
    const imageCell = document.createElement('td');
    if (item.image) {
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      img.className = 'thumb';
      imageCell.append(img);
    }

    // Action buttons
    const actionsCell = document.createElement('td');
    actionsCell.append(
      makeButton('Restore', 'btn-restore', () => restore('items', item._id, row)),
      makeButton('Delete forever', '', () => deleteForever('items', item._id, row))
    );

    row.append(
      imageCell,
      makeCell(item.name),
      makeCell(item.category ? item.category.name : '-'),
      makeCell('$' + item.price.toFixed(2)),
      makeCell(formatDate(item.deletedAt)),
      actionsCell
    );
    itemsTable.append(row);
  });
}

// Play the "leaving" animation, then continue
function removeRow(row) {
  row.classList.add('row-leaving');
  return new Promise(resolve => setTimeout(resolve, 300));
}

// Restore a category or an item
async function restore(type, id, row) {
  await fetch(`/api/trash/${type}/${id}/restore`, { method: 'PATCH' });
  await removeRow(row);
  loadTrash();
}

// Delete forever after confirmation (popup from modal.js)
async function deleteForever(type, id, row) {
  const text = type === 'categories'
    ? 'This category and all its items will be deleted forever. This cannot be undone.'
    : 'This item will be deleted forever. This cannot be undone.';

  const ok = await askDelete(text);
  if (!ok) return;

  await fetch(`/api/trash/${type}/${id}`, { method: 'DELETE' });
  await removeRow(row);
  loadTrash();
}

// Empty the whole trash
emptyTrashBtn.addEventListener('click', async () => {
  const ok = await askDelete('Everything in the trash will be deleted forever. This cannot be undone.');
  if (!ok) return;

  await fetch('/api/trash', { method: 'DELETE' });
  loadTrash();
});

loadTrash();