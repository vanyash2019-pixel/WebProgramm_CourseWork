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
                alert('Спасибо! Ваш отзыв успешно отправлен.');
                reviewForm.reset();
                reviewModal.style.display = 'none';
            } else {
                alert('Не удалось отправить отзыв.');
            }
        } catch (error) {
            console.error('Ошибка при отправке отзыва:', error);
            alert('Ошибка связи с сервером. Проверьте json-server.');
        }
    });
}