document.addEventListener('DOMContentLoaded', () => {
    
    const API_URL = 'http://localhost:3000';

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

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С КОРЗИНОЙ НА СЕРВЕРЕ ===
    
    // Получить текущего пользователя
    function getCurrentUser() {
        const userRaw = localStorage.getItem('currentUser');
        return userRaw ? JSON.parse(userRaw) : null;
    }

    // Получить корзину пользователя с сервера
    async function getCartFromServer() {
        const user = getCurrentUser();
        if (!user) return null;

        try {
            const response = await fetch(`${API_URL}/carts?userId=${user.id}`);
            if (!response.ok) return null;
            const carts = await response.json();
            // Возвращаем первую найденную корзину (должна быть одна на пользователя)
            return carts.length > 0 ? carts[0] : null;
        } catch (error) {
            console.error('Ошибка получения корзины с сервера:', error);
            return null;
        }
    }

    // Создать новую корзину на сервере
    async function createCartOnServer(items = []) {
        const user = getCurrentUser();
        if (!user) return null;

        try {
            const response = await fetch(`${API_URL}/carts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    items: items
                })
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Ошибка создания корзины на сервере:', error);
            return null;
        }
    }

    // Обновить корзину на сервере (PATCH)
    async function updateCartOnServer(cartId, items) {
        try {
            const response = await fetch(`${API_URL}/carts/${cartId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: items })
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления корзины на сервере:', error);
            return null;
        }
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
                const response = await fetch(`${API_URL}/products/${id}`);
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
                const response = await fetch(`${API_URL}/products/${id}`);
                const product = await response.json();
                
                const productToCart = {
                    id: product.id,
                    name: product.name,
                    nameEn: product.nameEn,
                    price: parseInt(product.price),
                    img: product.img,
                    quantity: 1
                };
                
                await addToCart(productToCart);
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

    // === ФУНКЦИЯ ДОБАВЛЕНИЯ В КОРЗИНУ (ТЕПЕРЬ НА СЕРВЕРЕ) ===
    async function addToCart(product) {
        const user = getCurrentUser();
        if (!user) {
            alert(getUIText(
                'Чтобы добавить товар в корзину, войдите в аккаунт.',
                'Please log in to add items to cart.'
            ));
            window.location.href = 'auth.html';
            return;
        }

        // Получаем корзину пользователя
        let cart = await getCartFromServer();

        if (!cart) {
            // Если корзины нет — создаём новую с этим товаром
            cart = await createCartOnServer([product]);
        } else {
            // Если корзина есть — добавляем/обновляем товар
            const items = cart.items || [];
            const existing = items.find(item => String(item.id) === String(product.id));
            
            if (existing) {
                existing.quantity += 1;
            } else {
                items.push(product);
            }
            
            cart = await updateCartOnServer(cart.id, items);
        }

        if (cart) {
            const productName = getProductField(product, 'name', 'nameEn');
            const alertMsg = getUIText(
                `Товар "${productName}" успешно добавлен в корзину!`, 
                `Item "${productName}" successfully added to cart!`
            );
            alert(alertMsg);
        } else {
            alert(getUIText(
                'Не удалось добавить товар в корзину. Проверьте соединение с сервером.',
                'Failed to add item to cart. Check server connection.'
            ));
        }
    }

    if (modalToCartBtn) {
        modalToCartBtn.addEventListener('click', async () => {
            if (currentItem) {
                const productToCart = {
                    id: currentItem.id,
                    name: currentItem.name,
                    nameEn: currentItem.nameEn,
                    price: parseInt(currentItem.price),
                    img: currentItem.img,
                    quantity: 1
                };
                await addToCart(productToCart);
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
        
        async function renderCart() {
            container.innerHTML = '<p style="text-align:center; padding:20px;">Загрузка...</p>';
            
            // Получаем корзину с сервера
            const cart = await getCartFromServer();
            const items = (cart && cart.items) ? cart.items : [];

            container.innerHTML = '';
            
            if (items.length === 0) {
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

            items.forEach(item => {
                const cleanPrice = parseInt(String(item.price).replace(/\s+/g, '')) || 0;
                const itemTotal = cleanPrice * item.quantity;
                totalSum += itemTotal;

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

            initCartEvents(cart.id);
        }

        function initCartEvents(cartId) {
            // Кнопка Увеличить (+)
            container.querySelectorAll('.btn-plus').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const cart = await getCartFromServer();
                    if (!cart) return;
                    
                    const items = cart.items || [];
                    const item = items.find(p => String(p.id) === String(id));
                    if (item) {
                        item.quantity += 1;
                        await updateCartOnServer(cartId, items);
                        renderCart();
                    }
                });
            });

            // Кнопка Уменьшить (-)
            container.querySelectorAll('.btn-minus').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const cart = await getCartFromServer();
                    if (!cart) return;
                    
                    let items = cart.items || [];
                    const item = items.find(p => String(p.id) === String(id));
                    if (item) {
                        if (item.quantity > 1) {
                            item.quantity -= 1;
                        } else {
                            items = items.filter(p => String(p.id) !== String(id));
                        }
                        await updateCartOnServer(cartId, items);
                        renderCart();
                    }
                });
            });

            // Кнопка Удалить
            container.querySelectorAll('.cart-item__remove').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const cart = await getCartFromServer();
                    if (!cart) return;
                    
                    const items = (cart.items || []).filter(item => String(item.id) !== String(id));
                    await updateCartOnServer(cartId, items);
                    renderCart();
                });
            });
        }

        // === ОФОРМЛЕНИЕ ЗАКАЗА ===
        const checkoutBtn = document.getElementById('checkout-btn');
        const orderModal = document.getElementById('order-modal');
        const orderForm = document.getElementById('order-submit-form');

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async () => {
                const cart = await getCartFromServer();
                const items = (cart && cart.items) ? cart.items : [];
                
                if (items.length === 0) {
                    alert(getUIText('Ваша корзина пуста!', 'Your cart is empty!'));
                    return;
                }

                const user = getCurrentUser();
                if (!user) {
                    alert(getUIText(
                        'Для оформления заявки необходимо авторизоваться!', 
                        'You must be logged in to place an order!'
                    ));
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

                const cart = await getCartFromServer();
                const items = (cart && cart.items) ? cart.items : [];
                const user = getCurrentUser();
                
                const addressEl = document.getElementById('order-address');
                const commentEl = document.getElementById('order-comment');
                const addressValue = addressEl ? addressEl.value.trim() : '';
                const commentValue = commentEl ? commentEl.value.trim() : '';

                const totalSum = items.reduce((sum, item) => sum + (parseInt(item.price) || 0) * item.quantity, 0);

                const orderData = {
                    userId: user.id,
                    userName: user.name,
                    userPhone: user.phone,
                    items: items,
                    totalPrice: totalSum,
                    date: new Date().toLocaleString(),
                    address: addressValue,
                    comment: commentValue,
                    status: getUIText("Принята", "Received")
                };

                try {
                    const response = await fetch(`${API_URL}/orders`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });

                    if (response.ok) {
                        // Очищаем корзину на сервере
                        if (cart) {
                            await updateCartOnServer(cart.id, []);
                        }
                        
                        alert(getUIText('Заявка успешно оформлена!', 'Order successfully placed!'));
                        orderModal.style.display = 'none';
                        orderForm.reset();
                        renderCart(); // Перерисовываем пустую корзину
                    } else {
                        alert(getUIText(
                            'Не удалось сохранить заказ на сервере.', 
                            'Failed to save order to server.'
                        ));
                    }
                } catch (error) {
                    console.error('Ошибка при отправке заказа:', error);
                    alert(getUIText(
                        'Произошла ошибка при связи с сервером.', 
                        'Network error while contacting server.'
                    ));
                }
            });
        }

        // Первичный запуск
        renderCart();
    }
    
    // === 🎯 Слушаем событие смены языка и перерисовываем корзину ===
    window.addEventListener('languageChanged', () => {
        if (container) {
            renderCart();
        }
    });
});