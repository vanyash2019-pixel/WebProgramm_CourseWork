const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. ЗАЩИТА СТРАНИЦЫ
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'administrator')) {
        document.body.innerHTML = `
            <div class="access-denied-container">
                <div class="access-denied-icon"><i class="fa fa-lock"></i></div>
                <div class="access-denied-title">Доступ запрещен</div>
                <div class="access-denied-text">У вас нет прав для просмотра этой страницы.</div>
                <a href="index.html" class="btn-admin btn-admin--approve" style="text-decoration: none;">Вернуться на главную</a>
            </div>
        `;
        return;
    }

    // Запускаем загрузку данных
    loadAdminData();
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
        
        // Корректно выводим сообщение об ошибке прямо в списки, чтобы интерфейс не ломался
        const ordersContainer = document.getElementById('admin-orders-list');
        const reviewsContainer = document.getElementById('admin-reviews-list');
        
        const errorHTML = `<tr><td colspan="100%" style="text-align:center; color:var(--primary-red); padding: 20px;">
                            <i class="fa fa-exclamation-triangle"></i> Не удалось загрузить данные с сервера. Проверьте запущен ли бэкенд.
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
        container.innerHTML = '<p style="color: #666; padding: 15px;">Нет активных заказов.</p>';
        return;
    }

    const statuses = ['Принята', 'В обработке', 'Готов', 'Отменен'];

    container.innerHTML = orders.map(order => {
        const currentStatus = order.status || 'Принята';
        const itemsText = order.items.map(i => `${i.name} (${i.quantity} шт.)`).join(', ');

        return `
            <div class="admin-card" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Заказ №${order.id} | Пользователь ID: ${order.userId}</strong>
                    <span style="color: #666; font-size: 14px;"><i class="fa fa-clock-o"></i> ${order.date}</span>
                </div>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Товары:</strong> ${itemsText}</p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Сумма:</strong> <span style="color: var(--primary-blue); font-weight: 700;">${order.totalPrice} руб.</span></p>
                
                <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center; background: var(--light-gray); padding: 10px; border-radius: 4px;">
                    <label style="font-size: 14px; font-weight: 500;">Изменить статус:</label>
                    <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 6px 12px; border-radius: 4px; border: 1px solid var(--border-color); outline: none; font-family: Roboto;">
                        ${statuses.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    }).join('');
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
        alert('Ошибка при обновлении статуса заказа');
    }
};

// ==========================================
// ЛОГИКА ОТЗЫВОВ (Табличный вывод по фэншую)
// ==========================================
function renderAdminReviews(reviews) {
    const container = document.getElementById('admin-reviews-list');
    if (!container) return;

    if (reviews.length === 0) {
        container.innerHTML = '<tr><td colspan="3" style="text-align:center; color: #666; padding: 20px;">Отзывов пока нет.</td></tr>';
        return;
    }

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
                    <button onclick="saveReviewEdit('${r.id}')" class="btn-admin btn-admin--approve" title="Сохранить изменения">
                        <i class="fa fa-save"></i> Сохранить
                    </button>
                    <button onclick="deleteReview('${r.id}')" class="btn-admin btn-admin--delete" title="Удалить отзыв">
                        <i class="fa fa-trash"></i> Удалить
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
        alert('Отзыв не может быть пустым!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newText })
        });
        
        if (!response.ok) throw new Error('Ошибка обновления');
        alert('Отзыв успешно обновлен!');
    } catch (err) {
        console.error(err);
        alert('Ошибка при сохранении отзыва');
    }
};

window.deleteReview = async function(reviewId) {
    if (confirm('Вы уверены, что хотите безвозвратно удалить этот отзыв?')) {
        try {
            const response = await fetch(`${API_URL}/reviews/${reviewId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Ошибка удаления');
            
            // Вместо перезапроса всего сервера просто плавно убираем строчку из DOM
            const row = document.getElementById(`review-row-${reviewId}`);
            if (row) {
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
            } else {
                loadAdminData();
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка при удалении отзыва');
        }
    }
};