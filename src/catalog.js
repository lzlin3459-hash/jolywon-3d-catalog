import { products, featuredIds, categories, detailUrl } from './catalog-data.js';

function card(product, featured = false) {
  const link = document.createElement('a');
  link.href = detailUrl(product.id);
  link.className = featured ? 'featured-card' : 'catalog-card';
  link.dataset.productId = product.id;
  const image = document.createElement('img');
  image.src = product.model ? `./outputs/catalog-${product.id}.png` : `./${product.poster}`;
  image.alt = `${product.name}${product.model ? '三维外观' : '包装海报'}`;
  image.loading = featured ? 'eager' : 'lazy';
  if (featured) link.append(image);
  else { const figure = document.createElement('figure'); figure.append(image); link.append(figure); }
  if (product.model) { const badge = document.createElement('span'); badge.className = 'model-badge'; badge.textContent = '3D EXPLORER'; (featured ? link : link.firstChild).append(badge); }
  const copy = document.createElement('div');
  copy.className = 'card-copy';
  const category = document.createElement('span'); category.className = 'card-category'; category.textContent = `${product.id} / ${product.category}`;
  const title = document.createElement('h3'); title.textContent = product.name;
  const bottom = document.createElement('div'); bottom.className = 'card-bottom';
  const action = document.createElement('span'); action.textContent = product.model ? '旋转看外观' : '查看包装资料';
  const arrow = document.createElement('span'); arrow.textContent = featured ? `${product.weight} ↗` : '↗';
  bottom.append(action, arrow); copy.append(category, title, bottom); link.append(copy);
  return link;
}
document.querySelector('#featured-grid').append(...featuredIds.map(id => card(products.find(product => product.id === id), true)));
function filter(category) {
  const visible = products.filter(product => category === '全部产品' || product.category === category);
  document.querySelector('#catalog-grid').replaceChildren(...visible.map(product => card(product)));
  document.querySelector('#catalog-count').textContent = `${visible.length} 个资料条目`;
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  return visible.map(product => product.id);
}
for (const category of categories) {
  const button = document.createElement('button'); button.type = 'button'; button.dataset.category = category; button.textContent = category;
  button.addEventListener('click', () => filter(category)); document.querySelector('#category-tabs').append(button);
}
filter('全部产品');
window.catalogSample = { ready: true, filter, products: products.map(({ id, model, category }) => ({ id, hasModel: Boolean(model), category })) };
