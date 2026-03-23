const API = 'http://localhost:5000';

// ── CART ────────────────────────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
}
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function addToCart(item) {
  const cart = getCart();
  const ex = cart.find(i => i.id === item.id);
  ex ? ex.qty++ : cart.push({ ...item, qty: 1 });
  saveCart(cart);
  updateCartUI();
  showToast(`Đã thêm ${item.name} vào giỏ hàng`);
}
function updateQty(id, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter(i => i.id !== id);
  else { const it = cart.find(i => i.id === id); if (it) it.qty = qty; }
  saveCart(cart); renderCartItems(); updateCartUI();
}
function getCartTotal() { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }
function getCartCount() { return getCart().reduce((s, i) => s + i.qty, 0); }

function updateCartUI() {
  const count = getCartCount();
  document.getElementById('cartBadge').textContent = count;
}

function renderCartItems() {
  const cart = getCart();
  const el = document.getElementById('cartItems');
  if (!cart.length) { el.innerHTML = '<p class="empty-cart">Giỏ hàng trống</p>'; }
  else {
    el.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" />
        <div class="cart-item-info">
          <p>${item.name}</p>
          <small>${item.price.toLocaleString('vi-VN')}đ</small>
          <div class="cart-qty">
            <button onclick="updateQty('${item.id}', ${item.qty - 1})">-</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${item.id}', ${item.qty + 1})">+</button>
            <button class="cart-remove" onclick="updateQty('${item.id}', 0)">🗑</button>
          </div>
        </div>
      </div>`).join('');
  }
  document.getElementById('cartTotal').textContent = getCartTotal().toLocaleString('vi-VN') + 'đ';
}

function openCart() {
  renderCartItems();
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
}
document.getElementById('cartBtn').addEventListener('click', openCart);

// ── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
function logout() {
  localStorage.removeItem('token'); localStorage.removeItem('user');
  updateAuthUI(); window.location.href = 'index.html';
}
function updateAuthUI() {
  const user = getUser();
  document.getElementById('navLogin').style.display = user ? 'none' : 'inline';
  document.getElementById('navDashboard').style.display = user ? 'inline' : 'none';
  document.getElementById('navLogout').style.display = user ? 'inline' : 'none';
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
let currentCategory = 'coffee';
let currentSearch = '';
let currentSort = '';
let allProducts = [];
let allAccessories = [];

function productCardHTML(p) {
  const outOfStock = p.stock === 0;
  return `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='img/menu-1.png'" />
      <div class="product-card-body">
        <span class="badge">${p.category === 'coffee' ? 'Cà phê' : 'Phụ kiện'}</span>
        <h3>${p.name}</h3>
        ${p.averageRating > 0 ? `<div class="stars-small">${'★'.repeat(Math.round(p.averageRating))}${'☆'.repeat(5 - Math.round(p.averageRating))} (${p.averageRating.toFixed(1)})</div>` : ''}
        <p class="price">
          ${p.price.toLocaleString('vi-VN')}đ
          ${p.originalPrice ? `<span class="original-price">${p.originalPrice.toLocaleString('vi-VN')}đ</span>` : ''}
        </p>
        <button class="btn-add" ${outOfStock ? 'disabled' : ''} onclick='addToCart(${JSON.stringify({ id: p._id, name: p.name, price: p.price, img: p.image })})'>
          ${outOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
        </button>
      </div>
    </div>`;
}

async function loadProducts() {
  try {
    const [coffeeRes, accRes] = await Promise.all([
      fetch(`${API}/products?category=coffee`),
      fetch(`${API}/products?category=accessories`)
    ]);
    const coffeeData = await coffeeRes.json();
    const accData = await accRes.json();
    allProducts = coffeeData.products || [];
    allAccessories = accData.products || [];
    renderMenu();
    renderAccessories();
  } catch {
    document.getElementById('menuGrid').innerHTML = '<p class="loading">Không thể tải sản phẩm</p>';
  }
}

function renderMenu() {
  let list = currentCategory === 'coffee' ? [...allProducts] : [...allAccessories];
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  }
  if (currentSort === 'price_asc') list.sort((a, b) => a.price - b.price);
  else if (currentSort === 'price_desc') list.sort((a, b) => b.price - a.price);
  else if (currentSort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = list.length ? list.map(productCardHTML).join('') : '<p class="loading">Không tìm thấy sản phẩm</p>';
}

function renderAccessories() {
  document.getElementById('accessoryGrid').innerHTML = allAccessories.map(productCardHTML).join('') || '<p class="loading">Không có sản phẩm</p>';
}

function filterCategory(cat, btn) {
  currentCategory = cat; currentSearch = ''; currentSort = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('sortSelect').value = '';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMenu();
}
function handleSearch(val) { currentSearch = val; renderMenu(); }
function handleSort(val) { currentSort = val; renderMenu(); }

// ── BLOGS ─────────────────────────────────────────────────────────────────────
async function loadBlogs() {
  try {
    const res = await fetch(`${API}/blogs`);
    const blogs = await res.json();
    document.getElementById('blogGrid').innerHTML = blogs.map(b => `
      <div class="blog-card">
        <img src="${b.image}" alt="${b.title}" onerror="this.src='img/blog-1.jpeg'" />
        <div class="blog-card-body">
          <p class="blog-date">${new Date(b.date).toLocaleDateString('vi-VN')}</p>
          <h3>${b.title}</h3>
          <p>${b.excerpt}</p>
          <a href="blog.html?id=${b._id}">Đọc thêm →</a>
        </div>
      </div>`).join('');
  } catch {
    document.getElementById('blogGrid').innerHTML = '<p class="loading">Không thể tải bài viết</p>';
  }
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
async function submitContact(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById('cName').value,
    email: document.getElementById('cEmail').value,
    phone: document.getElementById('cPhone').value,
  };
  try {
    const res = await fetch(`${API}/contact`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (res.ok) {
      document.getElementById('contactMsg').textContent = 'Gửi thành công! Chúng tôi sẽ liên hệ sớm.';
      document.getElementById('contactForm').reset();
    } else {
      document.getElementById('contactMsg').textContent = 'Gửi thất bại, vui lòng thử lại.';
    }
  } catch {
    document.getElementById('contactMsg').textContent = 'Lỗi kết nối server.';
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
updateAuthUI();
updateCartUI();
loadProducts();
loadBlogs();
