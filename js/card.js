document.addEventListener('DOMContentLoaded', () => {
    
    // === ФУНКЦИИ ДЛЯ ПЕРЕВОДОВ ===
    function getCurrentLang() {
        return document.body.classList.contains('lang-en') ? 'en' : 'ru';
    }

    function getProductField(product, fieldRu, fieldEn) {
        const lang = getCurrentLang();
        if (lang === 'ru') return product[fieldRu];
        return product[fieldEn] || product[fieldRu];
    }

    function getUIText(ru, en) {
        return getCurrentLang() === 'ru' ? ru : en;
    }
    
    // === ОБЩИЕ ЭЛЕМЕНТЫ МОДАЛЬНОГО ОКНА ===
    const modal = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalImg = document.getElementById('modal-img');
    const modalPrice = document.getElementById('modal-price');
    const modalSpecs = document.getElementById('modal-specs');
    const modalToCartBtn = document.getElementById('modal-to-cart-btn');

    let currentItem = null;

    // Клик по кнопкам в каталоге
    document.addEventListener('click', async (e) => {
        // 1. Клик по кнопке "Подробнее"
        const detailsBtn = e.target.closest('.btn-details');
        if (detailsBtn) {
            const card = detailsBtn.closest('.b-services-card-horizontal');
            const id = card.getAttribute('data-id');

            try {
                const response = await fetch(`http://localhost:3000/products/${id}`);
                const product = await response.json();

                currentItem = product;

                if (modalTitle) modalTitle.textContent = getProductField(product, 'name', 'nameEn');
                if (modalImg) modalImg.src = product.img;
                
                const currency = getUIText(' руб.', ' RUB');
                if (modalPrice) modalPrice.textContent = parseInt(product.price).toLocaleString() + currency;
                
                if (modalSpecs) {
                    modalSpecs.innerHTML = '';
                    const features = getProductField(product, 'features', 'featuresEn');
                    features.forEach(feat => {
                        const li = document.createElement('li');
                        li.textContent = feat;
                        modalSpecs.appendChild(li);
                    });
                }

                if (modal) modal.style.display = 'flex';
            } catch (error) {
                console.error('Ошибка получения данных товара с сервера:', error);
            }
            return;
        }

        // 2. Клик по кнопке "В корзину"
        const addToCartBtn = e.target.closest('.buy-btn-catalog');
        if (addToCartBtn) {
            const card = addToCartBtn.closest('.b-services-card-horizontal');
            const id = card.getAttribute('data-id');
            
            try {
                const response = await fetch(`http://localhost:3000/products/${id}`);
                const product = await response.json();
                
                const productToCart = {
                    id: product.id,
                    name: product.name,
                    nameEn: product.nameEn,
                    price: parseInt(product.price),
                    img: product.img
                };
                
                addToCart(productToCart);
            } catch (error) {
                console.error('Ошибка при получении товара для корзины:', error);
            }
        }
    });

    // Закрытие модального окна
    if (modalClose) {
        modalClose.addEventListener('click', () => { modal.style.display = 'none'; });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) { modal.style.display = 'none'; }
    });

    // Функция добавления в LocalStorage
    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => String(item.id) === String(product.id));
        
        if (existing) {
            existing.quantity += 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        const productName = getProductField(product, 'name', 'nameEn');
        const alertMsg = getUIText(`Товар "${productName}" успешно добавлен в корзину!`, 
                                   `Item "${productName}" successfully added to cart!`);
        alert(alertMsg);
    }

    if (modalToCartBtn) {
        modalToCartBtn.addEventListener('click', () => {
            if (currentItem) {
                const productToCart = {
                    id: currentItem.id,
                    name: currentItem.name,
                    nameEn: currentItem.nameEn,
                    price: parseInt(currentItem.price),
                    img: currentItem.img
                };
                addToCart(productToCart);
                modal.style.display = 'none';
            }
        });
    }

    // =========================================================
    // === ЛОГИКА СТРАНИЦЫ КОРЗИНЫ ===
    // =========================================================
    const container = document.getElementById('cart-container-js');
    const summaryPanel = document.getElementById('cart-summary-panel');
    const totalSumElement = document.getElementById('total-sum-js');

    if (container) {
        
      function renderCart() {  // ❌ Убрали async
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    container.innerHTML = '';
    
    if (cart.length === 0) {
        const emptyMsg = getUIText('Ваша корзина пуста.', 'Your cart is empty.');
        const catalogLink = getUIText('Перейти в каталог', 'Back to catalog');
        
        container.innerHTML = `
            <div class="cart-empty-msg">
                <p style="margin-bottom: 15px;">${emptyMsg}</p>
                <a href="avtomatika.html" class="cart-submit-btn" style="text-decoration: none; display: inline-block;">${catalogLink}</a>
            </div>`;
        if (summaryPanel) summaryPanel.style.display = 'none';
        return;
    }

    if (summaryPanel) summaryPanel.style.display = 'flex';
    
    const table = document.createElement('div');
    table.classList.add('cart-table');
    
    let totalSum = 0;
    const currency = getUIText(' руб.', ' RUB');

    // === Просто отрисовываем, без fetch ===
    cart.forEach(item => {
        const cleanPrice = parseInt(String(item.price).replace(/\s+/g, '')) || 0;
        const itemTotal = cleanPrice * item.quantity;
        totalSum += itemTotal;

        // === Выбираем название по текущему языку ===
        const itemName = (getCurrentLang() === 'en' && item.nameEn) ? item.nameEn : item.name;
        const priceLabel = getUIText('Цена за единицу:', 'Price per unit:');
        const removeBtnText = getUIText('Удалить', 'Remove');

        const row = document.createElement('div');
        row.classList.add('cart-item');

        row.innerHTML = `
            <div class="cart-item__product">
                <div class="cart-item__img-wrapper">
                    <img src="${item.img}" alt="${itemName}" class="cart-item__img">
                </div>
                <div class="cart-item__info">
                    <h3 class="cart-item__name">${itemName}</h3>
                    <p class="cart-item__price-each">${priceLabel} ${cleanPrice.toLocaleString()}${currency}</p>
                </div>
            </div>
            <div class="cart-item__actions">
                <div class="counter-block">
                    <button class="counter-btn btn-minus" data-id="${item.id}">&minus;</button>
                    <div class="counter-value">${item.quantity}</div>
                    <button class="counter-btn btn-plus" data-id="${item.id}">&plus;</button>
                </div>
                <div class="cart-item__total">${itemTotal.toLocaleString()}${currency}</div>
                <button class="cart-item__remove" data-id="${item.id}">${removeBtnText}</button>
            </div>
        `;
        table.appendChild(row);
    });

    container.appendChild(table);
    
    if (totalSumElement) {
        const totalLabel = getUIText('Итого: ', 'Total: ');
        totalSumElement.textContent = totalSum.toLocaleString();
        const currencySpan = totalSumElement.parentElement.querySelector('.currency-symbol');
        if (currencySpan) {
            currencySpan.textContent = currency;
        } else {
            const span = document.createElement('span');
            span.className = 'currency-symbol';
            span.textContent = currency;
            totalSumElement.after(span);
        }
    }

    initCartEvents();
}
        function initCartEvents() {
            // Кнопка Увеличить (+)
            container.querySelectorAll('.btn-plus').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const item = cart.find(p => String(p.id) === String(id));
                    if (item) {
                        item.quantity += 1;
                        localStorage.setItem('cart', JSON.stringify(cart));
                        renderCart();
                    }
                });
            });

            // Кнопка Уменьшить (-)
            container.querySelectorAll('.btn-minus').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const item = cart.find(p => String(p.id) === String(id));
                    if (item) {
                        if (item.quantity > 1) {
                            item.quantity -= 1;
                        } else {
                            cart = cart.filter(p => String(p.id) !== String(id));
                        }
                        localStorage.setItem('cart', JSON.stringify(cart));
                        renderCart();
                    }
                });
            });

            // Кнопка Удалить
            container.querySelectorAll('.cart-item__remove').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    cart = cart.filter(item => String(item.id) !== String(id));
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                });
            });
        }

        // === ОФОРМЛЕНИЕ ЗАКАЗА ===
        const checkoutBtn = document.getElementById('checkout-btn');
        const orderModal = document.getElementById('order-modal');
        const orderForm = document.getElementById('order-submit-form');

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (cart.length === 0) {
                    const emptyAlert = getUIText('Ваша корзина пуста!', 'Your cart is empty!');
                    alert(emptyAlert);
                    return;
                }

                const userRaw = localStorage.getItem('currentUser');
                if (!userRaw) {
                    const authAlert = getUIText('Для оформления заявки необходимо авторизоваться!', 'You must be logged in to place an order!');
                    alert(authAlert);
                    window.location.href = 'auth.html';
                    return;
                }

                if (orderModal) {
                    orderModal.style.display = 'flex';
                    const firstInput = orderForm?.querySelector('input, textarea');
                    if (firstInput) firstInput.focus();
                }
            });
        }

        if (orderModal) {
            orderModal.addEventListener('click', (e) => {
                const isCloseButton = e.target.closest('#order-modal-close, #order-modal-cancel');
                const isOverlay = e.target === orderModal;

                if (isCloseButton || isOverlay) {
                    orderModal.style.display = 'none';
                    if (orderForm) orderForm.reset();
                }
            });
        }

        if (orderForm) {
            orderForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                
                const addressEl = document.getElementById('order-address');
                const commentEl = document.getElementById('order-comment');
                const addressValue = addressEl ? addressEl.value.trim() : '';
                const commentValue = commentEl ? commentEl.value.trim() : '';

                const totalSum = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

                const orderData = {
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userPhone: currentUser.phone,
                    items: cart,
                    totalPrice: totalSum,
                    date: new Date().toLocaleString(),
                    address: addressValue,
                    comment: commentValue,
                    status: getUIText("Принята", "Received")
                };

                try {
                    const response = await fetch('http://localhost:3000/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });

                    if (response.ok) {
                        const successMsg = getUIText('Заявка успешно оформлена!', 'Order successfully placed!');
                        alert(successMsg);
                        localStorage.removeItem('cart');
                        orderModal.style.display = 'none';
                        orderForm.reset();
                        window.location.reload(); 
                    } else {
                        const errorMsg = getUIText('Не удалось сохранить заказ на сервере.', 'Failed to save order to server.');
                        alert(errorMsg);
                    }
                } catch (error) {
                    console.error('Ошибка при отправке заказа:', error);
                    const netErrorMsg = getUIText('Произошла ошибка при связи с сервером.', 'Network error while contacting server.');
                    alert(netErrorMsg);
                }
            });
        }

        // Первичный запуск
        renderCart();
    }
    
    // === 🎯 НОВОЕ: Слушаем событие смены языка и перерисовываем корзину ===
    window.addEventListener('languageChanged', () => {
        if (container) {
            renderCart();
        }
    });
});