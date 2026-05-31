// js/admin.js

const API_URL = 'http://localhost:3000';

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДОВ ===
function getUIText(ru, en) {
    return document.body.classList.contains('lang-en') ? en : ru;
}

// === ПЕРЕВОД СТАТУСОВ ЗАКАЗА ===
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

document.addEventListener('DOMContentLoaded', () => {
    // 1. ЗАЩИТА СТРАНИЦЫ
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'administrator')) {
        document.body.innerHTML = `
            <div class="access-denied-container">
                <div class="access-denied-icon"><i class="fa fa-lock"></i></div>
                <div class="access-denied-title">${getUIText('Доступ запрещен', 'Access Denied')}</div>
                <div class="access-denied-text">${getUIText('У вас нет прав для просмотра этой страницы.', 'You do not have permission to view this page.')}</div>
                <a href="index.html" class="btn-admin btn-admin--approve" style="text-decoration: none;">${getUIText('Вернуться на главную', 'Back to Home')}</a>
            </div>
        `;
        return;
    }

    // Запускаем загрузку данных
    loadAdminData();
    
    // === 🎯 Слушаем событие смены языка ===
    window.addEventListener('languageChanged', () => {
        loadAdminData(); // Перезагружаем данные с новыми переводами
    });
});

async function loadAdminData() {
    try {
        const [ordersRes, reviewsRes] = await Promise.all([
            fetch(`${API_URL}/orders`),
            fetch(`${API_URL}/reviews`)
        ]);

        if (!ordersRes.ok || !reviewsRes.ok) {
            throw new Error('Один из запросов вернул ошибку сервера');
        }

        const orders = await ordersRes.json();
        const reviews = await reviewsRes.json();

        renderAdminOrders(orders);
        renderAdminReviews(reviews);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        
        const ordersContainer = document.getElementById('admin-orders-list');
        const reviewsContainer = document.getElementById('admin-reviews-list');
        
        // === ИСПРАВЛЕНО: Перевод сообщения об ошибке ===
        const errorMsg = getUIText(
            'Не удалось загрузить данные с сервера. Проверьте запущен ли бэкенд.',
            'Failed to load data from server. Check if backend is running.'
        );
        const errorHTML = `<tr><td colspan="100%" style="text-align:center; color:var(--primary-red); padding: 20px;">
                            <i class="fa fa-exclamation-triangle"></i> ${errorMsg}
                           </td></tr>`;
        
        if (ordersContainer) ordersContainer.innerHTML = errorHTML;
        if (reviewsContainer) reviewsContainer.innerHTML = errorHTML;
    }
}

// ==========================================
// ЛОГИКА ЗАКАЗОВ
// ==========================================
function renderAdminOrders(orders) {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    if (orders.length === 0) {
        // === ИСПРАВЛЕНО: Перевод сообщения "нет заказов" ===
        const noOrdersMsg = getUIText('Нет активных заказов.', 'No active orders.');
        container.innerHTML = `<p style="color: #666; padding: 15px;">${noOrdersMsg}</p>`;
        return;
    }

    const statuses = ['Принята', 'В обработке', 'Готов', 'Отменен'];
    
    // === Переводы для интерфейса заказов ===
    const orderPrefix = getUIText('Заказ №', 'Order #');
    const clientLabel = getUIText('Клиент', 'Client');
    const addressLabel = getUIText('Адрес', 'Address');
    const itemsLabel = getUIText('Товары', 'Items');
    const commentLabel = getUIText('Комментарий', 'Comment');
    const totalLabel = getUIText('Сумма', 'Total');
    const currency = getUIText(' руб.', ' RUB');
    const changeStatusLabel = getUIText('Изменить статус:', 'Change status:');
    const deleteBtn = getUIText('Удалить', 'Delete');

    try {
        container.innerHTML = orders.map(order => {
            const currentStatus = order.status || 'Принята';
            const userName = order.userName || getUIText('Не указан', 'Not specified');
            const address = order.address || getUIText('Не указан', 'Not specified');
            const commentText = order.comment || getUIText('Нет комментария', 'No comment');
            
            // === Перевод названий товаров в заказе ===
            const itemsText = (order.items && Array.isArray(order.items)) 
                ? order.items.map(i => {
                    const itemName = (document.body.classList.contains('lang-en') && i.nameEn) ? i.nameEn : i.name;
                    return `${itemName} (${i.quantity} ${getUIText('шт.', 'pcs')})`;
                }).join(', ') 
                : getUIText('Товары не найдены', 'Items not found');

            return `
                <div class="admin-card" id="order-card-${order.id}" style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                        <strong>${orderPrefix}${order.id} | ${clientLabel}: ${userName} (ID: ${order.userId})</strong>
                        <span style="color: #666; font-size: 14px;"><i class="fa fa-clock-o"></i> ${order.date}</span>
                    </div>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>${addressLabel}:</strong> ${address}</p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>${itemsLabel}:</strong> ${itemsText}</p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>${commentLabel}:</strong> ${commentText}</p>
                    <p style="margin: 8px 0; font-size: 15px;"><strong>${totalLabel}:</strong> <span style="color: var(--primary-blue); font-weight: 700;">${order.totalPrice}${currency}</span></p>
                    
                    <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center; background: var(--light-gray); padding: 10px; border-radius: 4px;">
                        <label style="font-size: 14px; font-weight: 500;">${changeStatusLabel}</label>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 6px 12px; border-radius: 4px; border: 1px solid var(--border-color); outline: none; font-family: Roboto;">
                            ${statuses.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${getStatusText(s)}</option>`).join('')}
                        </select>
                        
                        <button onclick="deleteOrder('${order.id}')" class="btn-admin btn-admin--delete" style="margin-left: auto;" title="${deleteBtn}">
                            <i class="fa fa-trash"></i> ${deleteBtn}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error("Ошибка при отрисовке заказов:", e);
        const renderErrorMsg = getUIText('Ошибка отображения заказов. Проверьте консоль.', 'Error displaying orders. Check console.');
        container.innerHTML = `<p style="color: red; padding: 15px;">${renderErrorMsg}</p>`;
    }
}

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error('Ошибка обновления');
    } catch (err) {
        console.error(err);
        // === ИСПРАВЛЕНО: Перевод ошибки ===
        alert(getUIText('Ошибка при обновлении статуса заказа', 'Error updating order status'));
    }
};

window.deleteOrder = async function(orderId) {
    // === ИСПРАВЛЕНО: Перевод подтверждения ===
    const confirmMsg = getUIText(
        'Вы уверены, что хотите безвозвратно удалить этот заказ?',
        'Are you sure you want to permanently delete this order?'
    );
    if (confirm(confirmMsg)) {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Ошибка удаления заказа');
            
            const card = document.getElementById(`order-card-${orderId}`);
            if (card) {
                card.style.opacity = '0';
                card.style.transition = 'opacity 0.3s ease';
                setTimeout(() => card.remove(), 300);
            } else {
                loadAdminData();
            }
        } catch (err) {
            console.error(err);
            alert(getUIText('Ошибка при удалении заказа', 'Error deleting order'));
        }
    }
};

// ==========================================
// ЛОГИКА ОТЗЫВОВ
// ==========================================
function renderAdminReviews(reviews) {
    const container = document.getElementById('admin-reviews-list');
    if (!container) return;

    if (reviews.length === 0) {
        // === ИСПРАВЛЕНО: Перевод сообщения "нет отзывов" ===
        const noReviewsMsg = getUIText('Отзывов пока нет.', 'No reviews yet.');
        container.innerHTML = `<tr><td colspan="3" style="text-align:center; color: #666; padding: 20px;">${noReviewsMsg}</td></tr>`;
        return;
    }

    // === Переводы для интерфейса отзывов ===
    const saveBtn = getUIText('Сохранить', 'Save');
    const deleteBtn = getUIText('Удалить', 'Delete');
    const saveTitle = getUIText('Сохранить изменения', 'Save changes');
    const deleteTitle = getUIText('Удалить отзыв', 'Delete review');

    container.innerHTML = reviews.map(r => `
        <tr id="review-row-${r.id}">
            <td style="white-space: nowrap; font-weight: 500;">
                <i class="fa fa-user-circle-o" style="color: #999;"></i> ${r.author}
                <br><span style="color: #999; font-size: 11px; font-weight: 400;">${r.date}</span>
            </td>
            <td>
                <textarea id="review-text-${r.id}" style="width: 100%; min-height: 50px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; font-family: Roboto; resize: vertical; box-sizing: border-box;">${r.text}</textarea>
            </td>
            <td>
                <div style="display: flex; gap: 8px; white-space: nowrap;">
                    <button onclick="saveReviewEdit('${r.id}')" class="btn-admin btn-admin--approve" title="${saveTitle}">
                        <i class="fa fa-save"></i> ${saveBtn}
                    </button>
                    <button onclick="deleteReview('${r.id}')" class="btn-admin btn-admin--delete" title="${deleteTitle}">
                        <i class="fa fa-trash"></i> ${deleteBtn}
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.saveReviewEdit = async function(reviewId) {
    const textarea = document.getElementById(`review-text-${reviewId}`);
    if (!textarea) return;
    
    const newText = textarea.value.trim();
    if (!newText) {
        // === ИСПРАВЛЕНО: Перевод ошибки ===
        alert(getUIText('Отзыв не может быть пустым!', 'Review cannot be empty!'));
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newText })
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        alert(getUIText('Отзыв успешно обновлен!', 'Review successfully updated!'));
    } catch (err) {
        console.error(err);
        alert(getUIText('Ошибка при сохранении отзыва', 'Error saving review'));
    }
};

window.deleteReview = async function(reviewId) {
    // === ИСПРАВЛЕНО: Перевод подтверждения ===
    const confirmMsg = getUIText(
        'Вы уверены, что хотите безвозвратно удалить этот отзыв?',
        'Are you sure you want to permanently delete this review?'
    );
    if (confirm(confirmMsg)) {
        try {
            const response = await fetch(`${API_URL}/reviews/${reviewId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Ошибка удаления');
            
            const row = document.getElementById(`review-row-${reviewId}`);
            if (row) {
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            } else {
                loadAdminData();
            }
        } catch (err) {
            console.error(err);
            alert(getUIText('Ошибка при удалении отзыва', 'Error deleting review'));
        }
    }
};