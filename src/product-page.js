import { products, featuredIds, detailUrl, sourceUrl } from './catalog-data.js';

const id = new URLSearchParams(location.search).get('id') || 'P14';
const product = products.find(item => item.id === id);
if (!product) {
  const content = document.createElement('section'); content.className = 'unknown-product';
  const title = document.createElement('h1'); title.textContent = '没有找到这份产品资料';
  const link = document.createElement('a'); link.href = './catalog.html'; link.textContent = '返回产品目录 ↗';
  content.append(title, link); document.querySelector('main').replaceChildren(content);
  window.productPage = { ready: true, notFound: true };
} else {
  const hasModel = Boolean(product.model);
  const setText = (selector, value) => document.querySelector(selector).textContent = value;
  document.title = `${product.name} · 匠力王产品手册`;
  setText('#product-title', product.name);
  setText('#detail-breadcrumb', `${product.category} / ${product.id}`);
  setText('#detail-category', `${product.category} / ${product.id}`);
  setText('#detail-purpose', product.description || '查看现有包装海报，了解这份产品资料。正式型号、规格和说明待企业核对。');
  setText('#detail-weight', product.weight || '见包装海报');
  setText('#detail-mode', hasModel ? '360° 外观' : '包装海报');
  setText('#detail-summary-title', product.purpose || '包装资料');
  setText('#detail-summary-copy', product.description || '当前提供已有海报原图。产品名称按海报台账暂列，相近名称与不同包装的对应关系待核实。');
  const fallback = document.querySelector('#fallback');
  fallback.src = hasModel ? sourceUrl(product.sources[0]) : `./${product.poster}`;
  fallback.alt = `${product.name}包装原图`;
  document.querySelector('#viewer').setAttribute('aria-label', `${product.name}外观展示`);
  for (const value of [product.category, hasModel ? '四面包装原图' : '海报原图']) {
    const badge = document.createElement('span'); badge.textContent = value; document.querySelector('#detail-badges').append(badge);
  }
  const sourceLink = document.querySelector('#detail-source-link'); sourceLink.href = hasModel ? sourceUrl(product.sources[2]) : `./${product.poster}`;
  sourceLink.textContent = hasModel ? '打开背标使用资料 ↗' : '打开包装海报原图 ↗';
  document.querySelector('#detail-poster').href = `./${product.poster}`;
  document.querySelector('#detail-demo-link').hidden = product.id !== 'P14';
  for (const [index, fact] of (product.facts || []).entries()) {
    const article = document.createElement('article'); const title = document.createElement('h3'); title.textContent = fact;
    const source = document.createElement('p'); source.textContent = `资料依据：${product.factSources[index]}。`;
    article.append(title, source); document.querySelector('#detail-feature-list').append(article);
  }
  const views = hasModel ? product.sources.map((file, index) => ({ href: sourceUrl(file), label: ['正面', '侧面', '背面', '接缝'][index] })) : [{ href: `./${product.poster}`, label: '包装海报' }];
  const references = document.querySelector('#detail-reference-grid'); references.classList.toggle('one-image', !hasModel);
  views.forEach(({ href, label }, index) => {
    const link = document.createElement('a'); link.href = href; link.target = '_blank'; link.rel = 'noopener';
    const holder = document.createElement('div'); const image = document.createElement('img'); image.src = href; image.alt = `${product.name}${label}原图`; image.loading = 'lazy'; holder.append(image);
    const caption = document.createElement('span'); caption.textContent = `0${index+1} / ${label} ↗`; link.append(holder, caption); references.append(link);
  });
  for (const featuredId of featuredIds) {
    const entry = products.find(item => item.id === featuredId); const link = document.createElement('a'); link.href = detailUrl(entry.id); link.dataset.productId = entry.id; link.textContent = entry.name;
    if (entry.id === product.id) link.setAttribute('aria-current', 'page'); document.querySelector('#detail-switcher').append(link);
  }
  window.currentProduct = product;
  window.productPage = { ready: true, id: product.id, hasModel, sources: product.sources || [product.poster] };
  if (hasModel) await import('./app.js');
  else {
    document.querySelector('.viewer-toolbar').hidden = true;
    document.querySelector('#viewer-hint').hidden = true;
    document.querySelector('#loading').hidden = true;
    setText('#detail-viewer-label', '包装海报');
  }
}
