console.log("--- ACCESSIBILITY JS ЗАГРУЖЕН ---");

// === ФУНКЦИЯ УСТАНОВКИ РАЗМЕРА ШРИФТА ===
function setFontSize(type) {
    // Сбрасываем все классы размера
    document.body.classList.remove('acc-font-large', 'acc-font-xlarge');

    // Добавляем нужный класс
    if (type === 'font-large') {
        document.body.classList.add('acc-font-large');
    } else if (type === 'font-xlarge') {
        document.body.classList.add('acc-font-xlarge');
    }
    // Для 'font-normal' просто ничего не добавляем (это стандартный размер)

    // Сохраняем выбор в память браузера
    localStorage.setItem('fontSize', type);
    console.log("✅ Размер шрифта сохранён:", type);
}

// === КНОПКИ В ШАПКЕ ===
const fontBtns = document.querySelectorAll('.acc-font-btn');
fontBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const type = this.getAttribute('data-acc');
        setFontSize(type);
    });
});

// === КНОПКИ В ФУТЕРЕ ===
const footerFontNormal = document.getElementById('footer-font-normal');
const footerFontLarge = document.getElementById('footer-font-large');
const footerFontXLarge = document.getElementById('footer-font-xlarge');

if (footerFontNormal) {
    footerFontNormal.addEventListener('click', (e) => {
        e.preventDefault();
        setFontSize('font-normal');
    });
}

if (footerFontLarge) {
    footerFontLarge.addEventListener('click', (e) => {
        e.preventDefault();
        setFontSize('font-large');
    });
}

if (footerFontXLarge) {
    footerFontXLarge.addEventListener('click', (e) => {
        e.preventDefault();
        setFontSize('font-xlarge');
    });
}

// === ВОССТАНОВЛЕНИЕ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
const savedFontSize = localStorage.getItem('fontSize');

if (savedFontSize === 'font-large') {
    document.body.classList.add('acc-font-large');
} else if (savedFontSize === 'font-xlarge') {
    document.body.classList.add('acc-font-xlarge');
} else {
    // По умолчанию — обычный размер
    document.body.classList.remove('acc-font-large', 'acc-font-xlarge');
    if (!savedFontSize) {
        localStorage.setItem('fontSize', 'font-normal');
    }
}

console.log("🔍 Текущий размер шрифта:", savedFontSize || 'font-normal');
// === КНОПКА СБРОСА ВСЕХ НАСТРОЕК ===
document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.querySelector('.reset-settings-btn');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
        // 1. Удаляем ВСЕ возможные ключи настроек (на случай, если где-то остались старые)
        localStorage.removeItem('theme');
        localStorage.removeItem('site-lang');   // новый ключ языка
        localStorage.removeItem('language');    // старый ключ языка (на всякий случай)
        localStorage.removeItem('fontSize');

        // 2. Сбрасываем все классы с body
        document.body.classList.remove(
            'dark',
            'terminal-theme',
            'lang-en',
            'lang-ru',
            'acc-font-large',
            'acc-font-xlarge'
        );

        // 3. ЯВНО вызываем setLanguage('ru'), чтобы language.js сразу подхватил
        if (typeof window.setLanguage === 'function') {
            window.setLanguage('ru');
        }

        // 4. Перезагружаем страницу
        location.reload();
    });
});