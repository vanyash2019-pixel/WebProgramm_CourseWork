// Переменная для хранения оригинального списка товаров с сервера
let originalProducts = [];

const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const modalImg = document.getElementById('modal-img');
const modalPrice = document.getElementById('modal-price');
const modalSpecs = document.getElementById('modal-specs');
const modalClose = document.getElementById('modal-close');
const container = document.getElementById('full-catalog-container'); // Убедись, что у тебя есть div с таким id, куда будут падать карточки
const searchInput = document.getElementById('filter-search');
const sortSelect = document.getElementById('filter-sort');
const categorySelect = document.getElementById('filter-category');
const priceMinInput = document.getElementById('filter-price-min');
const priceMaxInput = document.getElementById('filter-price-max');
const resetBtn = document.getElementById('filter-reset-btn');

// 1. Функция загрузки товаров с твоего сервера
async function loadCatalogProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        originalProducts = await response.json();
        
        // После успешной загрузки сразу применяем фильтры (чтобы отобразить всё на старте)
        applyFilters();
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        if (container) {
            container.innerHTML = '<p style="color: red;">Не удалось загрузить товары с сервера.</p>';
        }
    }
}

// 2. Функция отрисовки карточек в твоем дизайне
function renderCatalog(items) {
    if (!container) return;
    
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">По вашему запросу ничего не найдено.</p>';
        return;
    }

    // Открываем общий контейнер для карточек
    let htmlString = '<div class="b-services-row">';
    
    items.forEach(function(item) {
        // Формируем HTML каждой карточки, подставляя данные товара
        htmlString += `
            <div class="b-services-card-horizontal" data-id="${item.id}">
                <button class="favorite-btn" onclick="toggleFavorite(this)">
                    <i class="fa fa-heart-o"></i>
                </button>
                
                <div class="b-card-pic">
                    <img src="${item.img}" alt="${item.name}">
                </div>
                
                <div class="b-card-content">
                    <div class="b-card-header">
                        <span class="b-card-title">${item.name}</span>
                    </div>
                    
                    <p class="b-card-text">
                        ${item.description || ''}
                    </p>
                    
                    <div class="b-card-price">${parseInt(item.price).toLocaleString()} руб.</div>
                    
                    <div class="b-card-action">
                        <button class="btn-more btn-details" style="margin-right: 10px;">Подробнее</button>
                        <button class="btn-more buy-btn-catalog">В корзину</button>
                    </div>
                </div>
            </div>
        `;
    });
    

    // Закрываем общий контейнер
    htmlString += '</div>';

    // Выводим готовый HTML на страницу
    container.innerHTML = htmlString;
}

// 3. Главная функция фильтрации и сортировки
function applyFilters() {
    let filtered = [...originalProducts];

    // Фильтр по поисковой строке
    if (searchInput && searchInput.value.trim() !== '') {
        const searchText = searchInput.value.toLowerCase();
        filtered = filtered.filter(item => item.name.toLowerCase().includes(searchText));
    }

    // Фильтр по категории
    if (categorySelect && categorySelect.value !== 'all') {
        filtered = filtered.filter(item => item.category === categorySelect.value);
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

    // Сортировка цены и названия
    if (sortSelect) {
        const sortValue = sortSelect.value;
        if (sortValue === 'price-asc') {
            filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
        } else if (sortValue === 'price-desc') {
            filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
        } else if (sortValue === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    // Отправляем готовый отфильтрованный массив на отрисовку
    renderCatalog(filtered);
}

// 4. Вешаем обработчики событий на фильтры (запускаем фильтрацию при любом изменении)
if (searchInput) searchInput.addEventListener('input', applyFilters);
if (sortSelect) sortSelect.addEventListener('change', applyFilters);
if (categorySelect) categorySelect.addEventListener('change', applyFilters);
if (priceMinInput) priceMinInput.addEventListener('input', applyFilters);
if (priceMaxInput) priceMaxInput.addEventListener('input', applyFilters);

// Логика кнопки сброса фильтров
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
// 6. Обработка открытия модального окна
document.addEventListener('click', async (e) => {
    // Используем closest, чтобы точно попасть в кнопку, даже если нажали на <i> внутри
    const detailsBtn = e.target.closest('.btn-details');
    
    if (detailsBtn) {
        const card = detailsBtn.closest('.b-services-card-horizontal');
        const id = card.getAttribute('data-id');

        try {
            const response = await fetch(`http://localhost:3000/products/${id}`);
            const product = await response.json();

            // Заполняем модалку
            if (modalTitle) modalTitle.textContent = product.name;
            if (modalImg) modalImg.src = product.img;
            if (modalPrice) modalPrice.textContent = parseInt(product.price).toLocaleString() + ' руб.';
            
            if (modalSpecs) {
                modalSpecs.innerHTML = '';
                // Проверяем, есть ли features, чтобы не было ошибки
                if (product.features && Array.isArray(product.features)) {
                    product.features.forEach(feat => {
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
});

// Закрытие модалки по кнопке "X"
if (modalClose) {
    modalClose.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });
}

// Закрытие модалки при клике на серый фон
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});


// 5. Запуск скрипта при загрузке страницы
loadCatalogProducts();