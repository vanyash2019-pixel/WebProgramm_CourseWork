document.addEventListener('DOMContentLoaded', () => {
    const userRaw = localStorage.getItem('currentUser');

    // 1. ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН — КРАСИМ КНОПКИ В СЕРЫЙ
    if (!userRaw) {
        // Находим все кнопки с классом buy-btn-catalog на странице
        const buyButtons = document.querySelectorAll('.buy-btn-catalog');
        
        buyButtons.forEach(button => {
            button.classList.add('disabled-style');
            // Опционально: можно поменять текст кнопки, чтобы сразу было понятно
            button.textContent = ' Купить'; 
        });
    }

    // 2. ДЕЛЕГИРОВАНИЕ КЛИКОВ (Твой рабочий код)
    document.body.addEventListener('click', (event) => {
        
        if (event.target.classList.contains('buy-btn-catalog')) {
            
            // Снова проверяем авторизацию при клике
            if (!localStorage.getItem('currentUser')) {
                event.preventDefault();
                event.stopPropagation();

                alert('Чтобы добавить товар в корзину, пожалуйста, войдите в свой аккаунт.');
                window.location.href = 'auth.html';
                return;
            }

            console.log('Пользователь авторизован, пускаем в корзину...');
        }
    });
});