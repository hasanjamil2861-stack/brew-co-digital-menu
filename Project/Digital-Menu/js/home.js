// Show each category with its first 3 items on the home page
async function loadMenu() {
  const menu = await fetch('/api/menu').then(res => res.json());
  const container = document.getElementById('menu');

  menu.forEach(category => {
    // Skip categories with no items
    if (category.items.length === 0) return;

    const section = document.createElement('section');
    section.className = 'category';
    section.id = category.slug;

    // Heading: category name + "View all" link
    const heading = document.createElement('div');
    heading.className = 'category-heading';

    const label = document.createElement('div');
    label.className = 'category-label';

    const title = document.createElement('h2');
    title.textContent = category.name.toUpperCase();
    label.append(title);

    const viewAll = document.createElement('a');
    viewAll.className = 'view-all';
    viewAll.href = 'category.html?slug=' + category.slug;
    viewAll.textContent = 'View all ›';

    // Always show "View all"
    heading.append(label, viewAll);

    // First 3 items
    const itemsBox = document.createElement('div');
    itemsBox.className = 'items';

    category.items.slice(0, 3).forEach(item => {
      itemsBox.append(createItemCard(item));
    });

    section.append(heading, itemsBox);
    container.append(section);
  });
}

loadMenu();