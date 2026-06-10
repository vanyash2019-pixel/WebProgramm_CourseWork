// js/favorites.js

// === ФУНКЦИИ ДЛЯ ПЕРЕВОДОВ ===
function getCurrentLang() {
    return document.body.classList.contains('lang-en') ? 'en' : 'ru';
}

function getUIText(ru, en) {
    return getCurrentLang() === 'ru' ? ru : en;
}

const favoritesContainer = document.getElementById('favorites-container');

document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    
    // === СЛУШАЕМ СОБЫТИЕ СМЕНЫ ЯЗЫКА ===
    window.addEventListener('languageChanged', () => {
        loadFavorites(); // Перезагружаем избранное при смене языка
    });
});

// Запрос списка избранного из json-server
async function loadFavorites() {
    try {
        const response = await fetch('http://localhost:3000/favorites');
        const data = await response.json();
        renderFavorites(data);
    } catch (error) {
        console.error("Ошибка при получении списка избранного:", error);
        const emptyMsg = getUIText('Не удалось загрузить данные с сервера.', 'Failed to load data from server.');
        favoritesContainer.innerHTML = `<p class="empty-message">${emptyMsg}</p>`;
    }
}

// Вывод карточек на страницу
function renderFavorites(items) {
    if (!favoritesContainer) return;
    favoritesContainer.innerHTML = '';

    if (items.length === 0) {
        const emptyMsg = getUIText('Ваш список избранного пуст.', 'Your favorites list is empty.');
        favoritesContainer.innerHTML = `<p class="empty-message">${emptyMsg}</p>`;
        return;
    }

    items.forEach(item => {
        // === Поддержка перевода названия товара ===
        // Если в item есть titleEn, используем его для английского языка
        const itemTitle = (getCurrentLang() === 'en' && item.titleEn) ? item.titleEn : item.title;
        const currency = getUIText(' руб.', ' RUB');
        const addToCartText = getUIText('В корзину', 'Add to Cart');
        const deleteTitle = getUIText('Удалить из избранного', 'Remove from favorites');
        
        favoritesContainer.innerHTML += `
            <div class="fav-card" id="fav-card-${item.id}">
                <div class="fav-card__img-wrapper">
                    <img src="${item.image}" alt="${itemTitle}">
                </div>
                <div class="fav-card__info">
                    <h3 class="fav-card__title">${itemTitle}</h3>
                    <div class="fav-card__price">${item.price}${currency}</div>
                    <div class="fav-card__actions">
                        <button class="fav-btn-cart" onclick="addFromFavToCart('${item.productId}')">
                            ${addToCartText}
                        </button>
                        <button class="fav-btn-delete" onclick="removeFromFavorites('${item.id}')" title="${deleteTitle}">
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
            const element = document.getElementById(`fav-card-${id}`);
            if (element) element.remove();

            if (favoritesContainer.children.length === 0) {
                const emptyMsg = getUIText('Ваш список избранного пуст.', 'Your favorites list is empty.');
                favoritesContainer.innerHTML = `<p class="empty-message">${emptyMsg}</p>`;
            }
        }
    } catch (error) {
        console.error("Ошибка при удалении товара:", error);
    }
};

// Функция добавления товара из избранного в корзину
window.addFromFavToCart = async function(productId) {
    try {
        const prodRes = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await prodRes.json();

        const productToCart = {
            id: product.id,
            name: product.name,
            nameEn: product.nameEn, // Сохраняем английское название
            price: parseInt(String(product.price).replace(/\s+/g, '')),
            img: product.img || product.image
        };

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(item => String(item.id) === String(product.id));
        
        if (existing) {
            existing.quantity += 1;
        } else {
            productToCart.quantity = 1;
            cart.push(productToCart);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // === Перевод уведомления ===
        const productName = getCurrentLang() === 'en' && product.nameEn ? product.nameEn : product.name;
        const alertMsg = getUIText(
            `Товар "${productName}" успешно добавлен в корзину!`,
            `Item "${productName}" successfully added to cart!`
        );
        alert(alertMsg);
        
    } catch (error) {
        console.error("Ошибка при добавлении в корзину из избранного:", error);
        const errorMsg = getUIText(
            'Не удалось добавить товар в корзину. Проверьте соединение с сервером.',
            'Failed to add item to cart. Check your connection.'
        );
        alert(errorMsg);
    }
};

// Проверка загрузки файла
console.log("Файл favorites.js успешно загружен!");

// Функция переключения избранного (сердечко)
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
            const titleEl = card.querySelector('.b-card-title');
            // === Сохраняем название на обоих языках ===
            const titleRu = titleEl.querySelector('.ru')?.textContent || titleEl.textContent;
            const titleEn = titleEl.querySelector('.en')?.textContent;
            
            const price = card.querySelector('.b-card-price').textContent;
            const imgSrc = card.querySelector('img')?.getAttribute('src');

            await fetch('http://localhost:3000/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: String(Date.now()),
                    productId: productId,
                    title: titleRu,        // Русское название
                    titleEn: titleEn,      // Английское название (если есть)
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