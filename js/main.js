// ---------- МОТОЦИКЛЫ (каталог) ----------
const motorcycles = [
    { id: 1, name: "Thunder 900", price: 849000, desc: "900cc, 105 л.с., идеален для города и трассы", img: "imag/image6.jpg" },
    { id: 2, name: "Storm ADV 1200", price: 1249000, desc: "1200cc туркер, полный привод, ABS", img: "imag/image4.jpg" },
    { id: 3, name: "Street Arrow 750", price: 649000, desc: "Лёгкий нейкед, маневренный", img: "imag/image1.jpg" },
    { id: 4, name: "Cruiser Phantom", price: 989000, desc: "Классический чоппер, 1500cc", img: "imag/image2.jpg" },
    { id: 5, name: "Sport RR 1000", price: 1599000, desc: "Спортбайк, 200 л.с., карбон", img: "imag/image3.jpg" },
    { id: 6, name: "Enduro X 450", price: 529000, desc: "Легкий эндуро для бездорожья", img: "imag/image5.jpg" }
];

// Корзина: массив объектов { id, name, price, quantity }
let cart = [];

// Хранилище отзывов (начальные)
let reviews = [
    { name: "Алексей", text: "Взял Thunder 900 — невероятные эмоции! Сервис на высоте." },
    { name: "Марина", text: "Крутой выбор мотоциклов, доставили точно в срок. Рекомендую!" },
    { name: "Дмитрий", text: "Storm ADV покорил бездорожье, отличная цена." }
];

// DOM элементы
const catalogGrid = document.getElementById('catalogGrid');
const cartCounterSpan = document.getElementById('cartCounter');
const cartModal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('openCartBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalPriceSpan = document.getElementById('cartTotalPrice');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const reviewsContainer = document.getElementById('reviewsContainer');
const feedbackForm = document.getElementById('feedbackForm');
const addReviewForm = document.getElementById('addReviewForm');

// вспомогательные уведомления
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.style.background = isError ? '#c0392b' : '#1e2a41';
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Сохранить корзину в localStorage
function saveCart() {
    localStorage.setItem('motoCart', JSON.stringify(cart));
}
function loadCart() {
    const saved = localStorage.getItem('motoCart');
    if(saved) {
        try {
            cart = JSON.parse(saved);
            if(!Array.isArray(cart)) cart = [];
        } catch(e) { cart = []; }
    } else {
        cart = [];
    }
    updateCartUI();
}

// Обновление счетчика и модалки
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounterSpan.innerText = totalItems;
    renderCartModal();
    saveCart();
}

// Добавить в корзину
function addToCart(moto) {
    const existing = cart.find(item => item.id === moto.id);
    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: moto.id, name: moto.name, price: moto.price, quantity: 1 });
    }
    updateCartUI();
    showToast(`✅ ${moto.name} добавлен в корзину!`);
}

// Отрисовка модального окна корзины
function renderCartModal() {
    if(!cartItemsList) return;
    if(cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align:center; padding:20px;">Корзина пуста, добавьте мотоциклы!</p>';
        cartTotalPriceSpan.innerText = 'Итого: 0 ₽';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach((item, idx) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div><strong>${item.name}</strong><br>${item.price.toLocaleString()} ₽ x ${item.quantity}</div>
                <div style="display:flex; gap:12px; align-items:center;">
                    <span style="font-weight:bold;">${itemTotal.toLocaleString()} ₽</span>
                    <button class="cart-inc" data-id="${item.id}" style="background:#f0b27a; border:none; width:28px; border-radius:30px; cursor:pointer;">+</button>
                    <button class="cart-dec" data-id="${item.id}" style="background:#e2e8f0; border:none; width:28px; border-radius:30px; cursor:pointer;">-</button>
                    <button class="cart-remove" data-id="${item.id}" style="background:#cbd5e1; border:none; border-radius:30px; padding:4px 8px; cursor:pointer;">🗑️</button>
                </div>
            </div>
        `;
    });
    cartItemsList.innerHTML = html;
    cartTotalPriceSpan.innerText = `Итого: ${total.toLocaleString()} ₽`;

    // обработчики внутри модалки (делегирование)
    document.querySelectorAll('.cart-inc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            changeQuantity(id, 1);
        });
    });
    document.querySelectorAll('.cart-dec').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            changeQuantity(id, -1);
        });
    });
    document.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            removeCartItem(id);
        });
    });
}

function changeQuantity(id, delta) {
    const index = cart.findIndex(i => i.id === id);
    if(index !== -1) {
        const newQty = cart[index].quantity + delta;
        if(newQty <= 0) {
            cart.splice(index,1);
        } else {
            cart[index].quantity = newQty;
        }
        updateCartUI();
    }
}
function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
    showToast('Товар удалён из корзины');
}

// Очистить корзину
function clearCart() {
    if(cart.length === 0) { showToast('Корзина уже пуста'); return; }
    cart = [];
    updateCartUI();
    showToast('Корзина очищена');
}
function checkout() {
    if(cart.length === 0) {
        showToast('Нет товаров для оформления заказа', true);
        return;
    }
    const totalSum = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    showToast(`🎉 Заказ оформлен! Сумма: ${totalSum.toLocaleString()} ₽. С вами свяжутся.`);
    cart = [];
    updateCartUI();
    cartModal.style.display = 'none';
}

// отрисовка каталога
function renderCatalog() {
    catalogGrid.innerHTML = '';
    motorcycles.forEach(bike => {
        const card = document.createElement('div');
        card.className = 'bike-card';
        card.innerHTML = `
            <div class="bike-img"><i class="fas fa-motorcycle" style="font-size: 5rem;"></i> <span style="font-size: 2rem; margin-left: 8px;">${bike.imgIcon}</span></div>
            <div class="bike-info">
                <div class="bike-title">${bike.name}</div>
                <div class="bike-price">${bike.price.toLocaleString()} ₽</div>
                <div class="bike-desc">${bike.desc}</div>
                <button class="add-to-cart" data-id="${bike.id}"><i class="fas fa-cart-plus"></i> В корзину</button>
            </div>
        `;
        catalogGrid.appendChild(card);
    });
    // вешаем события на кнопки "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const moto = motorcycles.find(m => m.id === id);
            if(moto) addToCart(moto);
        });
    });
}

// === Отзывы (рендер) ===
function renderReviews() {
    if(!reviewsContainer) return;
    if(reviews.length === 0) {
        reviewsContainer.innerHTML = '<p>Пока нет отзывов. Будьте первым!</p>';
        return;
    }
    let html = '';
    reviews.forEach(rev => {
        html += `
            <div class="review-card">
                <div class="review-name"><i class="fas fa-user-circle"></i> ${escapeHtml(rev.name)}</div>
                <div class="review-text">${escapeHtml(rev.text)}</div>
            </div>
        `;
    });
    reviewsContainer.innerHTML = html;
}

// простой escape для XSS
function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

// добавление отзыва через форму
function addReview(name, text) {
    if(!name.trim() || !text.trim()) {
        showToast('Пожалуйста, заполните имя и текст отзыва', true);
        return false;
    }
    reviews.unshift({ name: name.trim(), text: text.trim() });
    renderReviews();
    showToast('Спасибо за ваш отзыв!');
    return true;
}

// обратная связь (имитация отправки)
function sendFeedback(name, email, message) {
    if(!name || !email || !message) {
        showToast('Заполните все поля обратной связи', true);
        return false;
    }
    if(!email.includes('@')) {
        showToast('Введите корректный email', true);
        return false;
    }
    // имитация отправки
    showToast(`📩 Спасибо, ${name}! Ваше сообщение отправлено. Мы ответим на ${email}`);
    return true;
}

// Инициализация форм
function initForms() {
    if(feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('feedbackName').value;
            const email = document.getElementById('feedbackEmail').value;
            const msg = document.getElementById('feedbackMessage').value;
            if(sendFeedback(name, email, msg)) {
                feedbackForm.reset();
            }
        });
    }
    if(addReviewForm) {
        addReviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reviewName').value;
            const text = document.getElementById('reviewText').value;
            if(addReview(name, text)) {
                addReviewForm.reset();
            }
        });
    }
}

// модалка: открыть/закрыть
function openModal() {
    cartModal.style.display = 'flex';
    renderCartModal(); // обновляем на всякий
}
function closeModal() {
    cartModal.style.display = 'none';
}

// глобальные события
function bindGlobalEvents() {
    openCartBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if(e.target === cartModal) closeModal();
    });
    if(clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if(checkoutBtn) checkoutBtn.addEventListener('click', checkout);
}

// старт
function init() {
    renderCatalog();
    loadCart();      // загрузит корзину из localStorage и обновит UI
    renderReviews();
    initForms();
    bindGlobalEvents();
}

init();