import type { AmoremallProduct } from './fetchers/amoremall.js';
import type { InnisfreeProduct } from './fetchers/innisfree.js';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

function getNowStr(): string {
  const now = new Date();
  const date = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
  const time = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
    hour12: true,
  });
  return `${date} ${time}`;
}

function amoremallCard(p: AmoremallProduct): string {
  const soldOut = p.soldOut ? '<span class="badge sold-out">품절</span>' : '';
  const discount =
    p.originPrice > p.salePrice
      ? `<span class="price-origin">${formatPrice(p.originPrice)}</span>
         <span class="price-sale">${formatPrice(p.salePrice)}</span>
         <span class="badge discount">${p.discountRate}%</span>`
      : `<span class="price-sale">${formatPrice(p.salePrice)}</span>`;

  const cartData = JSON.stringify({
    id: `amoremall-${p.goodsNo}`,
    name: p.goodsName,
    brand: p.brandName,
    price: p.salePrice,
    store: '아모레몰',
  }).replace(/"/g, '&quot;');

  const addBtn = p.soldOut
    ? ''
    : `<button class="btn-cart" onclick="addToCart(${cartData})">담기</button>`;

  return `
    <div class="card${p.soldOut ? ' card-sold-out' : ''}">
      <div class="card-img"><img src="${p.imageUrl}" alt="${p.goodsName}" loading="lazy" /></div>
      <div class="card-body">
        <div class="card-brand">${p.brandName}</div>
        <div class="card-name">${p.goodsName} ${soldOut}</div>
        <div class="card-price">${discount}</div>
        ${addBtn}
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

  const cartData = JSON.stringify({
    id: `innisfree-${p.productId}`,
    name: p.name,
    brand: '이니스프리',
    price: p.employeePrice,
    store: '이니스프리',
  }).replace(/"/g, '&quot;');

  const addBtn = p.soldOut
    ? ''
    : `<button class="btn-cart" onclick="addToCart(${cartData})">담기</button>`;

  return `
    <div class="card${p.soldOut ? ' card-sold-out' : ''}">
      <div class="card-img"><img src="${p.imageUrl}" alt="${p.name}" loading="lazy" /></div>
      <div class="card-body">
        <div class="card-brand">이니스프리</div>
        <div class="card-name">${p.name} ${soldOut}</div>
        <div class="card-price">${discount}</div>
        ${addBtn}
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
  .btn-cart { width: 100%; margin-top: 8px; padding: 8px; border: none; border-radius: 8px; background: #007aff; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  .btn-cart:hover { background: #0056b3; }
  .btn-cart:active { transform: scale(0.97); }

  /* 장바구니 FAB */
  .cart-fab { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: #007aff; color: #fff; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 16px rgba(0,122,255,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
  .cart-fab:hover { transform: scale(1.08); }
  .cart-fab .fab-count { position: absolute; top: -4px; right: -4px; background: #ff3b30; color: #fff; font-size: 12px; font-weight: 700; min-width: 20px; height: 20px; border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 0 5px; }

  /* 장바구니 패널 */
  .cart-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1001; display: none; }
  .cart-overlay.open { display: block; }
  .cart-panel { position: fixed; top: 0; right: -420px; width: 400px; max-width: 100vw; height: 100%; background: #fff; z-index: 1002; box-shadow: -4px 0 24px rgba(0,0,0,0.15); transition: right 0.3s ease; display: flex; flex-direction: column; }
  .cart-panel.open { right: 0; }
  .cart-header { padding: 20px; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between; }
  .cart-header h3 { font-size: 18px; font-weight: 700; }
  .cart-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #86868b; padding: 4px; }
  .cart-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
  .cart-empty { text-align: center; color: #86868b; padding: 40px 0; font-size: 14px; }
  .cart-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
  .cart-item-info { flex: 1; min-width: 0; }
  .cart-item-brand { font-size: 11px; color: #86868b; }
  .cart-item-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cart-item-price { font-size: 13px; color: #1d1d1f; font-weight: 600; margin-top: 2px; }
  .cart-item-qty { display: flex; align-items: center; gap: 8px; }
  .cart-item-qty button { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #d2d2d7; background: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .cart-item-qty button:hover { background: #f5f5f7; }
  .cart-item-qty span { font-size: 14px; font-weight: 600; min-width: 20px; text-align: center; }
  .cart-footer { padding: 16px 20px; border-top: 1px solid #e5e5e5; }
  .cart-delivery { margin-bottom: 12px; }
  .cart-delivery label { font-size: 13px; font-weight: 600; display: block; margin-bottom: 8px; }
  .cart-delivery-options { display: flex; gap: 8px; }
  .cart-delivery-options button { flex: 1; padding: 10px; border: 2px solid #d2d2d7; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .cart-delivery-options button.selected { border-color: #007aff; background: #eef4ff; color: #007aff; font-weight: 700; }
  .cart-shipping-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #86868b; padding: 4px 0; }
  .cart-shipping-row span:last-child { color: #ff3b30; font-weight: 600; }
  #cart-shipping-info:not(:empty) { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #e5e5e5; }
  .cart-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 15px; font-weight: 700; }
  .cart-notice { font-size: 11px; color: #ff3b30; margin-bottom: 12px; line-height: 1.4; padding: 8px; background: #fff5f5; border-radius: 6px; }
  .btn-copy { width: 100%; padding: 14px; border: none; border-radius: 10px; background: #007aff; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
  .btn-copy:hover { background: #0056b3; }
  .btn-copy:disabled { background: #d2d2d7; cursor: not-allowed; }
  .btn-copy.copied { background: #34c759; }

  @media (max-width: 600px) {
    .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    body { padding: 12px; padding-bottom: 80px; }
    .cart-panel { width: 100vw; }
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

<!-- 장바구니 FAB -->
<button class="cart-fab" onclick="toggleCart()">
  🛒
  <span class="fab-count" id="fab-count" style="display:none">0</span>
</button>

<!-- 장바구니 오버레이 -->
<div class="cart-overlay" id="cart-overlay" onclick="toggleCart()"></div>

<!-- 장바구니 패널 -->
<div class="cart-panel" id="cart-panel">
  <div class="cart-header">
    <h3>장바구니</h3>
    <button class="cart-close" onclick="toggleCart()">&times;</button>
  </div>
  <div class="cart-body" id="cart-body">
    <div class="cart-empty">상품을 담아주세요</div>
  </div>
  <div class="cart-footer">
    <div class="cart-delivery">
      <label>배송 요청지</label>
      <div class="cart-delivery-options">
        <button id="dlv-pangyo" class="selected" onclick="selectDelivery('pangyo')">axz판교오피스</button>
        <button id="dlv-jeju" onclick="selectDelivery('jeju')">axz제주오피스</button>
      </div>
    </div>
    <div id="cart-shipping-info"></div>
    <div class="cart-total">
      <span>합계</span>
      <span id="cart-total-price">0원</span>
    </div>
    <div class="cart-notice">
      ⚠️ 실제 주문 시 구매제한 수량 및 품절로 인해 주문 내역과 차이가 있을 수 있습니다.
    </div>
    <button class="btn-copy" id="btn-copy" onclick="copyMessage()" disabled>메시지 복사</button>
  </div>
</div>

<script>
(function() {
  var cart = {};
  var delivery = 'pangyo';
  var deliveryLabels = { pangyo: 'axz판교오피스', jeju: 'axz제주오피스' };

  window.addToCart = function(item) {
    if (cart[item.id]) {
      cart[item.id].qty++;
    } else {
      cart[item.id] = { ...item, qty: 1 };
    }
    renderCart();
    if (!document.getElementById('cart-panel').classList.contains('open')) {
      toggleCart();
    }
  };

  window.removeFromCart = function(id) {
    delete cart[id];
    renderCart();
  };

  window.changeQty = function(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    renderCart();
  };

  window.toggleCart = function() {
    document.getElementById('cart-panel').classList.toggle('open');
    document.getElementById('cart-overlay').classList.toggle('open');
  };

  window.selectDelivery = function(key) {
    delivery = key;
    document.getElementById('dlv-pangyo').classList.toggle('selected', key === 'pangyo');
    document.getElementById('dlv-jeju').classList.toggle('selected', key === 'jeju');
  };

  window.copyMessage = function() {
    var items = Object.values(cart);
    if (items.length === 0) return;

    var lines = ['[임직원 할인 주문 요청]', ''];
    var total = 0;

    var stores = {};
    items.forEach(function(item) {
      if (!stores[item.store]) stores[item.store] = [];
      stores[item.store].push(item);
    });

    var totalShipping = 0;
    Object.keys(stores).forEach(function(store) {
      lines.push('📦 ' + store);
      var storeTotal = 0;
      stores[store].forEach(function(item) {
        var subtotal = item.price * item.qty;
        total += subtotal;
        storeTotal += subtotal;
        lines.push('  - ' + item.name + ' x' + item.qty + ' (' + item.price.toLocaleString() + '원)');
      });
      if (storeTotal <= FREE_SHIPPING_THRESHOLD) {
        totalShipping += SHIPPING_FEE;
        lines.push('  📮 택배비: +' + SHIPPING_FEE.toLocaleString() + '원 (2만원 이하)');
      }
      lines.push('');
    });

    lines.push('🏢 배송지: ' + deliveryLabels[delivery]);
    if (totalShipping > 0) {
      lines.push('📮 택배비 합계: ' + totalShipping.toLocaleString() + '원');
    }
    lines.push('💰 합계: ' + (total + totalShipping).toLocaleString() + '원');
    lines.push('');
    lines.push('⚠️ 구매제한/품절로 실제 주문과 차이가 있을 수 있습니다.');

    var text = lines.join('\\n');
    navigator.clipboard.writeText(text).then(function() {
      var btn = document.getElementById('btn-copy');
      btn.textContent = '복사됨!';
      btn.classList.add('copied');
      setTimeout(function() {
        btn.textContent = '메시지 복사';
        btn.classList.remove('copied');
      }, 2000);
    });
  };

  var SHIPPING_FEE = 2500;
  var FREE_SHIPPING_THRESHOLD = 20000;

  function calcStoreSubtotals() {
    var stores = {};
    Object.values(cart).forEach(function(item) {
      if (!stores[item.store]) stores[item.store] = 0;
      stores[item.store] += item.price * item.qty;
    });
    return stores;
  }

  function renderCart() {
    var items = Object.values(cart);
    var body = document.getElementById('cart-body');
    var fabCount = document.getElementById('fab-count');
    var totalEl = document.getElementById('cart-total-price');
    var shippingEl = document.getElementById('cart-shipping-info');
    var copyBtn = document.getElementById('btn-copy');

    var totalQty = items.reduce(function(s, i) { return s + i.qty; }, 0);
    fabCount.textContent = totalQty;
    fabCount.style.display = totalQty > 0 ? 'flex' : 'none';
    copyBtn.disabled = items.length === 0;

    if (items.length === 0) {
      body.innerHTML = '<div class="cart-empty">상품을 담아주세요</div>';
      totalEl.textContent = '0원';
      shippingEl.innerHTML = '';
      return;
    }

    var total = 0;
    var html = items.map(function(item) {
      var subtotal = item.price * item.qty;
      total += subtotal;
      return '<div class="cart-item">'
        + '<div class="cart-item-info">'
        + '<div class="cart-item-brand">' + item.store + ' · ' + item.brand + '</div>'
        + '<div class="cart-item-name">' + item.name + '</div>'
        + '<div class="cart-item-price">' + subtotal.toLocaleString() + '원</div>'
        + '</div>'
        + '<div class="cart-item-qty">'
        + '<button onclick="changeQty(\\''+item.id+'\\', -1)">−</button>'
        + '<span>' + item.qty + '</span>'
        + '<button onclick="changeQty(\\''+item.id+'\\', 1)">+</button>'
        + '</div>'
        + '</div>';
    }).join('');

    body.innerHTML = html;

    var storeSubtotals = calcStoreSubtotals();
    var totalShipping = 0;
    var shippingHtml = '';
    Object.keys(storeSubtotals).forEach(function(store) {
      var sub = storeSubtotals[store];
      if (sub <= FREE_SHIPPING_THRESHOLD) {
        totalShipping += SHIPPING_FEE;
        shippingHtml += '<div class="cart-shipping-row">'
          + '<span>' + store + ' 택배비</span>'
          + '<span>+' + SHIPPING_FEE.toLocaleString() + '원</span>'
          + '</div>';
      }
    });

    shippingEl.innerHTML = shippingHtml;
    totalEl.textContent = (total + totalShipping).toLocaleString() + '원';
  }
})();
</script>
</body>
</html>`;
}
