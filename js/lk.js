document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('currentUser');
    const mainBlock = document.getElementById('lk-main-block');
    
    // 1. Проверяем, авторизован ли пользователь
    if (!userRaw) {
        if (mainBlock) {
            mainBlock.innerHTML = `
                <div class="access-denied">
                    <h2>ДОСТУП ОГРАНИЧЕН</h2>
                    <p>Для просмотра личного кабинета необходимо авторизоваться на сайте.</p>
                    <a href="auth.html" class="btn-login">Войти в аккаунт</a>
                </div>
            `;
        }
        return;
    }

    const sessionUser = JSON.parse(userRaw);
    const API_URL = `http://localhost:3000/users/${sessionUser.id}`;
    const ORDERS_API_URL = `http://localhost:3000/orders`; 

    // Элементы профиля
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const phoneInput = document.getElementById('user-phone');
    const roleDiv = document.getElementById('user-role');
    const profileForm = document.getElementById('profile-form');

    // Элементы переключения вкладок
    const menuProfileBtn = document.getElementById('menu-profile-btn');
    const menuOrdersBtn = document.getElementById('menu-orders-btn');
    const profileContent = document.getElementById('lk-profile-content');
    const ordersContent = document.getElementById('lk-orders-content');
    const ordersListContainer = document.getElementById('orders-list-container');

    let userPasswordBackup = "";

    // 2. Подгружаем актуальные данные пользователя
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error('Ошибка сети');
            return res.json();
        })
        .then(userData => {
            if (nameInput) nameInput.value = userData.name || '';
            if (emailInput) emailInput.value = userData.email || '';
            if (phoneInput) phoneInput.value = userData.phone || '';
            
            if (roleDiv) {
                roleDiv.textContent = (userData.role === 'admin' || userData.role === 'administrator') 
                    ? 'Администратор' 
                    : 'Клиент ЕГДС';
            }
            userPasswordBackup = userData.password;
        })
        .catch(err => {
            console.error('Не удалось загрузить профиль с сервера:', err);
            alert('Ошибка загрузки данных с сервера. Возможно, json-server не запущен.');
        });

    // 3. Логика переключения вкладок
    if (menuProfileBtn && menuOrdersBtn) {
        menuProfileBtn.addEventListener('click', () => {
            menuProfileBtn.classList.add('active');
            menuOrdersBtn.classList.remove('active');
            if (profileContent) profileContent.style.display = 'block';
            if (ordersContent) ordersContent.style.display = 'none';
        });

        menuOrdersBtn.addEventListener('click', () => {
            menuOrdersBtn.classList.add('active');
            menuProfileBtn.classList.remove('active');
            if (profileContent) profileContent.style.display = 'none';
            if (ordersContent) ordersContent.style.display = 'block';
            
            loadUserOrders();
        });
    }

    // 4. Функция загрузки и отображения заказов
    async function loadUserOrders() {
        if (!ordersListContainer) return;
        ordersListContainer.innerHTML = '<p class="lk-status-message">Загрузка истории заказов...</p>';
        
        try {
            const response = await fetch(`${ORDERS_API_URL}?userId=${sessionUser.id}`);
            if (!response.ok) throw new Error('Ошибка при получении списка заказов');
            
            const orders = await response.json();
            
            if (orders.length === 0) {
                ordersListContainer.innerHTML = '<p class="lk-status-message">У вас пока нет оформленных заказов или заявок.</p>';
                return;
            }

            // Функция определения класса цвета для статуса
            const getStatusClass = (status) => {
                switch(status) {
                    case 'Принята': return 'status--accepted';      
                    case 'В обработке': return 'status--processing';  
                    case 'Готов': return 'status--ready';        
                    case 'Отменен': return 'status--cancelled';      
                    default: return 'status--default';             
                }
            };
            
            ordersListContainer.innerHTML = orders.map(order => {
                const itemsList = order.items.map(item => `${item.name} (${item.quantity} шт.)`).join(', ');
                const currentStatus = order.status || 'Приняta';
                const statusClass = getStatusClass(currentStatus);
                
             return `
    <div class="order-item">
        <div class="order-item__header">
            <span class="order-item__header-title">Заказ №${order.id} от ${order.date}</span>
            <span class="${statusClass}">${currentStatus}</span>
        </div>
        <p class="order-item__products"><strong>Товары:</strong> ${itemsList}</p>
        <p class="order-item__total"><strong>Сумма заказа:</strong> ${order.totalPrice.toLocaleString()} руб.</p>
        
       <button class="order-status-btn" onclick="openStatusModal('${currentStatus}', '${order.date}')">История статусов</button>
    </div>
`;
            }).join('');
            
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            ordersListContainer.innerHTML = '<p class="lk-status-message lk-error-message">Не удалось загрузить историю заказов.</p>';
        }
    }

    // 5. Сохранение изменений профиля
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedName = nameInput.value.trim();
            const updatedEmail = emailInput.value.trim().toLowerCase();
            const updatedPhone = phoneInput.value.trim();

            if (updatedPhone.length > 13) {
                alert('Ошибка: Номер телефона не может быть длиннее 13 символов!');
                return;
            }

            if (updatedPhone.length < 9) {
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
                console.error('Ошибка при обновлении профиля:', error);
                alert('Произошла ошибка при связи с сервером.');
            }
        });
    }

    // 6. Обработчик кнопки выхода
    const internalLogoutBtn = document.getElementById('lk-internal-logout');
    if (internalLogoutBtn) {
        internalLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            alert('Вы вышли из профиля.');
            window.location.href = 'index.html';
        });
    }
});
// Открытие окна (теперь принимает и статус, и дату заказа)
window.openStatusModal = function(currentStatus, orderDate) {
    const modal = document.getElementById('status-modal');
    const timelineContainer = document.getElementById('status-timeline-container');

    const standardFlow = ['Принята', 'В обработке', 'Готов'];
    let html = '<div class="timeline">';

    if (currentStatus === 'Отменен') {
        html += `
            <div class="timeline-item active">
                <div class="timeline-title">Принята</div>
                <div class="timeline-date">${orderDate}</div>
            </div>
            <div class="timeline-item cancelled">
                <div class="timeline-title">Отменен</div>
            </div>
        `;
    } else {
        let currentIndex = standardFlow.indexOf(currentStatus);
        
        standardFlow.forEach((step, index) => {
            let isActiveClass = (index <= currentIndex) ? 'active' : '';
            
            // Логика вывода дат
            let dateHtml = '';
            if (index === 0) {
                // На первый шаг всегда ставим дату создания заказа
                dateHtml = `<div class="timeline-date">${orderDate}</div>`;
            } else if (index === currentIndex) {
                // На текущий активный шаг пишем статус
                dateHtml = `<div class="timeline-date">Текущий этап</div>`;
            }
            
            html += `
                <div class="timeline-item ${isActiveClass}">
                    <div class="timeline-title">${step}</div>
                    ${dateHtml}
                </div>
            `;
        });
    }

    html += '</div>';
    timelineContainer.innerHTML = html;
    modal.style.display = 'flex';
};

// Железобетонная функция закрытия по крестику
window.closeStatusModal = function() {
    document.getElementById('status-modal').style.display = 'none';
};

// Закрытие по клику мимо окна (по темному фону)
window.onclick = function(event) {
    const modal = document.getElementById('status-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};