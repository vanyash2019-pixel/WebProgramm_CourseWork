document.addEventListener('DOMContentLoaded', () => {
    // Сначала обновляем шапку, чтобы пользователь сразу видел свой статус (Вошел/Не вошел)
    updateAuthHeader();

    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');

    // 1. Переключение табов (Вход / Регистрация)
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));

            tab.classList.add('active');
            const targetFormId = tab.getAttribute('data-tab');
            const targetForm = document.getElementById(targetFormId);
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });

    const API_URL = 'http://localhost:3000/users';

    // 2. Обработка РЕГИСТРАЦИИ
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim().toLowerCase();
            const phone = document.getElementById('reg-phone').value.trim();
            const password = document.getElementById('reg-password').value;

            try {
                // Получаем ВСЕХ пользователей для проверки уникальности email
                const checkResponse = await fetch(API_URL);
                const allUsers = await checkResponse.json();

                // Ищем, есть ли уже такой email
                const emailExists = allUsers.some(user => user.email === email);

                if (emailExists) {
                    alert('Пользователь с таким E-mail уже зарегистрирован!');
                    return;
                }

                // Создаем нового пользователя
                const newUser = {
                    id: String(Date.now()),
                    name: name,
                    email: email,
                    phone: phone,
                    password: password,
                    role: 'user'
                };

                // Записываем в БД
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (response.ok) {
                    alert('Регистрация успешна! Теперь войдите в аккаунт.');
                    registerForm.reset();
                    
                    // Автоматически переключаем на вкладку "Вход"
                    const loginTabBtn = document.querySelector('[data-tab="login-form"]');
                    if (loginTabBtn) {
                        loginTabBtn.click();
                    }
                }

            } catch (error) {
                console.error('Ошибка при регистрации:', error);
                alert('Не удалось связаться с сервером.');
            }
        });
    }

    // 3. Обработка ВХОДА
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            try {
                // Получаем массив пользователей с сервера
                const response = await fetch(API_URL);
                const allUsers = await response.json();

                // Ищем совпадение email и пароля
                const foundUser = allUsers.find(user => user.email === email && user.password === password);

                if (foundUser) {
                    alert(`Успешный вход! Добро пожаловать, ${foundUser.name}.`);

                    // Сохраняем данные в localStorage
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: foundUser.id,
                        name: foundUser.name,
                        email: foundUser.email,
                        role: foundUser.role
                    }));

                    // Обновляем шапку и перенаправляем на главную страницу
                    updateAuthHeader();
                    window.location.href = 'index.html'; 
                } else {
                    alert('Неверный Email или Пароль!');
                }

            } catch (error) {
                console.error('Ошибка при авторизации:', error);
                alert('Не удалось связаться с сервером.');
            }
        });
    }
});


function updateAuthHeader() {
    const authZone = document.getElementById('auth-zone');
    if (!authZone) return;

    const userRaw = localStorage.getItem('currentUser');

    if (userRaw) {
        // --- 1. ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН ---
        const user = JSON.parse(userRaw);
        const lkPage = user.role === 'admin' ? 'admin.html' : 'lk.html';

        // Сохраняем твою родную структуру, но адаптируем под данные юзера
        authZone.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <a href="${lkPage}" class="header-cabinet">
                    <div class="cabinet-icon">
                        <img src="assets/iconoir_profile-circle.png" class="cabinet-icon" alt="Профиль">
                    </div>
                    <div class="cabinet-text">
                        <span class="cabinet-title">${user.name}</span>
                        <span class="cabinet-desc">Личный кабинет</span>
                    </div>
                </a>
                <span style="color: rgba(255,255,255,0.3); font-family: 'Roboto', sans-serif; font-size: 12px;">|</span>
                <a href="javascript:void(0)" id="logout-btn" style="color: #ffb0b9; text-decoration: none; font-family: 'Roboto', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'; this.style.color='#ff4d4d'" onmouseout="this.style.opacity='0.9'; this.style.color='#ffb0b9'">
                    Выйти <i class="fa fa-sign-out" aria-hidden="true" style="margin-left: 3px;"></i>
                </a>
            </div>
        `;

        // Логика кнопки "Выйти"
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            alert('Вы вышли из профиля.');
            updateAuthHeader();
            window.location.href = 'index.html';
        });

    } else {
        // --- 2. ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН ---
        // Твоя исходная чистая вёрстка один в один
        authZone.innerHTML = `
            <a href="auth.html" class="header-cabinet">
                <div class="cabinet-icon">
                    <img src="assets/iconoir_profile-circle.png" class="cabinet-icon" alt="Профиль">
                </div>
                <div class="cabinet-text">
                    <span class="cabinet-title">Кабинет</span>
                    <span class="cabinet-desc">Вход для клиентов</span>
                </div>
            </a>
        `;
    }
}
