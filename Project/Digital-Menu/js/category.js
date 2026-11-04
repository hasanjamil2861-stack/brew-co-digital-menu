// Show all items of one category (slug comes from the URL)
async function loadCategory() {
  const slug = new URLSearchParams(window.location.search).get('slug');

  const menu = await fetch('/api/menu').then(res => res.json());
  const category = menu.find(cat => cat.slug === slug);

  const title = document.getElementById('categoryTitle');
  const itemsBox = document.getElementById('categoryItems');

  // Category not found or deactivated
  if (!category) {
    title.textContent = 'Category not found';
    return;
  }

  title.textContent = category.name.toUpperCase();
  document.title = 'BREW CO. | ' + category.name;

  category.items.forEach(item => {
    itemsBox.append(createItemCard(item));
  });
}

loadCategory();