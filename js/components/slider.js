export const initSlider = () => {
    const sliderLine = document.querySelector('#js-line');
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');

    if (!sliderLine || slides.length === 0) return;

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    // Функция для перемещения ленты
    const setPosition = () => {
        sliderLine.style.transform = `translateX(${currentTranslate}px)`;
    };

    const changeSlide = (index) => {
        currentIndex = index;
        // Ограничения
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > slides.length - 1) currentIndex = slides.length - 1;

        // Плавный доводчик до точных координат
        sliderLine.style.transition = 'transform 0.4s ease-out';
        currentTranslate = currentIndex * -sliderWrapper.offsetWidth;
        prevTranslate = currentTranslate;
        setPosition();

        // Точки
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    // --- События ---

    const dragStart = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        
        // Убираем анимацию, чтобы лента мгновенно шла за рукой
        sliderLine.style.transition = 'none';
    };

    const dragMove = (e) => {
        if (!isDragging) return;
        
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Двигаем в реальном времени
        currentTranslate = prevTranslate + diff;
        setPosition();
    };

    const dragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const movedBy = currentTranslate - prevTranslate;

        // ЛОГИКА МАГНИТА:
        // Если протащили больше чем на 1/4 ширины окна — листаем
        const threshold = sliderWrapper.offsetWidth / 4;

        if (movedBy < -threshold && currentIndex < slides.length - 1) {
            currentIndex += 1;
        } else if (movedBy > threshold && currentIndex > 0) {
            currentIndex -= 1;
        }

        // Возвращаем плавность и фиксируем слайд
        changeSlide(currentIndex);
    };

    // Слушатели для мыши и тача
    sliderWrapper.addEventListener('mousedown', dragStart);
    sliderWrapper.addEventListener('touchstart', dragStart, {passive: true});

    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, {passive: false});

    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);

    // Точки
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => changeSlide(i));
    });

    // При изменении размера окна пересчитываем позицию (чтобы не ломалось)
    window.addEventListener('resize', () => changeSlide(currentIndex));
};

document.addEventListener('DOMContentLoaded', function() {
    const sliderLine = document.querySelector('.v-slider-line');
    const sliderWrapper = document.querySelector('.v-slider-wrapper');
    const dots = document.querySelectorAll('.v-dot');
    const slides = document.querySelectorAll('.v-slide');

    if (!sliderLine || slides.length === 0) return;

    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    // Обновляем позицию в пикселях
    const setPosition = () => {
        sliderLine.style.transform = `translateX(${currentTranslate}px)`;
    };

    // Функция переключения/фиксации слайда
    const changeSlide = (index) => {
        currentIndex = index;
        
        // Ограничиваем индекс
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > slides.length - 1) currentIndex = slides.length - 1;

        // Включаем плавность для фиксации
        sliderLine.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Считаем точное смещение в пикселях на основе ширины окна
        currentTranslate = currentIndex * -window.innerWidth;
        prevTranslate = currentTranslate;
        
        setPosition();

        // Обновляем точки
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    // --- Логика захвата ---

    const dragStart = (e) => {
        isDragging = true;
        // Берем координату либо с мыши, либо с тача
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        
        // Выключаем анимацию, чтобы лента «прилипла» к пальцу
        sliderLine.style.transition = 'none';
        
        // Чтобы картинки не пытались «перетаскиваться» как файлы
        if (e.type === 'mousedown') e.preventDefault(); 
    };

    const dragMove = (e) => {
        if (!isDragging) return;
        
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Двигаем ленту за рукой
        currentTranslate = prevTranslate + diff;
        setPosition();
    };

    const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        const movedBy = currentTranslate - prevTranslate;

        // Порог срабатывания: 20% от ширины экрана
        const threshold = window.innerWidth * 0.2;

        if (movedBy < -threshold && currentIndex < slides.length - 1) {
            currentIndex += 1;
        } else if (movedBy > threshold && currentIndex > 0) {
            currentIndex -= 1;
        }

        // Плавный «доводчик» до ближайшего слайда
        changeSlide(currentIndex);
    };

    // События для мыши
    sliderWrapper.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);

    // События для тачскрина
    sliderWrapper.addEventListener('touchstart', dragStart, {passive: true});
    window.addEventListener('touchmove', dragMove, {passive: false});
    window.addEventListener('touchend', dragEnd);

    // Клик по точкам
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => changeSlide(i));
    });

    // Чтобы при ресайзе окна всё не улетало
    window.addEventListener('resize', () => {
        changeSlide(currentIndex);
    });
});



const playBtn = document.getElementById('play-button');
const iframe = document.getElementById('video-iframe');
const container = document.getElementById('video-container');

if (playBtn && iframe) {
    playBtn.addEventListener('click', function() {
        // Берем ссылку из data-src и ставим в src, чтобы видео начало грузиться
        const videoSrc = iframe.getAttribute('data-src');
        iframe.setAttribute('src', videoSrc);
        
        // Показываем видео, скрываем кнопку и убираем фон постера
        iframe.style.display = 'block';
        playBtn.style.display = 'none';
        container.style.backgroundImage = 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('partner-track');
    const btnPrev = document.getElementById('partner-prev');
    const btnNext = document.getElementById('partner-next');

    // Проверяем, что ВСЕ элементы найдены, иначе выходим
    if (!track || !btnPrev || !btnNext) return;

    // --- 1. ЛОГИКА СТРЕЛОК ---
    btnNext.addEventListener('click', () => {
        const item = track.querySelector('.partner-item');
        if (item) {
            const scrollAmount = item.clientWidth + 30; // ширина + gap
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });

    btnPrev.addEventListener('click', () => {
        const item = track.querySelector('.partner-item');
        if (item) {
            const scrollAmount = item.clientWidth + 30;
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    });

    // --- 2. ЛОГИКА ПЕРЕТАСКИВАНИЯ (DRAG) ---
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
        isDown = true;
        track.classList.add('is-dragging'); // Класс для отключения snap и smooth (из прошлого шага)
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
    });

    const stopDragging = () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('is-dragging');
    };

    track.addEventListener('mouseleave', stopDragging);
    track.addEventListener('mouseup', stopDragging);

    track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault(); // Запрещаем выделение текста
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5; // Скорость прокрутки
        track.scrollLeft = scrollLeft - walk;
    });
});




document.addEventListener('DOMContentLoaded', function()
 {
    const originalNav = document.querySelector('.header-bottom');

    const stickyNav = originalNav.cloneNode(true);

    stickyNav.classList.add('header-bottom--sticky');

    document.body.appendChild(stickyNav);

    let isScrolling;

    const threshold = 500; 

    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;

        stickyNav.classList.remove('is-visible');

        window.clearTimeout(isScrolling);

        if (scrollPosition > threshold) {
            isScrolling = setTimeout(function() {
                if (window.scrollY > threshold) {
                    stickyNav.classList.add('is-visible');
                }
            }, 1000);
        }
    });
});


// 1. Находим кнопки по ID
const darkBtn = document.getElementById('theme-dark');
const lightBtn = document.getElementById('theme-light');
const terminalBtn = document.getElementById('theme-terminal'); // НОВАЯ КНОПКА

// Функция для установки темы
function setTheme(themeName) {
    // Сбрасываем все темы
    document.body.classList.remove('dark', 'terminal-theme');
    
    if (themeName === 'dark') {
        document.body.classList.add('dark');
    } else if (themeName === 'terminal') {
        document.body.classList.add('terminal-theme');
    }
    // Для light просто ничего не добавляем (это стандартная тема)
    
    // Сохраняем выбор в память браузера
    localStorage.setItem('theme', themeName);
}

// 2. Слушатели кликов (кнопки в шапке)
if (darkBtn) darkBtn.addEventListener('click', () => setTheme('dark'));
if (lightBtn) lightBtn.addEventListener('click', () => setTheme('light'));
if (terminalBtn) terminalBtn.addEventListener('click', () => setTheme('terminal')); // НОВЫЙ ОБРАБОТЧИК

// === КНОПКИ ТЕМ ИЗ ФУТЕРА ===
const footerThemeDark = document.getElementById('footer-theme-dark');
const footerThemeLight = document.getElementById('footer-theme-light');
const footerThemeTerminal = document.getElementById('footer-theme-terminal');

if (footerThemeDark) {
    footerThemeDark.addEventListener('click', (e) => {
        e.preventDefault();
        setTheme('dark');
    });
}

if (footerThemeLight) {
    footerThemeLight.addEventListener('click', (e) => {
        e.preventDefault();
        setTheme('light');
    });
}

if (footerThemeTerminal) {
    footerThemeTerminal.addEventListener('click', (e) => {
        e.preventDefault();
        setTheme('terminal');
    });
}

// 3. Проверка при загрузке страницы
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark');
} else if (savedTheme === 'terminal') {
    document.body.classList.add('terminal-theme');
} else if (savedTheme === 'light') {
    document.body.classList.remove('dark', 'terminal-theme');
} else {
    // Если зашёл впервые — светлая тема по умолчанию
    document.body.classList.remove('dark', 'terminal-theme');
    localStorage.setItem('theme', 'light');
}



document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('yandex-map') && typeof ymaps !== 'undefined') {

        ymaps.ready(function () {
            var myMap = new ymaps.Map("yandex-map", {
                // Координаты центра карты (сейчас это Москва)
                center: [55.755819, 37.617644], 
                zoom: 10, 
                controls: ['zoomControl', 'fullscreenControl'] 
            });

        
            var myPlacemark = new ymaps.Placemark([55.755819, 37.617644], {
                hintContent: 'Главный барьер',
                balloonContent: 'Здесь находится описание объекта'
            }, {
   
                preset: 'islands#redIcon'
            });

            myMap.geoObjects.add(myPlacemark);
        
        });
    }
});

// Кнопка "Читать далее" для секции About (только на мобильных)
document.addEventListener('DOMContentLoaded', function() {
    const aboutContent = document.querySelector('.about__content');
    const readMoreBtn = document.getElementById('about-read-more');

    if (!aboutContent || !readMoreBtn) return;

    function toggleReadMoreButton() {
        if (window.innerWidth <= 685) {
            readMoreBtn.style.display = 'block';
        } else {
            readMoreBtn.style.display = 'none';
            aboutContent.classList.remove('expanded');
        }
    }

    readMoreBtn.addEventListener('click', function() {
        aboutContent.classList.toggle('expanded');

        if (aboutContent.classList.contains('expanded')) {
            readMoreBtn.innerHTML = `
                <span class="ru">Свернуть</span>
                <span class="en">Collapse</span>
            `;
        } else {
            readMoreBtn.innerHTML = `
                <span class="ru">Читать далее</span>
                <span class="en">Read more</span>
            `;
        }
    });

    window.addEventListener('resize', toggleReadMoreButton);
    toggleReadMoreButton();
});
// ========== ЖЁСТКИЙ ФИКС ТОЧЕК СЛАЙДЕРА ==========
function forceFixSliderDots() {
    if (window.innerWidth > 767) return;

    const wrapper = document.querySelector('.slider-wrapper');
    const dots = document.querySelector('.slider-dots');

    if (!wrapper || !dots) return;

    // Принудительно делаем wrapper relative
    wrapper.style.position = 'relative';
    wrapper.style.zIndex = '1';

    // Принудительно ставим точки на место
    dots.style.position = 'absolute';
    dots.style.bottom = '20px';
    dots.style.left = '50%';
    dots.style.transform = 'translateX(-50%)';
    dots.style.zIndex = '999999';
    dots.style.display = 'flex';
    dots.style.gap = '10px';
    dots.style.margin = '0';
    dots.style.padding = '0';
}

// Запускаем после загрузки
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(forceFixSliderDots, 400);
});

// На случай ресайза
window.addEventListener('resize', forceFixSliderDots);
        // Переключение языка
        const langBtns = document.querySelectorAll('.error-lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                
                // Переключаем активную кнопку
                langBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Показываем/скрываем текст
                const ruElements = document.querySelectorAll('.ru');
                const enElements = document.querySelectorAll('.en');
                
                if (lang === 'en') {
                    ruElements.forEach(el => el.style.display = 'none');
                    enElements.forEach(el => el.style.display = 'inline');
                } else {
                    ruElements.forEach(el => el.style.display = 'inline');
                    enElements.forEach(el => el.style.display = 'none');
                }
                
                // Для блочных элементов
                document.querySelectorAll('.error-logo-desc .en, .error-title .en, .error-text .en, .error-links-title .en').forEach(el => {
                    el.style.display = lang === 'en' ? 'block' : 'none';
                });
            });
        });
        