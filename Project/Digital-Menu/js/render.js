// Create one menu item card (same classes as the old HTML)
function createItemCard(item) {
  const card = document.createElement('article');
  card.className = 'menu-item';

  // Image
  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.loading = 'lazy';
    card.append(img);
  }

  // Name and description
  const info = document.createElement('div');
  info.className = 'item-description';

  const name = document.createElement('h4');
  name.textContent = item.name;

  const description = document.createElement('p');
  description.textContent = item.description;

  info.append(name, description);

  // Price
  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = '$' + item.price.toFixed(2);

  card.append(info, price);
  return card;
}