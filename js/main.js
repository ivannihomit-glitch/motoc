// Корзина: массив объектов { id, name, price, quantity }
let cart = [];

// DOM элементы
const cartCounterSpan = document.getElementById('cartCounter');
const cartModal = document.getElementById('cartModal');
const openCartBtn = document.getElementById('openCartBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalPriceSpan = document.getElementById('cartTotalPrice');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const feedbackForm = document.getElementById('feedbackForm');
const addReviewForm = document.getElementById('addReviewForm');
const reviewsContainer = document.getElementById('reviewsContainer');

// Вспомогательные уведомления
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

// Загрузить корзину
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

// Обновление UI корзины
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounterSpan.innerText = totalItems;
    renderCartModal();
    saveCart();
}

// Добавить в корзину
function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: id, name: name, price: price, quantity: 1 });
    }
    updateCartUI();
    showToast(`✅ ${name} добавлен в корзину!`);
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
    cart.forEach((item) => {
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

    // Обработчики кнопок в корзине
    document.querySelectorAll('.cart-inc').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(parseInt(btn.dataset.id), 1));
    });
    document.querySelectorAll('.cart-dec').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(parseInt(btn.dataset.id), -1));
    });
    document.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', () => removeCartItem(parseInt(btn.dataset.id)));
    });
}

function changeQuantity(id, delta) {
    const index = cart.findIndex(i => i.id === id);
    if(index !== -1) {
        const newQty = cart[index].quantity + delta;
        if(newQty <= 0) {
            cart.splice(index, 1);
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

function clearCart() {
    if(cart.length === 0) { 
        showToast('Корзина уже пуста'); 
        return; 
    }
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

// Добавление отзыва (динамическое)
function addReview(name, text) {
    if(!name.trim() || !text.trim()) {
        showToast('Пожалуйста, заполните имя и текст отзыва', true);
        return false;
    }
    
    const reviewDiv = document.createElement('div');
    reviewDiv.className = 'review-card';
    reviewDiv.innerHTML = `
        <div class="review-name"><i class="fas fa-user-circle"></i> ${escapeHtml(name.trim())}</div>
        <div class="review-text">${escapeHtml(text.trim())}</div>
    `;
    
    // Вставляем в начало списка (после заголовка)
    const reviewsList = reviewsContainer;
    reviewsList.insertBefore(reviewDiv, reviewsList.firstChild);
    
    showToast('Спасибо за ваш отзыв!');
    return true;
}

// Обратная связь
function sendFeedback(name, email, message) {
    if(!name || !email || !message) {
        showToast('Заполните все поля обратной связи', true);
        return false;
    }
    if(!email.includes('@')) {
        showToast('Введите корректный email', true);
        return false;
    }
    showToast(`📩 Спасибо, ${name}! Ваше сообщение отправлено. Мы ответим на ${email}`);
    return true;
}

// Escape для безопасности
function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

// Инициализация кнопок "В корзину"
function initAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.bike-card');
            if(card) {
                const id = parseInt(card.dataset.id);
                const name = card.dataset.name;
                const price = parseInt(card.dataset.price);
                addToCart(id, name, price);
            }
        });
    });
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

// Модальное окно
function openModal() {
    cartModal.style.display = 'flex';
    renderCartModal();
}

function closeModal() {
    cartModal.style.display = 'none';
}

function bindGlobalEvents() {
    openCartBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if(e.target === cartModal) closeModal();
    });
    if(clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if(checkoutBtn) checkoutBtn.addEventListener('click', checkout);
}

// Запуск приложения
function init() {
    loadCart();
    initAddToCartButtons();
    initForms();
    bindGlobalEvents();
}

init();