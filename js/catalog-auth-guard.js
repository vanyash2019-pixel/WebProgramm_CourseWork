// === ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ДОБАВЛЕНИИ В КОРЗИНУ ===
document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('currentUser');

    // === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДОВ ===
    function getUIText(ru, en) {
        return document.body.classList.contains('lang-en') ? en : ru;
    }

    // 1. ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН — КРАСИМ КНОПКИ В СЕРЫЙ
    if (!userRaw) {
        const buyButtons = document.querySelectorAll('.buy-btn-catalog');
        
        buyButtons.forEach(button => {
            button.classList.add('disabled-style');
            // === ИСПРАВЛЕНО: Перевод текста кнопки ===
            button.textContent = ' ' + getUIText('В корзину', 'Add to Cart'); 
        });
    }

    // 2. ДЕЛЕГИРОВАНИЕ КЛИКОВ
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
        if (!localStorage.getItem('currentUser')) {
            const buyButtons = document.querySelectorAll('.buy-btn-catalog');
            buyButtons.forEach(button => {
                button.textContent = ' ' + getUIText('В корзину', 'Add to Cart');
            });
        }
    });
});