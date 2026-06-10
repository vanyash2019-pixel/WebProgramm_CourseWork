// js/lk.js

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДА СТАТУСОВ ===
function getStatusText(status) {
    const translations = {
        'Принята': { ru: 'Принята', en: 'Received' },
        'В обработке': { ru: 'В обработке', en: 'Processing' },
        'Готов': { ru: 'Готов', en: 'Ready' },
        'Отменен': { ru: 'Отменен', en: 'Cancelled' }
    };
    const isEn = document.body.classList.contains('lang-en');
    const t = translations[status];
    return t ? (isEn ? t.en : t.ru) : status;
}

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДА ТЕКСТОВ ИНТЕРФЕЙСА ===
function getUIText(ru, en) {
    return document.body.classList.contains('lang-en') ? en : ru;
}

document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('currentUser');
    const mainBlock = document.getElementById('lk-main-block');
    
    // 1. Проверяем, авторизован ли пользователь
    if (!userRaw) {
        if (mainBlock) {
            // === ИСПРАВЛЕНО: Используем переводы ===
            const title = getUIText('ДОСТУП ОГРАНИЧЕН', 'ACCESS DENIED');
            const msg = getUIText(
                'Для просмотра личного кабинета необходимо авторизоваться на сайте.',
                'You must be logged in to view your personal account.'
            );
            const btn = getUIText('Войти в аккаунт', 'Log In');
            
            mainBlock.innerHTML = `
                <div class="access-denied">
                    <h2>${title}</h2>
                    <p>${msg}</p>
                    <a href="auth.html" class="btn-login">${btn}</a>
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
                // === ИСПРАВЛЕНО: Перевод роли ===
                const roleText = (userData.role === 'admin' || userData.role === 'administrator') 
                    ? getUIText('Администратор', 'Administrator')
                    : getUIText('Клиент ЕГДС', 'EGDS Customer');
                roleDiv.textContent = roleText;
            }
            userPasswordBackup = userData.password;
        })
        .catch(err => {
            console.error('Не удалось загрузить профиль с сервера:', err);
            // === ИСПРАВЛЕНО: Перевод ошибки ===
            const errorMsg = getUIText(
                'Ошибка загрузки данных с сервера. Возможно, json-server не запущен.',
                'Failed to load data from server. Maybe json-server is not running.'
            );
            alert(errorMsg);
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
        
        // === ИСПРАВЛЕНО: Перевод сообщения загрузки ===
        const loadingMsg = getUIText('Загрузка истории заказов...', 'Loading order history...');
        ordersListContainer.innerHTML = `<p class="lk-status-message">${loadingMsg}</p>`;
        
        try {
            const response = await fetch(`${ORDERS_API_URL}?userId=${sessionUser.id}`);
            if (!response.ok) throw new Error('Ошибка при получении списка заказов');
            
            const orders = await response.json();
            
            if (orders.length === 0) {
                // === ИСПРАВЛЕНО: Перевод сообщения "пусто" ===
                const emptyMsg = getUIText(
                    'У вас пока нет оформленных заказов или заявок.',
                    'You have no orders or requests yet.'
                );
                ordersListContainer.innerHTML = `<p class="lk-status-message">${emptyMsg}</p>`;
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
            
            // === ИСПРАВЛЕНО: Переводы для карточек заказов ===
            const currency = getUIText(' руб.', ' RUB');
            const itemsLabel = getUIText('Товары:', 'Items:');
            const totalLabel = getUIText('Сумма заказа:', 'Order total:');
            const statusHistoryBtn = getUIText('История статусов', 'Status history');
            const cancelBtn = getUIText('Отменить заказ', 'Cancel order');
            const orderPrefix = getUIText('Заказ №', 'Order #');
            const orderFrom = getUIText('от', 'from');
            
            ordersListContainer.innerHTML = orders.map(order => {
                // === ИСПРАВЛЕНО: Перевод названий товаров в заказе ===
                const itemsList = order.items.map(item => {
                    // Если есть nameEn и включен английский — используем его
                    const itemName = (document.body.classList.contains('lang-en') && item.nameEn) 
                        ? item.nameEn 
                        : item.name;
                    return `${itemName} (${item.quantity} шт.)`;
                }).join(', ');
                
                const currentStatus = getStatusText(order.status || 'Принята');
                const statusClass = getStatusClass(order.status || 'Принята');
                
                // Кнопка «Отменить заказ» показывается, только если он не Готов и не Отменен
                const showCancelBtn = (order.status !== 'Отменен' && order.status !== 'Готов');
                const cancelBtnHtml = showCancelBtn 
                    ? `<button class="order-cancel-btn" onclick="cancelOrder('${order.id}')">${cancelBtn}</button>` 
                    : '';
                
                return `
                    <div class="order-item">
                        <div class="order-item__header">
                            <span class="order-item__header-title">${orderPrefix}${order.id} ${orderFrom} ${order.date}</span>
                            <span class="${statusClass}">${currentStatus}</span>
                        </div>
                        <p class="order-item__products"><strong>${itemsLabel}</strong> ${itemsList}</p>
                        <p class="order-item__total"><strong>${totalLabel}</strong> ${order.totalPrice.toLocaleString()}${currency}</p>
                        
                        <div class="order-item__actions">
                            <button class="order-status-btn" onclick="openStatusModal('${order.status || 'Принята'}', '${order.date}')">${statusHistoryBtn}</button>
                            ${cancelBtnHtml}
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
            // === ИСПРАВЛЕНО: Перевод ошибки ===
            const errorMsg = getUIText('Не удалось загрузить история заказов.', 'Failed to load order history.');
            ordersListContainer.innerHTML = `<p class="lk-status-message lk-error-message">${errorMsg}</p>`;
        }
    }

    // === ФУНКЦИЯ ОТМЕНЫ ЗАКАЗА ===
    window.cancelOrder = async function(orderId) {
        // === ИСПРАВЛЕНО: Перевод подтверждения ===
        const confirmMsg = getUIText(
            'Вы уверены, что хотите отменить этот заказ?',
            'Are you sure you want to cancel this order?'
        );
        if (!confirm(confirmMsg)) return;

        try {
            const response = await fetch(`${ORDERS_API_URL}/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Отменен' })
            });

            if (response.ok) {
                // === ИСПРАВЛЕНО: Перевод успеха ===
                const successMsg = getUIText('Заказ успешно отменен!', 'Order successfully cancelled!');
                alert(successMsg);
                loadUserOrders();
            } else {
                const errorMsg = getUIText('Не удалось отменить заказ на сервере.', 'Failed to cancel order on server.');
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Ошибка при отмене заказа:', error);
            const netErrorMsg = getUIText('Произошла ошибка при связи с сервером.', 'Network error while contacting server.');
            alert(netErrorMsg);
        }
    };

    // 5. Сохранение изменений профиля
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updatedName = nameInput.value.trim();
            const updatedEmail = emailInput.value.trim().toLowerCase();
            const updatedPhone = phoneInput.value.trim();

            if (updatedPhone.length > 13) {
                // === ИСПРАВЛЕНО: Перевод ошибки ===
                const phoneLongMsg = getUIText(
                    'Ошибка: Номер телефона не может быть длиннее 13 символов!',
                    'Error: Phone number cannot be longer than 13 characters!'
                );
                alert(phoneLongMsg);
                return;
            }

            if (updatedPhone.length < 9) {
                const phoneShortMsg = getUIText(
                    'Ошибка: Номер телефона слишком короткий!',
                    'Error: Phone number is too short!'
                );
                alert(phoneShortMsg);
                return;
            }

            try {
                const checkResponse = await fetch('http://localhost:3000/users');
                const allUsers = await checkResponse.json();

                const emailConflict = allUsers.some(u => u.email === updatedEmail && u.id !== sessionUser.id);
                if (emailConflict) {
                    // === ИСПРАВЛЕНО: Перевод ошибки ===
                    const emailTakenMsg = getUIText(
                        'Этот E-mail уже используется другим пользователем!',
                        'This email is already used by another user!'
                    );
                    alert(emailTakenMsg);
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

                    // === ИСПРАВЛЕНО: Перевод успеха ===
                    const successMsg = getUIText('Данные профиля успешно обновлены!', 'Profile data successfully updated!');
                    alert(successMsg);
                } else {
                    const saveErrorMsg = getUIText('Не удалось сохранить данные на сервере.', 'Failed to save data to server.');
                    alert(saveErrorMsg);
                }

            } catch (error) {
                console.error('Ошибка при обновлении профиля:', error);
                const netErrorMsg = getUIText('Произошла ошибка при связи с сервером.', 'Network error while contacting server.');
                alert(netErrorMsg);
            }
        });
    }

    // 6. Обработчик кнопки выхода
    const internalLogoutBtn = document.getElementById('lk-internal-logout');
    if (internalLogoutBtn) {
        internalLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            // === ИСПРАВЛЕНО: Перевод сообщения ===
            const logoutMsg = getUIText('Вы вышли из профиля.', 'You have logged out.');
            alert(logoutMsg);
            window.location.href = 'index.html';
        });
    }
    
    // === 🎯 НОВОЕ: Слушаем событие смены языка ===
    window.addEventListener('languageChanged', () => {
        // Если открыта вкладка заказов — перерисовываем их с новыми переводами
        if (ordersContent && ordersContent.style.display !== 'none') {
            loadUserOrders();
        }
        // Обновляем роль пользователя (если данные уже загружены)
        if (roleDiv && sessionUser) {
            fetch(API_URL)
                .then(res => res.json())
                .then(userData => {
                    const roleText = (userData.role === 'admin' || userData.role === 'administrator') 
                        ? getUIText('Администратор', 'Administrator')
                        : getUIText('Клиент ЕГДС', 'EGDS Customer');
                    roleDiv.textContent = roleText;
                });
        }
    });
});

// === ЛОГИКА МОДАЛЬНОГО ОКНА СТАТУСОВ ===
window.openStatusModal = function(currentStatus, orderDate) {
    const modal = document.getElementById('status-modal');
    const timelineContainer = document.getElementById('status-timeline-container');

    const standardFlow = ['Принята', 'В обработке', 'Готов'];
    
    // === ИСПРАВЛЕНО: Переводы для модального окна ===
    const cancelledText = getUIText('Отменен', 'Cancelled');
    const orderCancelledText = getUIText('Заказ аннулирован', 'Order cancelled');
    const currentStageText = getUIText('Текущий этап', 'Current stage');
    
    let html = '<div class="timeline">';

    if (currentStatus === 'Отменен') {
        html += `
            <div class="timeline-item active">
                <div class="timeline-title">${getStatusText('Принята')}</div>
                <div class="timeline-date">${orderDate}</div>
            </div>
            <div class="timeline-item cancelled active">
                <div class="timeline-title">${cancelledText}</div>
                <div class="timeline-date">${orderCancelledText}</div>
            </div>
        `;
    } else {
        let currentIndex = standardFlow.indexOf(currentStatus);
        
        standardFlow.forEach((step, index) => {
            let isActiveClass = (index <= currentIndex) ? 'active' : '';
            
            let dateHtml = '';
            if (index === 0) {
                dateHtml = `<div class="timeline-date">${orderDate}</div>`;
            } else if (index === currentIndex) {
                dateHtml = `<div class="timeline-date">${currentStageText}</div>`;
            }
            
            html += `
                <div class="timeline-item ${isActiveClass}">
                    <div class="timeline-title">${getStatusText(step)}</div>
                    ${dateHtml}
                </div>
            `;
        });
    }

    html += '</div>';
    timelineContainer.innerHTML = html;
    modal.style.display = 'flex';
};

window.closeStatusModal = function() {
    document.getElementById('status-modal').style.display = 'none';
};

window.onclick = function(event) {
    const modal = document.getElementById('status-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};