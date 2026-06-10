// js/full-catalog.js

// === ФУНКЦИИ ДЛЯ ПЕРЕВОДОВ ===
function getCurrentLang() {
    return document.body.classList.contains('lang-en') ? 'en' : 'ru';
}

function getProductField(product, fieldRu, fieldEn) {
    const lang = getCurrentLang();
    if (lang === 'ru') return product[fieldRu];
    return product[fieldEn] || product[fieldRu];
}

function getUIText(ru, en) {
    return getCurrentLang() === 'ru' ? ru : en;
}

// Переменная для хранения оригинального списка товаров с сервера
let originalProducts = [];

const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const modalImg = document.getElementById('modal-img');
const modalPrice = document.getElementById('modal-price');
const modalSpecs = document.getElementById('modal-specs');
const modalClose = document.getElementById('modal-close');
const modalToCartBtn = document.getElementById('modal-to-cart-btn');
const container = document.getElementById('full-catalog-container');
const searchInput = document.getElementById('filter-search');
const sortSelect = document.getElementById('filter-sort');
const categorySelect = document.getElementById('filter-category');
const priceMinInput = document.getElementById('filter-price-min');
const priceMaxInput = document.getElementById('filter-price-max');
const resetBtn = document.getElementById('filter-reset-btn');

// 1. Функция загрузки товаров с сервера
async function loadCatalogProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        originalProducts = await response.json();
        applyFilters();
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        if (container) {
            const errorMsg = getUIText('Не удалось загрузить товары с сервера.', 'Failed to load products from server.');
            container.innerHTML = `<p style="color: red;">${errorMsg}</p>`;
        }
    }
}

// 2. Функция отрисовки карточек
function renderCatalog(items) {
    if (!container) return;
    
    container.innerHTML = '';

    if (items.length === 0) {
        const notFoundMsg = getUIText('По вашему запросу ничего не найдено.', 'Nothing found for your query.');
        container.innerHTML = `<p style="text-align:center; padding: 20px;">${notFoundMsg}</p>`;
        return;
    }

    const currency = getUIText(' руб.', ' RUB');
    const detailsText = getUIText('Подробнее', 'Details');
    const addToCartText = getUIText('В корзину', 'Add to Cart');

    let htmlString = '<div class="b-services-row">';
    
    items.forEach(function(item) {
        // === Используем переводы ===
        const itemName = getProductField(item, 'name', 'nameEn');
        const itemDesc = getProductField(item, 'description', 'descriptionEn');
        const itemPrice = parseInt(item.price).toLocaleString() + currency;
        
        htmlString += `
            <div class="b-services-card-horizontal" data-id="${item.id}">
                <button class="favorite-btn" onclick="toggleFavorite(this)">
                    <i class="fa fa-heart-o"></i>
                </button>
                
                <div class="b-card-pic">
                    <img src="${item.img}" alt="${itemName}">
                </div>
                
                <div class="b-card-content">
                    <div class="b-card-header">
                        <span class="b-card-title">${itemName}</span>
                    </div>
                    
                    <p class="b-card-text">
                        ${itemDesc || ''}
                    </p>
                    
                    <div class="b-card-price">${itemPrice}</div>
                    
                    <div class="b-card-action">
                        <button class="btn-more btn-details" style="margin-right: 10px;">${detailsText}</button>
                        <button class="btn-more buy-btn-catalog">${addToCartText}</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    htmlString += '</div>';
    container.innerHTML = htmlString;
}

// 3. Главная функция фильтрации и сортировки
function applyFilters() {
    let filtered = [...originalProducts];

    // Фильтр по поисковой строке (ищем по обоим языкам)
    if (searchInput && searchInput.value.trim() !== '') {
        const searchText = searchInput.value.toLowerCase();
        filtered = filtered.filter(item => 
            item.name.toLowerCase().includes(searchText) || 
            (item.nameEn && item.nameEn.toLowerCase().includes(searchText))
        );
    }

    // Фильтр по категории (ищем по обоим языкам)
    if (categorySelect && categorySelect.value !== 'all') {
        const selectedCategory = categorySelect.value;
        filtered = filtered.filter(item => 
            item.category === selectedCategory || item.categoryEn === selectedCategory
        );
    }

    // Фильтр по минимальной цене
    if (priceMinInput && priceMinInput.value !== '') {
        const minPrice = parseInt(priceMinInput.value);
        if (!isNaN(minPrice)) {
            filtered = filtered.filter(item => parseInt(item.price) >= minPrice);
        }
    }

    // Фильтр по максимальной цене
    if (priceMaxInput && priceMaxInput.value !== '') {
        const maxPrice = parseInt(priceMaxInput.value);
        if (!isNaN(maxPrice)) {
            filtered = filtered.filter(item => parseInt(item.price) <= maxPrice);
        }
    }

    // Сортировка
    if (sortSelect) {
        const sortValue = sortSelect.value;
        if (sortValue === 'price-asc') {
            filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
        } else if (sortValue === 'price-desc') {
            filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
        } else if (sortValue === 'name-asc') {
            // Сортируем по названию на текущем языке
            filtered.sort((a, b) => {
                const nameA = getProductField(a, 'name', 'nameEn');
                const nameB = getProductField(b, 'name', 'nameEn');
                return nameA.localeCompare(nameB);
            });
        }
    }

    renderCatalog(filtered);
}

// 4. Обработчики событий на фильтры
if (searchInput) searchInput.addEventListener('input', applyFilters);
if (sortSelect) sortSelect.addEventListener('change', applyFilters);
if (categorySelect) categorySelect.addEventListener('change', applyFilters);
if (priceMinInput) priceMinInput.addEventListener('input', applyFilters);
if (priceMaxInput) priceMaxInput.addEventListener('input', applyFilters);

// Кнопка сброса фильтров
if (resetBtn) {
    resetBtn.addEventListener('click', function() {
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'default';
        if (categorySelect) categorySelect.value = 'all';
        if (priceMinInput) priceMinInput.value = '';
        if (priceMaxInput) priceMaxInput.value = '';
        applyFilters();
    });
}

// 5. Обработка открытия модального окна
document.addEventListener('click', async (e) => {
    const detailsBtn = e.target.closest('.btn-details');
    
    if (detailsBtn) {
        const card = detailsBtn.closest('.b-services-card-horizontal');
        const id = card.getAttribute('data-id');

        try {
            const response = await fetch(`http://localhost:3000/products/${id}`);
            const product = await response.json();

            // === Заполняем модалку с переводами ===
            if (modalTitle) modalTitle.textContent = getProductField(product, 'name', 'nameEn');
            if (modalImg) modalImg.src = product.img;
            
            const currency = getUIText(' руб.', ' RUB');
            if (modalPrice) modalPrice.textContent = parseInt(product.price).toLocaleString() + currency;
            
            if (modalSpecs) {
                modalSpecs.innerHTML = '';
                const features = getProductField(product, 'features', 'featuresEn');
                if (features && Array.isArray(features)) {
                    features.forEach(feat => {
                        const li = document.createElement('li');
                        li.textContent = feat;
                        modalSpecs.appendChild(li);
                    });
                }
            }

            if (modal) modal.style.display = 'flex';
        } catch (error) {
            console.error('Ошибка получения данных товара:', error);
        }
    }

    // Клик по кнопке "В корзину"
    const addToCartBtn = e.target.closest('.buy-btn-catalog');
    if (addToCartBtn) {
        const card = addToCartBtn.closest('.b-services-card-horizontal');
        const id = card.getAttribute('data-id');
        
        try {
            const response = await fetch(`http://localhost:3000/products/${id}`);
            const product = await response.json();
            
            const productToCart = {
                id: product.id,
                name: product.name,
                nameEn: product.nameEn,
                price: parseInt(product.price),
                img: product.img
            };
            
            addToCart(productToCart);
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);
        }
    }
});

// Функция добавления в корзину (дублируем из card.js для автономности)
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => String(item.id) === String(product.id));
    
    if (existing) {
        existing.quantity += 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const productName = getProductField(product, 'name', 'nameEn');
    const alertMsg = getUIText(
        `Товар "${productName}" успешно добавлен в корзину!`,
        `Item "${productName}" successfully added to cart!`
    );
    alert(alertMsg);
}

// Закрытие модалки
if (modalClose) {
    modalClose.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });
}
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Кнопка "В корзину" в модалке
if (modalToCartBtn) {
    modalToCartBtn.addEventListener('click', () => {
        // Здесь можно добавить логику, если модальное окно хранит currentItem
        if (modal) modal.style.display = 'none';
    });
}

// === 🎯 НОВОЕ: Слушаем событие смены языка ===
window.addEventListener('languageChanged', () => {
    // Обновляем текст фильтров
    updateFilterTexts();
    // Перерисовываем каталог
    applyFilters();
});

// Функция обновления текстов фильтров
function updateFilterTexts() {
    if (searchInput) {
        searchInput.placeholder = getUIText('Введите название...', 'Enter name...');
    }
    
    if (sortSelect) {
        sortSelect.querySelectorAll('option').forEach(opt => {
            if (opt.value === 'default') opt.textContent = getUIText('По умолчанию', 'Default');
            if (opt.value === 'price-asc') opt.textContent = getUIText('Сначала дешевые', 'Price: Low to High');
            if (opt.value === 'price-desc') opt.textContent = getUIText('Сначала дорогие', 'Price: High to Low');
            if (opt.value === 'name-asc') opt.textContent = getUIText('По алфавиту (А-Я)', 'Alphabetical (A-Z)');
        });
    }
    
    if (categorySelect) {
        categorySelect.querySelectorAll('option').forEach(opt => {
            if (opt.value === 'all') opt.textContent = getUIText('Все категории', 'All categories');
            if (opt.value === 'СКУД и Радиоуправление') opt.textContent = getUIText('СКУД и Радиоуправление', 'ACS & Radio Control');
            if (opt.value === 'Шлагбаумы и автоматика') opt.textContent = getUIText('Шлагбаумы и автоматика', 'Barrier Gates & Automation');
            if (opt.value === 'Индукционные петли') opt.textContent = getUIText('Индукционные петли', 'Induction Loops');
        });
    }
    
    if (priceMinInput) priceMinInput.placeholder = getUIText('От', 'From');
    if (priceMaxInput) priceMaxInput.placeholder = getUIText('До', 'To');
    if (resetBtn) resetBtn.textContent = getUIText('Сбросить всё', 'Reset all');
}

// 6. Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateFilterTexts(); // Обновляем тексты фильтров при загрузке
    loadCatalogProducts();
});