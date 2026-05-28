const MENU = [
  { id: 1, name: 'Sisig Rice',  price: 70, cat: 'Rice Meals', img: 'sisig.png' },
  { id: 2, name: 'Kare-Kare Rice',     price: 65, cat: 'Rice Meals', img: 'karekare.png' },
  { id: 3, name: 'FriedChicken Rice', price: 55, cat: 'Rice Meals', img: 'friedchicken.png' },
  { id: 4, name: 'Iced Tea',      price: 20, cat: 'Drinks', img: 'lemon.png' },
  { id: 5, name: 'Bottled Water', price: 15, cat: 'Drinks', img: 'water.png' },
  { id: 6, name: 'Hotdog Rice',    price: 45, cat: 'Rice Meals',     img: 'hotdog.png' },
  { id: 7, name: 'Siomai Rice', price: 40, cat: 'Rice Meals', img: 'siomai.png' },
  { id: 8, name: 'Hungarian Rice', price: 60, cat: 'Rice Meals', img: 'hungarian.png' },
  { id: 9, name: 'Pakbet Rice', price: 35, cat: 'Rice Meals',    img: 'pakbet.png' },
  { id: 10, name: 'Gulaman', price: 20, cat: 'Drinks', img: 'gulaman.png' },
  { id: 11, name: 'Chicken Adobo Rice', price: 55, cat: 'Rice Meals', img: 'chickenadobo.png' },
  { id: 12, name: 'Chicken Pastil Rice', price: 25, cat: 'Rice Meals', img: 'chickenpastil.png' },
  { id: 13, name: 'Fries', price: 35, cat: 'Snacks', img: 'fries.png' },
  { id: 14, name: 'Takoyaki', price: 50, cat: 'Snacks', img: 'takoyaki.png' },
  { id: 15, name: 'Kikiam', price: 15, cat: 'Snacks', img: 'kikiam.png' },

];

let cart = {};
let toastTimer = null;

function getFiltered() {
  const q    = document.getElementById('searchInput').value.toLowerCase();
  const maxP = parseInt(document.getElementById('priceFilter').value) || Infinity;
  const cat  = document.getElementById('catFilter').value;
  const sort = document.getElementById('sortBy').value;

  let items = MENU.filter(i =>
    (i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)) &&
    i.price <= maxP &&
    (!cat || i.cat === cat)
  );

  if (sort === 'price-asc')  items.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') items.sort((a,b) => b.price - a.price);
  if (sort === 'name')       items.sort((a,b) => a.name.localeCompare(b.name));

  return items;
}

function renderMenu() {
  const items = getFiltered();
  const grid  = document.getElementById('menuGrid');
  document.getElementById('resultsCount').textContent =
    `Showing ${items.length} item${items.length !== 1 ? 's' : ''}`;

  grid.innerHTML = items.length === 0
    ? `<div class="empty-state"><span class="emoji">🔍</span><p>No items match your search.</p></div>`
    : items.map(item => `
      <div class="menu-card">
        <div class="card-img" style="padding:0; overflow:hidden;">
  <img src="${item.img}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;">
</div>
        <div class="card-body">
          <div class="card-name">${item.name}</div>
          <div class="card-price">₱${item.price}.00</div>
          <div class="card-footer">
            <span class="tag">${item.cat}</span>
            <button class="add-btn" onclick="addToCart(${item.id})">＋ Add</button>
          </div>
        </div>
      </div>`).join('');
}

function addToCart(id) {
  const item = MENU.find(i => i.id === id);
  if (!item) return;
  cart[id] = { ...item, qty: (cart[id]?.qty || 0) + 1 };
  renderCart();
  showToast(`${item.name} was added to your cart!`);
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  renderCart();
}

function renderCart() {
  const keys = Object.keys(cart);
  const container = document.getElementById('cartItems');
  const badge = document.getElementById('cart-badge');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const totalQty = keys.reduce((s, k) => s + cart[k].qty, 0);
  const totalAmt = keys.reduce((s, k) => s + cart[k].qty * cart[k].price, 0);

  badge.textContent = totalQty;
  badge.style.display = totalQty > 0 ? 'flex' : 'none';
  totalEl.textContent = `₱${totalAmt}.00`;
  checkoutBtn.disabled = keys.length === 0;

  if (keys.length === 0) {
    container.innerHTML = `<div class="cart-empty-msg">Your cart is empty.<br>Add something tasty! 🍽️</div>`;
    return;
  }

  container.innerHTML = keys.map(k => {
    const ci = cart[k];
    return `
      <div class="cart-item">
        <div class="ci-emoji">
          <img src="${ci.img}" alt="${ci.name}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div class="ci-info">
          <div class="ci-name">${ci.name}</div>
          <div class="ci-qty">
            <button class="qty-btn" onclick="changeQty(${k}, -1)">−</button>
            <span class="qty-val">${ci.qty}</span>
            <button class="qty-btn" onclick="changeQty(${k}, 1)">＋</button>
          </div>
        </div>
        <span class="ci-price">₱${ci.qty * ci.price}</span>
        <button class="del-btn" onclick="removeFromCart(${k})" title="Remove">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>`;
  }).join('');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 3200);
}

function hideToast() {
  document.getElementById('toast').classList.remove('show');
}

function scrollToCart() {
  document.getElementById('cartPanel').scrollIntoView({ behavior: 'smooth' });
}

function checkout() {
  const keys = Object.keys(cart);
  if (!keys.length) return;
  const total = keys.reduce((s, k) => s + cart[k].qty * cart[k].price, 0);
  alert(`🎉 Order placed!\nTotal: ₱${total}.00\n\nThank you for your order!`);
  cart = {};
  renderCart();
}

// Init
renderMenu();
renderCart();