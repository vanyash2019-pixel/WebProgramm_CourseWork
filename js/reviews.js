// js/reviews.js

// === ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДОВ ===
function getUIText(ru, en) {
    return document.body.classList.contains('lang-en') ? en : ru;
}

// =========================================================
// ЛОГИКА ОТЗЫВОВ (Модалка + Отправка на json-server)
// =========================================================

const openReviewBtn = document.getElementById('open-review-modal');
const reviewModal = document.getElementById('review-modal');
const closeReviewBtn = document.getElementById('close-review-modal');
const reviewForm = document.getElementById('review-form');

// Открытие модалки
if (openReviewBtn && reviewModal) {
    openReviewBtn.addEventListener('click', () => {
        reviewModal.style.display = 'flex';
        
        // Автоподстановка имени, если юзер залогинен
        const reviewAuthorInput = document.getElementById('review-author');
        if (reviewAuthorInput && localStorage.getItem('currentUser')) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            reviewAuthorInput.value = currentUser.name || '';
            // Можно заблокировать поле, раз имя уже известно
            reviewAuthorInput.readOnly = true; 
        }
    });
}

// Закрытие модалки по крестику
if (closeReviewBtn && reviewModal) {
    closeReviewBtn.addEventListener('click', () => {
        reviewModal.style.display = 'none';
    });
}

// Закрытие модалки по клику на фон
if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
        if (e.target === reviewModal) {
            reviewModal.style.display = 'none';
        }
    });
}

// Отправка отзыва на сервер
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const authorName = document.getElementById('review-author').value.trim();
        const reviewText = document.getElementById('review-text').value.trim();
        
        // Получаем ID пользователя, если он есть
        let currentUserId = null;
        if (localStorage.getItem('currentUser')) {
            currentUserId = JSON.parse(localStorage.getItem('currentUser')).id;
        }

        const newReview = {
            userId: currentUserId, // привязка к юзеру
            author: authorName,
            text: reviewText,
            date: new Date().toLocaleDateString('ru-RU') // дата отзыва
        };

        try {
            const response = await fetch('http://localhost:3000/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReview)
            });

            if (response.ok) {
                // === ИСПРАВЛЕНО: Перевод сообщения об успехе ===
                const successMsg = getUIText(
                    'Спасибо! Ваш отзыв успешно отправлен.',
                    'Thank you! Your review has been successfully submitted.'
                );
                alert(successMsg);
                reviewForm.reset();
                reviewModal.style.display = 'none';
            } else {
                // === ИСПРАВЛЕНО: Перевод сообщения об ошибке ===
                const errorMsg = getUIText(
                    'Не удалось отправить отзыв.',
                    'Failed to submit your review.'
                );
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Ошибка при отправке отзыва:', error);
            // === ИСПРАВЛЕНО: Перевод сообщения о сетевой ошибке ===
            const netErrorMsg = getUIText(
                'Ошибка связи с сервером. Проверьте json-server.',
                'Server connection error. Please check if json-server is running.'
            );
            alert(netErrorMsg);
        }
    });
}

// === 🎯 НОВОЕ: Слушаем событие смены языка для обновления placeholder ===
window.addEventListener('languageChanged', () => {
    // Обновляем placeholder у полей ввода в модальном окне
    const authorInput = document.getElementById('review-author');
    const textInput = document.getElementById('review-text');
    
    if (authorInput && authorInput.dataset.placeholderRu) {
        authorInput.placeholder = document.body.classList.contains('lang-en') 
            ? authorInput.dataset.placeholderEn 
            : authorInput.dataset.placeholderRu;
    }
    
    if (textInput && textInput.dataset.placeholderRu) {
        textInput.placeholder = document.body.classList.contains('lang-en') 
            ? textInput.dataset.placeholderEn 
            : textInput.dataset.placeholderRu;
    }
});