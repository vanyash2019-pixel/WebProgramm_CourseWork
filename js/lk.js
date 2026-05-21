document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('currentUser');
    const mainBlock = document.getElementById('lk-main-block');
    
    // 1. Проверяем, авторизован ли пользователь
    if (!userRaw) {
        if (mainBlock) {
            mainBlock.innerHTML = `
                <div class="access-denied" style="text-align: center; padding: 40px; width: 100%;">
                    <h2 style="font-size: 26px; color: #cc0000; margin-bottom: 15px; font-weight:700;">ДОСТУП ОГРАНИЧЕН</h2>
                    <p style="margin-bottom: 25px; color: #666; font-size: 15px;">Для просмотра личного кабинета необходимо авторизоваться на сайте.</p>
                    <a href="auth.html" style="color: #ffffff; background: #cc0000; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 13px; display: inline-block; letter-spacing:0.5px;">Войти в аккаунт</a>
                </div>
            `;
        }
        return;
    }

    const sessionUser = JSON.parse(userRaw);
    const API_URL = `http://localhost:3000/users/${sessionUser.id}`;
    const ORDERS_API_URL = `http://localhost:3000/orders`; // Путь к коллекции заказов

    // Элементы профиля
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');
    const roleDiv = document.getElementById('user-role');
    const profileForm = document.getElementById('profile-form');

    // Элементы переключения вкладок и контента
    const menuProfileBtn = document.getElementById('menu-profile-btn');
    const menuOrdersBtn = document.getElementById('menu-orders-btn');
    const profileContent = document.getElementById('lk-profile-content');
    const ordersContent = document.getElementById('lk-orders-content');
    const ordersListContainer = document.getElementById('orders-list-container');

    let userPasswordBackup = "";

    // 2. Подгружаем актуальные данные пользователя с json-server
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Ошибка сети');
            return res.json();
        })
        .then(userData => {
            nameInput.value = userData.name || '';
            emailInput.value = userData.email || '';
            phoneInput.value = userData.phone || '';
            roleDiv.textContent = userData.role === 'admin' ? 'Администратор' : 'Клиент ЕГДС';
            userPasswordBackup = userData.password;
        })
        .catch(err => {
            console.error('Не удалось загрузить профиль с сервера:', err);
            alert('Ошибка загрузки данных с сервера. Возможно, json-server не запущен.');
        });

    // 3. Логика переключения вкладок в Личном кабинете
    if (menuProfileBtn && menuOrdersBtn) {
        menuProfileBtn.addEventListener('click', () => {
            menuProfileBtn.classList.add('active');
            menuOrdersBtn.classList.remove('active');
            profileContent.style.display = 'block';
            ordersContent.style.display = 'none';
        });

        menuOrdersBtn.addEventListener('click', () => {
            menuOrdersBtn.classList.add('active');
            menuProfileBtn.classList.remove('active');
            profileContent.style.display = 'none';
            ordersContent.style.display = 'block';
            
            // Вызываем загрузку заказов при переходе на вкладку
            loadUserOrders();
        });
    }

    // 4. Функция загрузки и отображения заказов конкретного пользователя
    async function loadUserOrders() {
        ordersListContainer.innerHTML = '<p style="color: #666;">Загрузка истории заказов...</p>';
        
        try {
            const response = await fetch(`${ORDERS_API_URL}?userId=${sessionUser.id}`);
            if (!response.ok) throw new Error('Ошибка при получении списка заказов');
            
            const orders = await response.json();
            
            if (orders.length === 0) {
                ordersListContainer.innerHTML = '<p style="color: #666; font-size: 15px; padding: 10px 0;">У вас пока нет оформленных заказов или заявок.</p>';
                return;
            }
            
            let html = '';
            orders.forEach(order => {
                const itemsList = order.items.map(item => `${item.name} (${item.quantity} шт.)`).join(', ');
                
                html += `
                    <div class="order-item" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 4px; background: #fff;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                            <span style="color: #333;">Заказ №${order.id} от ${order.date}</span>
                            <span style="color: #cc0000;">${order.status || 'Принята'}</span>
                        </div>
                        <p style="margin: 5px 0; color: #555; font-size: 14px;"><strong>Товары:</strong> ${itemsList}</p>
                        <p style="margin: 5px 0; color: #111; font-size: 15px; font-weight: bold;"><strong>Сумма заказа:</strong> ${order.totalPrice.toLocaleString()} руб.</p>
                    </div>
                `;
            });
            
            ordersListContainer.innerHTML = html;
            
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            ordersListContainer.innerHTML = '<p style="color: #cc0000;">Не удалось загрузить историю заказов.</p>';
        }
    }

    // =========================================================
    // 5. Обработка отправки формы профиля (Сохранение изменений)
    // =========================================================
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedName = nameInput.value.trim();
            const updatedEmail = emailInput.value.trim().toLowerCase();
            const updatedPhone = phoneInput.value.trim();

            // --- НОВАЯ ВАЛИДАЦИЯ ДЛИНЫ ТЕЛЕФОНА ---
            if (updatedPhone.length > 13) {
                alert('Ошибка: Номер телефона не может быть длиннее 13 символов!');
                return;
            }

            if (updatedPhone.length < 9) { // Небольшая проверка на слишком короткий номер
                alert('Ошибка: Номер телефона слишком короткий!');
                return;
            }

            try {
                const checkResponse = await fetch('http://localhost:3000/users');
                const allUsers = await checkResponse.json();

                const emailConflict = allUsers.some(u => u.email === updatedEmail && u.id !== sessionUser.id);
                if (emailConflict) {
                    alert('Этот E-mail уже используется другим пользователем!');
                    return;
                }

                const updatedData = {
                    id: sessionUser.id,
                    name: updatedName,
                    email: updatedEmail,
                    phone: updatedPhone,
                    password: userPasswordBackup,
                    role: sessionUser.role
                };

                const response = await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: updatedData.id,
                        name: updatedData.name,
                        email: updatedData.email,
                        role: updatedData.role
                    }));

                    if (typeof updateAuthHeader === 'function') {
                        updateAuthHeader();
                    }

                    alert('Данные профиля успешно обновлены!');
                } else {
                    alert('Не удалось сохранить данные на сервере.');
                }

            } catch (error) {
                console.error('Ошибка при更新 профиля:', error);
                alert('Произошла ошибка при связи с сервером.');
            }
        });
    }

    // 6. Обработчик кнопки выхода внутри ЛК
    const internalLogoutBtn = document.getElementById('lk-internal-logout');
    if (internalLogoutBtn) {
        internalLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            alert('Вы вышли из профиля.');
            window.location.href = 'index.html';
        });
    }
});