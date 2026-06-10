// === ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ДОБАВЛЕНИИ В КОРЗИНУ ===
document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('currentUser');

    // === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДОВ ===
    function getUIText(ru, en) {
        return document.body.classList.contains('lang-en') ? en : ru;
    }

    // 1. ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН — СКРЫВАЕМ КНОПКИ ПОЛНОСТЬЮ
    if (!userRaw) {
        const buyButtons = document.querySelectorAll('.buy-btn-catalog');
        
        buyButtons.forEach(button => {
            button.style.display = 'none'; // Полностью скрываем кнопку
        });
    } else {
        // Если авторизован — убеждаемся, что кнопки видны и с правильным текстом
        const buyButtons = document.querySelectorAll('.buy-btn-catalog');
        buyButtons.forEach(button => {
            button.style.display = ''; // Показываем (сбрасываем display)
            button.textContent = ' ' + getUIText('В корзину', 'Add to Cart');
        });
    }

    // 2. ДЕЛЕГИРОВАНИЕ КЛИКОВ (защита от прямого вызова)
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('buy-btn-catalog')) {
            // Снова проверяем авторизацию при клике
            if (!localStorage.getItem('currentUser')) {
                event.preventDefault();
                event.stopPropagation();

                // === ИСПРАВЛЕНО: Перевод сообщения ===
                const authMsg = getUIText(
                    'Чтобы добавить товар в корзину, пожалуйста, войдите в свой аккаунт.',
                    'To add an item to your cart, please log in to your account.'
                );
                alert(authMsg);
                window.location.href = 'auth.html';
                return;
            }

            console.log('Пользователь авторизован, пускаем в корзину...');
        }
    });
    
    // === 🎯 Слушаем смену языка для обновления текста кнопок ===
    window.addEventListener('languageChanged', () => {
        const userRaw = localStorage.getItem('currentUser');
        
        if (userRaw) {
            // Если авторизован — обновляем текст
            const buyButtons = document.querySelectorAll('.buy-btn-catalog');
            buyButtons.forEach(button => {
                button.style.display = ''; // Убеждаемся, что видны
                button.textContent = ' ' + getUIText('В корзину', 'Add to Cart');
            });
        } else {
            // Если не авторизован — скрываем
            const buyButtons = document.querySelectorAll('.buy-btn-catalog');
            buyButtons.forEach(button => {
                button.style.display = 'none';
            });
        }
    });
});