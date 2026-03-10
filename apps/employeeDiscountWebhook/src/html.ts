import type { AmoremallProduct } from './fetchers/amoremall.js';
import type { InnisfreeProduct } from './fetchers/innisfree.js';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

function getNowStr(): string {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
}

function amoremallCard(p: AmoremallProduct): string {
  const soldOut = p.soldOut ? '<span class="badge sold-out">품절</span>' : '';
  const discount =
    p.originPrice > p.salePrice
      ? `<span class="price-origin">${formatPrice(p.originPrice)}</span>
         <span class="price-sale">${formatPrice(p.salePrice)}</span>
         <span class="badge discount">${p.discountRate}%</span>`
      : `<span class="price-sale">${formatPrice(p.salePrice)}</span>`;

  return `
    <div class="card${p.soldOut ? ' card-sold-out' : ''}">
      <div class="card-img"><img src="${p.imageUrl}" alt="${p.goodsName}" loading="lazy" /></div>
      <div class="card-body">
        <div class="card-brand">${p.brandName}</div>
        <div class="card-name">${p.goodsName} ${soldOut}</div>
        <div class="card-price">${discount}</div>
      </div>
    </div>`;
}

function innisfreeCard(p: InnisfreeProduct): string {
  const soldOut = p.soldOut ? '<span class="badge sold-out">품절</span>' : '';
  const discount =
    p.listPrice > p.employeePrice
      ? `<span class="price-origin">${formatPrice(p.listPrice)}</span>
         <span class="price-sale">${formatPrice(p.employeePrice)}</span>
         <span class="badge discount">${p.employeeRate}%</span>`
      : `<span class="price-sale">${formatPrice(p.employeePrice)}</span>`;

  return `
    <div class="card${p.soldOut ? ' card-sold-out' : ''}">
      <div class="card-img"><img src="${p.imageUrl}" alt="${p.name}" loading="lazy" /></div>
      <div class="card-body">
        <div class="card-brand">이니스프리</div>
        <div class="card-name">${p.name} ${soldOut}</div>
        <div class="card-price">${discount}</div>
      </div>
    </div>`;
}

export function generateProductHtml(
  amoremallProducts: AmoremallProduct[],
  innisfreeProducts: InnisfreeProduct[],
): string {
  const date = getNowStr();

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>임직원 할인 상품 - ${date}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; color: #1d1d1f; padding: 20px; }
  .container { max-width: 1200px; margin: 0 auto; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .subtitle { color: #86868b; margin-bottom: 24px; font-size: 14px; }
  h2 { font-size: 20px; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #d2d2d7; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
  .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: transform 0.2s; }
  .card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
  .card-sold-out { opacity: 0.5; }
  .card-img { aspect-ratio: 1; overflow: hidden; background: #f5f5f7; }
  .card-img img { width: 100%; height: 100%; object-fit: cover; }
  .card-body { padding: 12px; }
  .card-brand { font-size: 12px; color: #86868b; margin-bottom: 4px; }
  .card-name { font-size: 14px; font-weight: 600; margin-bottom: 8px; line-height: 1.3; }
  .card-price { font-size: 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .price-origin { text-decoration: line-through; color: #86868b; font-size: 13px; }
  .price-sale { font-weight: 700; color: #1d1d1f; }
  .badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
  .badge.discount { background: #ff3b30; color: #fff; }
  .badge.sold-out { background: #86868b; color: #fff; }
  .summary { background: #fff; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; gap: 24px; flex-wrap: wrap; }
  .summary-item { font-size: 14px; }
  .summary-item strong { font-size: 20px; }
  @media (max-width: 600px) {
    .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    body { padding: 12px; }
  }
</style>
</head>
<body>
<div class="container">
  <h1>임직원 할인 상품</h1>
  <p class="subtitle">${date} 기준</p>

  <div class="summary">
    <div class="summary-item">아모레몰 <strong>${amoremallProducts.length}</strong>개</div>
    <div class="summary-item">이니스프리 <strong>${innisfreeProducts.length}</strong>개</div>
  </div>

  <h2>아모레몰</h2>
  <div class="grid">
    ${amoremallProducts.map(amoremallCard).join('\n')}
  </div>

  <h2>이니스프리</h2>
  <div class="grid">
    ${innisfreeProducts.map(innisfreeCard).join('\n')}
  </div>
</div>
</body>
</html>`;
}
