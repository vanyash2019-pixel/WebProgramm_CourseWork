const favoritesContainer = document.getElementById('favorites-container');

document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
});

// Запрос списка избранного из json-server
async function loadFavorites() {
    try {
        const response = await fetch('http://localhost:3000/favorites');
        const data = await response.json();
        renderFavorites(data);
    } catch (error) {
        console.error("Ошибка при получении списка избранного:", error);
        favoritesContainer.innerHTML = '<p class="empty-message">Не удалось загрузить данные с сервера.</p>';
    }
}

// Вывод карточек на страницу
function renderFavorites(items) {
    if (!favoritesContainer) return;
    favoritesContainer.innerHTML = '';

    if (items.length === 0) {
        favoritesContainer.innerHTML = '<p class="empty-message">Ваш список избранного пуст.</p>';
        return;
    }

    items.forEach(item => {
        favoritesContainer.innerHTML += `
            <div class="fav-card" id="fav-card-${item.id}">
                <div class="fav-card__img-wrapper">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="fav-card__info">
                    <h3 class="fav-card__title">${item.title}</h3>
                    <div class="fav-card__price">${item.price} руб.</div>
                    <div class="fav-card__actions">
                        <button class="fav-btn-cart" onclick="addFromFavToCart('${item.productId}')">
                            В корзину
                        </button>
                        <button class="fav-btn-delete" onclick="removeFromFavorites('${item.id}')" title="Удалить из избранного">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Удаление элемента из Избранного (кнопка Мусорка)
window.removeFromFavorites = async function(id) {
    try {
        const res = await fetch(`http://localhost:3000/favorites/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            // Удаляем блок с экрана без перезагрузки всей страницы
            const element = document.getElementById(`fav-card-${id}`);
            if (element) element.remove();

            // Если карточек больше нет, пишем, что список пуст
            if (favoritesContainer.children.length === 0) {
                favoritesContainer.innerHTML = '<p class="empty-message">Ваш список избранного пуст.</p>';
            }
        }
    } catch (error) {
        console.error("Ошибка при удалении товара:", error);
    }
};

/// Функция добавления товара из избранного в корзину (работает с localStorage)
window.addFromFavToCart = async function(productId) {
    try {
        // 1. Получаем полные параметры продукта из общей базы
        const prodRes = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await prodRes.json();

        // 2. Формируем объект товара так же, как он выглядит в твоей функции каталога
        // Мы берем данные из ответа сервера (product.title, product.price и т.д.)
        const productToCart = {
            id: product.id,
            name: product.title,
            price: parseInt(String(product.price).replace(/\s+/g, '')), // Очистка цены от пробелов
            img: product.image
        };

        // 3. Добавляем в localStorage (используем ту же логику, что у тебя в каталоге)
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => String(item.id) === String(product.id));
        
        if (existing) {
            existing.quantity += 1;
        } else {
            productToCart.quantity = 1;
            cart.push(productToCart);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        alert(`Товар "${product.name}" успешно добавлен в корзину!`);
        
    } catch (error) {
        console.error("Ошибка при добавлении в корзину из избранного:", error);
        alert('Не удалось добавить товар в корзину. Проверьте соединение с сервером.');
    }
};
// Проверка загрузки файла
console.log("Файл script.js успешно загружен!");

// Эта функция должна быть глобальной, чтобы HTML-атрибут onclick её видел
window.toggleFavorite = async function(btnElement) {
    console.log("Клик по кнопке получен");

    const card = btnElement.closest('.b-services-card-horizontal');
    const productId = card.getAttribute('data-id');
    const icon = btnElement.querySelector('i');
    
    if (!productId) {
        console.error("Ошибка: у карточки нет атрибута data-id");
        return;
    }

    try {
        // 1. Проверяем, есть ли товар уже в избранном
        const res = await fetch('http://localhost:3000/favorites');
        const favorites = await res.json();
        const existingFav = favorites.find(item => item.productId === productId);

        if (existingFav) {
            // Удаление из избранного
            await fetch(`http://localhost:3000/favorites/${existingFav.id}`, {
                method: 'DELETE'
            });
            icon.classList.remove('fa-heart');
            icon.classList.add('fa-heart-o');
            console.log("Товар удален из избранного");
        } else {
            // Добавление в избранное
            const title = card.querySelector('.b-card-title').innerText;
            const price = card.querySelector('.b-card-price').innerText;
            const imgSrc = card.querySelector('img').getAttribute('src');

            await fetch('http://localhost:3000/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: String(Date.now()),
                    productId: productId,
                    title: title,
                    price: price,
                    image: imgSrc
                })
            });
            icon.classList.remove('fa-heart-o');
            icon.classList.add('fa-heart');
            console.log("Товар добавлен в избранное");
        }
    } catch (error) {
        console.error("Ошибка при работе с json-server:", error);
    }
};

// Проверка состояния кнопок при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('http://localhost:3000/favorites');
        const favorites = await res.json();
        
        document.querySelectorAll('.b-services-card-horizontal').forEach(card => {
            const productId = card.getAttribute('data-id');
            const icon = card.querySelector('.favorite-btn i');
            
            if (favorites.some(fav => fav.productId === productId)) {
                icon.classList.remove('fa-heart-o');
                icon.classList.add('fa-heart');
            }
        });
    } catch (e) {
        console.log("Сервер недоступен, сердечки не обновлены");
    }
});