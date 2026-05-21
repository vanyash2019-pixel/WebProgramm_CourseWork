document.addEventListener('DOMContentLoaded', () => {
    // Сразу при загрузке страницы проверяем статус пользователя и обновляем шапку
    updateAuthHeader();

    // === ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (ВХОД / РЕГИСТРАЦИЯ) ===
    const tabButtons = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const targetForm = document.getElementById(tabId);
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });

    // === УПРАВЛЕНИЕ СПОСОБОМ ЗАДАНИЯ ПАРОЛЯ ===
    const passMethodRadios = document.querySelectorAll('input[name="pass-method"]');
    const manualPasswordBlock = document.getElementById('manual-password-block');
    const regPasswordInput = document.getElementById('reg-password');
    const regPasswordConfirmInput = document.getElementById('reg-password-confirm');

    passMethodRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'auto') {
                if (manualPasswordBlock) manualPasswordBlock.style.display = 'none';
                if (regPasswordInput) regPasswordInput.required = false;
                if (regPasswordConfirmInput) regPasswordConfirmInput.required = false;
            } else {
                if (manualPasswordBlock) manualPasswordBlock.style.display = 'block';
                if (regPasswordInput) regPasswordInput.required = true;
                if (regPasswordConfirmInput) regPasswordConfirmInput.required = true;
            }
        });
    });

    // === ГЕНЕРАЦИЯ НИКНЕЙМА ===
    const generateNickBtn = document.getElementById('btn-generate-nick');
    const nicknameInput = document.getElementById('reg-nickname');

    if (generateNickBtn && nicknameInput) {
        generateNickBtn.addEventListener('click', () => {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            nicknameInput.value = `User_${randomNum}`;
        });
    }

    // === АКТИВАЦИЯ КНОПКИ РЕГИСТРАЦИИ ПО ЧЕКБОКСУ ===
    const agreementCheckbox = document.getElementById('reg-agreement');
    const registerSubmitBtn = document.getElementById('btn-register-submit');

    if (agreementCheckbox && registerSubmitBtn) {
        agreementCheckbox.addEventListener('change', (e) => {
            registerSubmitBtn.disabled = !e.target.checked;
        });
    }

    // ==========================================
    // === ЛОГИКА АВТОРИЗАЦИИ (ВХОД) ===
    // ==========================================
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            try {
                // Ищем пользователя на сервере по email
                const response = await fetch(`http://localhost:3000/users?email=${email}`);
                
                if (!response.ok) {
                    throw new Error('Ошибка сервера при авторизации');
                }

                const users = await response.json();

                if (users.length > 0) {
                    const loggedUser = users[0];

                    // Сверяем пароль прямо в JavaScript
                    if (String(loggedUser.password) === String(password)) {
                        
                        // Сохраняем сессию в localStorage
                        localStorage.setItem('currentUser', JSON.stringify({
                            id: loggedUser.id,
                            name: loggedUser.name,
                            email: loggedUser.email,
                            role: loggedUser.role || 'user'
                        }));

                        alert(`Успешный вход! Добро пожаловать, ${loggedUser.name}.`);

                        // Обновляем шапку, чтобы сразу применились изменения
                        updateAuthHeader();

                        // Возвращаемся на главную страницу
                        window.location.href = 'index.html'; 
                    } else {
                        alert('Неверный Пароль!');
                    }
                } else {
                    alert('Пользователь с таким Email не найден!');
                }

            } catch (error) {
                console.error('Ошибка при авторизации:', error);
                alert('Не удалось связаться с сервером.');
            }
        });
    }

    // ==========================================
    // === ЛОГИКА РЕГИСТРАЦИИ ===
    // ==========================================
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const lastName = document.getElementById('reg-lastname').value.trim();
            const firstName = document.getElementById('reg-firstname').value.trim();
            const middleName = document.getElementById('reg-middlename').value.trim();
            const birthday = document.getElementById('reg-birthday').value;
            const email = document.getElementById('reg-email').value.trim().toLowerCase();
            const phone = document.getElementById('reg-phone').value.trim();
            const nickname = nicknameInput ? nicknameInput.value.trim() : '';
            const passMethod = document.querySelector('input[name="pass-method"]:checked').value;

            let password = '';

            if (passMethod === 'auto') {
                password = Math.random().toString(36).slice(-8); 
            } else {
                password = regPasswordInput.value;
                const passwordConfirm = regPasswordConfirmInput.value;

                if (password.length < 6) {
                    alert('Пароль должен быть не менее 6 символов!');
                    return;
                }
                if (password !== passwordConfirm) {
                    alert('Пароль и подтверждение не совпадают!');
                    return;
                }
            }

            // Склеиваем ФИО в одно поле name для совместимости с твоей шапкой
            const newUser = {
                id: String(Date.now()),
                name: `${lastName} ${firstName} ${middleName}`.trim(),
                email: email,
                phone: phone,
                birthday: birthday,
                nickname: nickname,
                password: password,
                role: "user"
            };

            try {
                const checkResponse = await fetch(`http://localhost:3000/users?email=${email}`);
                const existingUsers = await checkResponse.json();

                if (existingUsers.length > 0) {
                    alert('Пользователь с таким E-mail уже зарегистрирован!');
                    return;
                }

                const response = await fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });

                if (response.ok) {
                    if (passMethod === 'auto') {
                        alert(`Регистрация успешна! Ваш автоматически сгенерированный пароль: ${password}`);
                    } else {
                        alert('Регистрация успешна! Теперь войдите в аккаунт.');
                    }
                    
                    registerForm.reset();
                    const loginTabBtn = document.querySelector('[data-tab="login-form"]');
                    if (loginTabBtn) loginTabBtn.click();
                }

            } catch (error) {
                console.error('Ошибка при регистрации:', error);
                alert('Не удалось связаться с сервером.');
            }
        });
    }
});


// === ТВОЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ШАПКИ САЙТА ===
function updateAuthHeader() {
    const authZone = document.getElementById('auth-zone');
    if (!authZone) return;

    const userRaw = localStorage.getItem('currentUser');

    if (userRaw) {
        // --- 1. ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН ---
        const user = JSON.parse(userRaw);
        const lkPage = user.role === 'admin' ? 'admin.html' : 'lk.html';

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