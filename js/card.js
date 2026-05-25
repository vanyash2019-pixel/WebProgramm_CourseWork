document.addEventListener('DOMContentLoaded', () => {
    // === ОБЩИЕ ЭЛЕМЕНТЫ МОДАЛЬНОГО ОКНА (ДЛЯ КАТАЛОГА) ===
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

                if (modalTitle) modalTitle.textContent = product.name;
                if (modalImg) modalImg.src = product.img;
                if (modalPrice) modalPrice.textContent = parseInt(product.price).toLocaleString() + ' руб.';
                
                if (modalSpecs) {
                    modalSpecs.innerHTML = '';
                    product.features.forEach(feat => {
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

        // 2. Клик по кнопке "В корзину" на карточке каталога
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
        alert(`Товар "${product.name}" успешно добавлен в корзину!`);
    }

    if (modalToCartBtn) {
        modalToCartBtn.addEventListener('click', () => {
            if (currentItem) {
                const productToCart = {
                    id: currentItem.id,
                    name: currentItem.name,
                    price: parseInt(currentItem.price),
                    img: currentItem.img
                };
                addToCart(productToCart);
                modal.style.display = 'none';
            }
        });
    }

    // =========================================================
    // === ЛОГИКА СТРАНИЦЫ КОРЗИНЫ (ВЫПОЛНЯЕТСЯ ТОЛЬКО В КОРЗИНЕ) ===
    // =========================================================
    const container = document.getElementById('cart-container-js');
    const summaryPanel = document.getElementById('cart-summary-panel');
    const totalSumElement = document.getElementById('total-sum-js');

    // Если мы нашли контейнер корзины, значит мы на странице корзины — запускаем код
    if (container) {
        
        function renderCart() {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            container.innerHTML = '';
            
            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="cart-empty-msg">
                        <p style="margin-bottom: 15px;">Ваша корзина пуста.</p>
                        <a href="avtomatika.html" class="cart-submit-btn" style="text-decoration: none; display: inline-block;">Перейти в каталог</a>
                    </div>`;
                if (summaryPanel) summaryPanel.style.display = 'none';
                return;
            }

            if (summaryPanel) summaryPanel.style.display = 'flex';
            
            const table = document.createElement('div');
            table.classList.add('cart-table');
            
            let totalSum = 0;

            cart.forEach(item => {
                const cleanPrice = parseInt(String(item.price).replace(/\s+/g, '')) || 0;
                const itemTotal = cleanPrice * item.quantity;
                totalSum += itemTotal;

                const row = document.createElement('div');
                row.classList.add('cart-item');

                row.innerHTML = `
                    <div class="cart-item__product">
                        <div class="cart-item__img-wrapper">
                            <img src="${item.img}" alt="${item.name}" class="cart-item__img">
                        </div>
                        <div class="cart-item__info">
                            <h3 class="cart-item__name">${item.name}</h3>
                            <p class="cart-item__price-each">Цена за единицу: ${cleanPrice.toLocaleString()} руб.</p>
                        </div>
                    </div>
                    <div class="cart-item__actions">
                        <div class="counter-block">
                            <button class="counter-btn btn-minus" data-id="${item.id}">&minus;</button>
                            <div class="counter-value">${item.quantity}</div>
                            <button class="counter-btn btn-plus" data-id="${item.id}">&plus;</button>
                        </div>
                        <div class="cart-item__total">${itemTotal.toLocaleString()} руб.</div>
                        <button class="cart-item__remove" data-id="${item.id}">Удалить</button>
                    </div>
                `;
                table.appendChild(row);
            });

            container.appendChild(table);
            if (totalSumElement) totalSumElement.textContent = totalSum.toLocaleString();

            initCartEvents();
        }

        function initCartEvents() {
            // Кнопка Увеличить (+)
            document.querySelectorAll('.btn-plus').forEach(button => {
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
            document.querySelectorAll('.btn-minus').forEach(button => {
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
            document.querySelectorAll('.cart-item__remove').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    cart = cart.filter(item => String(item.id) !== String(id));
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                });
            });
        }

        // Кнопка "ОФОРМИТЬ ЗАЯВКУ"
   // === ЛОГИКА ОФОРМЛЕНИЯ ЗАКАЗА ЧЕРЕЗ МОДАЛЬНОЕ ОКНО ===
 // === ЛОГИКА ОФОРМЛЕНИЯ ЗАКАЗА ЧЕРЕЗ МОДАЛЬНОЕ ОКНО (ОБНОВЛЕННАЯ) ===
const checkoutBtn = document.getElementById('checkout-btn');
const orderModal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-submit-form');

// 1. Открытие модального окна
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Ваша корзина пуста!');
            return;
        }

        const userRaw = localStorage.getItem('currentUser');
        if (!userRaw) {
            alert('Для оформления заявки необходимо авторизоваться!');
            window.location.href = 'auth.html';
            return;
        }

        if (orderModal) {
            orderModal.style.display = 'flex';
            
            // Устанавливаем фокус на первое поле формы ввода
            const firstInput = orderForm?.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        } else {
            console.error('Ошибка: HTML-элемент #order-modal не найден на странице!');
        }
    });
}

// 2. Закрытие модального окна (через делегирование событий)
if (orderModal) {
    orderModal.addEventListener('click', (e) => {
        // Закрываем, если клик был по крестику, кнопке "Отмена" или по темному фону
        const isCloseButton = e.target.closest('#order-modal-close, #order-modal-cancel');
        const isOverlay = e.target === orderModal;

        if (isCloseButton || isOverlay) {
            orderModal.style.display = 'none';
            if (orderForm) orderForm.reset();
        }
    });
}

// 3. Отправка формы
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Безопасное получение значений из полей (если поля нет, будет пустая строка)
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
            status: "Принята"
        };

        try {
            const response = await fetch('http://localhost:3000/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                alert('Заявка успешно оформлена!');
                localStorage.removeItem('cart');
                orderModal.style.display = 'none';
                orderForm.reset();
                window.location.reload(); 
            } else {
                alert('Не удалось сохранить заказ на сервере.');
            }
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error);
            alert('Произошла ошибка при связи с сервером.');
        }
    });
}


        // Первичный запуск отрисовки при загрузке страницы корзины
        renderCart();
    }
});
