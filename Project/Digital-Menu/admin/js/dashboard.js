// =========================================================
// HELPERS
// =========================================================

// Put a text inside an element by its id
function setText(id, text) {
  document.getElementById(id).textContent = text;
}

// Show a price like "$3.50"
function formatPrice(price) {
  return '$' + price.toFixed(2);
}

// "1 item" / "2 items"
function plural(count, word) {
  return count + ' ' + word + (count === 1 ? '' : 's');
}

// Percentage (no division by zero)
function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

// Show a date like "Nov 4"
function shortDate(text) {
  return new Date(text + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Create an SVG element with its attributes
function svgElement(name, attributes) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
  return element;
}

// =========================================================
// LOAD THE DASHBOARD
// =========================================================

// Menu growth data (used by the chart)
let growth = [];
let chartDays = 30;

async function loadDashboard() {
  const stats = await fetch('/api/stats').then(res => res.json());

  showHero(stats);
  showStatCards(stats);
  showSummary(stats);
  showCategoryBars(stats.perCategory);
  showLatestItems(stats.latestItems);
  showInsights(stats);

  growth = stats.growth;
  drawChart();
}

// =========================================================
// HERO
// =========================================================

function showHero(stats) {
  setText('visibleText', stats.visibleItems + ' of ' + plural(stats.totalItems, 'item'));
  setText('visiblePercent', percent(stats.visibleItems, stats.totalItems) + '%');

  setText('todayDate', new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }));
}

// =========================================================
// KPI CARDS
// =========================================================

function showStatCards(stats) {
  setText('totalCategories', stats.totalCategories);
  setText('categoriesNote', stats.activeCategories + ' active');

  setText('totalItems', stats.totalItems);
  setText('itemsNote', 'in ' + stats.totalCategories + (stats.totalCategories === 1 ? ' category' : ' categories'));

  setText('activeItems', stats.activeItems);
  setText('activeNote', percent(stats.activeItems, stats.totalItems) + '% of all items');

  setText('inactiveItems', stats.inactiveItems);
}

// =========================================================
// SUMMARY CARDS
// =========================================================

function showSummary(stats) {
  // Main summary text
  const categoriesWord = stats.totalCategories === 1 ? 'category' : 'categories';
  const hiddenCategoriesWord = stats.inactiveCategories === 1 ? 'category' : 'categories';

  setText('summaryTitle', 'Your menu has ' + plural(stats.totalItems, 'item') + ' in ' + stats.totalCategories + ' ' + categoriesWord);
  setText('summaryText',
    plural(stats.visibleItems, 'item') + ' visible to your customers right now. ' +
    plural(stats.inactiveItems, 'item') + ' and ' + stats.inactiveCategories + ' ' + hiddenCategoriesWord + ' hidden.'
  );
  setText('averagePrice', formatPrice(stats.averagePrice));

  // Active circle (the colored part is the active percentage)
  const active = percent(stats.activeItems, stats.totalItems);
  setText('activePercent', active + '%');
  document.getElementById('activeCircle').style.background =
    'conic-gradient(#4a3427 0 ' + active + '%, #efe7dc ' + active + '% 100%)';

  setText('miniActive', stats.activeItems);
  setText('miniInactive', stats.inactiveItems);
  setText('miniTotal', stats.totalItems);

  // Prices
  setText('mostExpensivePrice', stats.mostExpensive ? formatPrice(stats.mostExpensive.price) : '-');
  setText('mostExpensiveName', stats.mostExpensive ? stats.mostExpensive.name : 'No items yet');
  setText('cheapestPrice', stats.cheapest ? formatPrice(stats.cheapest.price) : '-');
  setText('cheapestName', stats.cheapest ? stats.cheapest.name : 'No items yet');
}

// =========================================================
// ITEMS PER CATEGORY (bars)
// =========================================================

function showCategoryBars(categories) {
  const box = document.getElementById('categoryBars');
  box.textContent = '';
  setText('categoriesBadge', categories.length + (categories.length === 1 ? ' category' : ' categories'));

  if (categories.length === 0) {
    box.textContent = 'No categories yet';
    box.className = 'panel-empty';
    return;
  }

  // The biggest category gets a full bar
  const max = Math.max(...categories.map(category => category.count), 1);

  categories.forEach((category, index) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.title = category.name + ': ' + category.count + ' items';

    // Name + status
    const label = document.createElement('div');
    label.className = 'bar-label';

    const name = document.createElement('span');
    name.textContent = category.name;

    const status = document.createElement('small');
    status.textContent = category.isActive ? 'Active' : 'Inactive';

    label.append(name, status);

    // Grey track + colored fill
    const track = document.createElement('div');
    track.className = 'bar-track';

    const fill = document.createElement('div');
    fill.className = category.isActive ? 'bar-fill' : 'bar-fill bar-fill-off';
    fill.style.width = (category.count / max) * 100 + '%';
    fill.style.animationDelay = index * 0.08 + 's';
    track.append(fill);

    // Number of items
    const value = document.createElement('strong');
    value.className = 'bar-value';
    value.textContent = category.count;

    row.append(label, track, value);
    box.append(row);
  });
}

// =========================================================
// LATEST ITEMS
// =========================================================

function showLatestItems(items) {
  const list = document.getElementById('latestItems');
  list.textContent = '';

  if (items.length === 0) {
    list.textContent = 'No items yet';
    list.className = 'panel-empty';
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'latest-item';
    li.style.animationDelay = index * 0.06 + 's';

    // Image (or an empty box if there is no image)
    let image;
    if (item.image) {
      image = document.createElement('img');
      image.src = item.image;
      image.alt = item.name;
    } else {
      image = document.createElement('span');
    }
    image.className = 'latest-thumb';

    // Name + category
    const info = document.createElement('div');
    info.className = 'latest-info';

    const name = document.createElement('p');
    name.className = 'latest-name';
    name.textContent = item.name;

    const category = document.createElement('p');
    category.className = 'latest-category';
    category.textContent = item.category ? item.category.name : '-';

    info.append(name, category);

    // Price
    const price = document.createElement('span');
    price.className = 'latest-price';
    price.textContent = formatPrice(item.price);

    li.append(image, info, price);
    list.append(li);
  });
}

// =========================================================
// INSIGHTS
// =========================================================

function showInsights(stats) {
  setText('inactiveCategories', stats.inactiveCategories);
  setText('itemsWithoutImage', stats.itemsWithoutImage);
  setText('trashCount', stats.trashCount);
}

// =========================================================
// STOCK STYLE CHART (Menu Growth)
// =========================================================

function drawChart() {
  const box = document.getElementById('chartBox');
  const tooltip = document.getElementById('chartTooltip');

  // Remove the old chart (keep the tooltip)
  box.querySelectorAll('svg').forEach(svg => svg.remove());

  const data = growth.slice(-chartDays);
  if (data.length < 2) return;

  // ---------- Header: value + change ----------

  const first = data[0].total;
  const last = data[data.length - 1].total;
  const change = last - first;
  const changePercent = first ? ((change / first) * 100).toFixed(1) : (change > 0 ? '100.0' : '0.0');

  setText('chartValue', last);
  setText('chartPeriodText', 'last ' + chartDays + ' days');

  const changeBox = document.getElementById('chartChange');
  changeBox.textContent = (change >= 0 ? '▲ +' : '▼ ') + change + ' (' + changePercent + '%)';
  changeBox.className = change > 0 ? 'chart-change up' : 'chart-change flat';

  // ---------- Size ----------

  const width = box.clientWidth;
  const height = width < 500 ? 220 : 280;
  const pad = { top: 18, right: 14, bottom: 30, left: 38 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;

  // Y axis: 4 steps, a bit higher than the biggest value
  const step = Math.max(1, Math.ceil((Math.max(...data.map(d => d.total)) * 1.15) / 4));
  const top = step * 4;

  const x = index => pad.left + (index / (data.length - 1)) * innerWidth;
  const y = value => pad.top + innerHeight - (value / top) * innerHeight;

  const svg = svgElement('svg', { width: width, height: height, class: 'chart-svg' });

  // ---------- Gradient under the line ----------

  const defs = svgElement('defs', {});
  const gradient = svgElement('linearGradient', { id: 'growthFill', x1: 0, y1: 0, x2: 0, y2: 1 });
  gradient.append(
    svgElement('stop', { offset: '0%', 'stop-color': '#b8936a', 'stop-opacity': 0.35 }),
    svgElement('stop', { offset: '100%', 'stop-color': '#b8936a', 'stop-opacity': 0 })
  );
  defs.append(gradient);
  svg.append(defs);

  // ---------- Grid lines + Y labels ----------

  for (let i = 0; i <= 4; i++) {
    const value = step * i;
    svg.append(svgElement('line', {
      x1: pad.left, x2: width - pad.right,
      y1: y(value), y2: y(value),
      class: 'chart-grid',
    }));

    const label = svgElement('text', { x: pad.left - 10, y: y(value) + 4, class: 'chart-label', 'text-anchor': 'end' });
    label.textContent = value;
    svg.append(label);
  }

  // ---------- X labels (5 dates) ----------

  const labelCount = width < 500 ? 3 : 5;
  for (let i = 0; i < labelCount; i++) {
    const index = Math.round((i / (labelCount - 1)) * (data.length - 1));
    const anchor = i === 0 ? 'start' : i === labelCount - 1 ? 'end' : 'middle';
    const label = svgElement('text', { x: x(index), y: height - 8, class: 'chart-label', 'text-anchor': anchor });
    label.textContent = shortDate(data[index].date);
    svg.append(label);
  }

  // ---------- Area + line ----------

  const points = data.map((d, i) => x(i) + ',' + y(d.total));

  svg.append(svgElement('path', {
    d: 'M' + points.join(' L') + ' L' + x(data.length - 1) + ',' + y(0) + ' L' + x(0) + ',' + y(0) + ' Z',
    fill: 'url(#growthFill)',
    class: 'chart-area',
  }));

  const line = svgElement('path', { d: 'M' + points.join(' L'), class: 'chart-line' });
  svg.append(line);

  // ---------- Last point (pulsing dot) ----------

  svg.append(svgElement('circle', { cx: x(data.length - 1), cy: y(last), r: 9, class: 'chart-pulse' }));
  svg.append(svgElement('circle', { cx: x(data.length - 1), cy: y(last), r: 4, class: 'chart-dot' }));

  // ---------- Crosshair (shows on hover) ----------

  const crosshair = svgElement('g', { class: 'chart-crosshair', visibility: 'hidden' });
  const crossLine = svgElement('line', { y1: pad.top, y2: pad.top + innerHeight, class: 'chart-cross-line' });
  const crossDot = svgElement('circle', { r: 5, class: 'chart-cross-dot' });
  crosshair.append(crossLine, crossDot);
  svg.append(crosshair);

  // Invisible area that listens to the mouse / finger
  const hitArea = svgElement('rect', {
    x: pad.left, y: pad.top,
    width: innerWidth, height: innerHeight,
    fill: 'transparent',
  });
  svg.append(hitArea);

  hitArea.addEventListener('pointermove', event => {
    const boxLeft = svg.getBoundingClientRect().left;
    const ratio = (event.clientX - boxLeft - pad.left) / innerWidth;
    const index = Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1))));
    const point = data[index];

    // Move the crosshair
    crossLine.setAttribute('x1', x(index));
    crossLine.setAttribute('x2', x(index));
    crossDot.setAttribute('cx', x(index));
    crossDot.setAttribute('cy', y(point.total));
    crosshair.setAttribute('visibility', 'visible');

    // Move the tooltip (stays inside the box)
    setText('tooltipDate', shortDate(point.date));
    setText('tooltipValue', point.total + ' items');
    tooltip.hidden = false;

    const left = Math.min(width - tooltip.offsetWidth - 4, Math.max(4, x(index) - tooltip.offsetWidth / 2));
    tooltip.style.left = left + 'px';
    tooltip.style.top = Math.max(0, y(point.total) - tooltip.offsetHeight - 14) + 'px';
  });

  hitArea.addEventListener('pointerleave', () => {
    crosshair.setAttribute('visibility', 'hidden');
    tooltip.hidden = true;
  });

  box.prepend(svg);

  // Draw the line from left to right
  const length = line.getTotalLength();
  line.style.strokeDasharray = length;
  line.style.strokeDashoffset = length;
  line.getBoundingClientRect();
  line.style.strokeDashoffset = 0;
}

// Period buttons (7D / 30D / 90D)
document.getElementById('chartPeriods').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  document.querySelectorAll('#chartPeriods button').forEach(b => b.classList.remove('active'));
  button.classList.add('active');

  chartDays = Number(button.dataset.days);
  drawChart();
});

// Draw the chart again when the loading screen is done (so you see the line animation)
window.addEventListener('loader:done', drawChart);

// Redraw the chart when the screen size changes
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawChart, 150);
});

loadDashboard();