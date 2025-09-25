// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Основная функция инициализации приложения
function initializeApp() {
    initializeTheme();
    setupCSRF();
    initializeInteractivity();
    setupKeyboardNavigation();
    initializeLanguageHandling();
    setupMobileViewport();
    setupOrientationChange();
    console.log('Приложение для баскетбольных фанатов инициализировано');
}

// Настройка обработки мобильной области просмотра
function setupMobileViewport() {
    // Обработка проблем с высотой мобильной области просмотра
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 100);
    });
}

// Обработка изменений ориентации устройства
function setupOrientationChange() {
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Пересчитать сетку команд
            const teamsGrid = document.querySelector('.teams-grid');
            if (teamsGrid) {
                // Принудительный перерасчет
                teamsGrid.style.display = 'none';
                teamsGrid.offsetHeight; // Триггер перерасчета
                teamsGrid.style.display = 'grid';
            }
            
            // Закрыть открытые модальные окна при изменении ориентации для лучшего UX
            const openModals = document.querySelectorAll('.modal[style*="flex"]');
            if (openModals.length > 0) {
                closeModal();
            }
        }, 300);
    });
}

// Инициализация темы оформления
function initializeTheme() {
    const savedTheme = getCookie('theme') || 'light';
    console.log('Инициализация темы:', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeInputs = document.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
        if (input.value === savedTheme) {
            input.checked = true;
        }
    });
    const appliedTheme = document.documentElement.getAttribute('data-theme');
    console.log('Тема успешно применена:', appliedTheme);
}

// Настройка CSRF токена
function setupCSRF() {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
        window.csrfToken = csrftoken;
    }
}

// Получение значения cookie по имени
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Установка cookie
function setCookie(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

// Переключение избранного для команды
function toggleFavorite(teamId) {
    const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
    const favoriteBtn = teamCard ? teamCard.querySelector('.favorite-btn') : document.querySelector('.btn-favorite');
    
    if (favoriteBtn) {
        favoriteBtn.disabled = true;
        favoriteBtn.style.opacity = '0.6';
    }
    
    fetch('/toggle-favorite/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken || getCookie('csrftoken')
        },
        body: JSON.stringify({
            team_id: teamId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            updateFavoriteUI(teamId, data.is_favorite, data.favorite_count);
        } else {
            throw new Error(data.error || 'Произошла неизвестная ошибка');
        }
    })
    .catch(error => {
        console.error('Ошибка переключения избранного:', error);
    })
    .finally(() => {
        if (favoriteBtn) {
            favoriteBtn.disabled = false;
            favoriteBtn.style.opacity = '1';
        }
    });
}

// Обновление интерфейса избранного
function updateFavoriteUI(teamId, isFavorite, favoriteCount) {
    const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
    if (teamCard) {
        const favoriteBtn = teamCard.querySelector('.favorite-btn');
        const heartIcon = favoriteBtn.querySelector('i');
        
        if (isFavorite) {
            favoriteBtn.classList.add('active');
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            favoriteBtn.title = 'Убрать из избранного';
        } else {
            favoriteBtn.classList.remove('active');
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            favoriteBtn.title = 'Добавить в избранное';
        }
    }
    
    const detailBtn = document.querySelector('.btn-favorite');
    if (detailBtn) {
        if (isFavorite) {
            detailBtn.classList.add('active');
            detailBtn.innerHTML = '<i class="fas fa-heart"></i> Убрать из избранного';
            detailBtn.title = 'Убрать из избранного';
        } else {
            detailBtn.classList.remove('active');
            detailBtn.innerHTML = '<i class="far fa-heart"></i> Добавить в избранное';
            detailBtn.title = 'Добавить в избранное';
        }
    }
    
    updateFavoriteCounters(favoriteCount);
}

// Обновление счетчиков избранных
function updateFavoriteCounters(count) {
    const counters = [
        '#favorites-count',
        '#hero-favorites-count', 
        '#footer-favorites-count'
    ];
    
    counters.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = count;
            element.style.transform = 'scale(1.2)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

let themeChangeInProgress = false;
let themeChangeTimeout = null;

// Предварительный просмотр темы
function previewTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (!themeChangeInProgress) {
        changeThemeAjax(theme);
    }
    
    console.log(`Тема изменена на ${theme}`);
}

// Изменение темы через AJAX
function changeThemeAjax(theme) {
    if (themeChangeInProgress) {
        console.log('Изменение темы уже выполняется, пропуск');
        return;
    }
    
    setCookie('theme', theme, 365);
    console.log('Тема сохранена в cookie немедленно:', theme);
    
    if (themeChangeTimeout) {
        clearTimeout(themeChangeTimeout);
    }
    
    themeChangeTimeout = setTimeout(() => {
        executeThemeChange(theme);
    }, 300);
}

// Выполнение изменения темы
function executeThemeChange(theme) {
    if (themeChangeInProgress) {
        return;
    }
    
    themeChangeInProgress = true;
    
    fetch('/change-theme/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken || getCookie('csrftoken')
        },
        body: JSON.stringify({
            theme: theme
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Тема успешно сохранена:', data.theme);
            setCookie('theme', theme, 365);
        } else {
            throw new Error(data.error || 'Произошла неизвестная ошибка');
        }
    })
    .catch(error => {
        console.error('Ошибка сохранения темы через AJAX:', error);
        setCookie('theme', theme, 365);
        console.log('Тема сохранена в cookie как резервный вариант:', theme);
        console.log('Тема изменена (сохранена локально)');
    })
    .finally(() => {
        themeChangeInProgress = false;
        if (themeChangeTimeout) {
            clearTimeout(themeChangeTimeout);
            themeChangeTimeout = null;
        }
    });
}

// Инициализация интерактивности
function initializeInteractivity() {
    // Проверка поддержки сенсорного устройства
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        if (!isTouchDevice) {
            // Добавить эффекты наведения только для несенсорных устройств
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        } else {
            // Добавить обратную связь для сенсорных устройств
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
        }
    });
    
    // Улучшить взаимодействие с кнопками для сенсорных устройств
    const buttons = document.querySelectorAll('.btn, .favorite-btn, .team-info-btn');
    buttons.forEach(button => {
        if (isTouchDevice) {
            // Добавить обратную связь при касании
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
                this.style.opacity = '0.8';
            }, { passive: true });
            
            button.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                    this.style.opacity = '1';
                }, 100);
            }, { passive: true });
        }
    });
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Добавить предотвращение двойного касания для кнопок избранного
    let lastTouchTime = 0;
    document.querySelectorAll('.toggle-favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (isTouchDevice) {
                const now = Date.now();
                if (now - lastTouchTime < 500) {
                    e.preventDefault();
                    return;
                }
                lastTouchTime = now;
            }
            
            const teamId = parseInt(this.dataset.teamId);
            toggleFavorite(teamId);
        });
    });
    
    document.querySelectorAll('.team-info-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (isTouchDevice) {
                const now = Date.now();
                if (now - lastTouchTime < 500) {
                    e.preventDefault();
                    return;
                }
                lastTouchTime = now;
            }
            
            const teamId = parseInt(this.dataset.teamId);
            showTeamInfo(teamId);
        });
    });
    
    // Добавить поддержку свайпа для модальных окон на мобильных устройствах
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (isTouchDevice) {
            addSwipeToClose(modal);
        }
    });
}

// Настройка навигации с клавиатуры
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    closeModal();
                }
            });
        }
        
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = '/';
        }
        
        // Ctrl+P для настроек
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.location.href = '/preferences/';
        }
    });
}

// Функциональность свайпа для закрытия модального окна
function addSwipeToClose(modal) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const modalContent = modal.querySelector('.modal-content');
    
    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        isDragging = true;
        modalContent.style.transition = 'none';
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Разрешить только свайп вниз
        if (deltaY > 0) {
            const opacity = Math.max(0.3, 1 - (deltaY / 300));
            modal.style.backgroundColor = `rgba(0, 0, 0, ${opacity * 0.5})`;
            modalContent.style.transform = `translateY(${deltaY}px)`;
        }
    }
    
    function handleTouchEnd(e) {
        if (!isDragging) return;
        
        const deltaY = currentY - startY;
        modalContent.style.transition = 'transform 0.3s ease';
        
        if (deltaY > 100) {
            // Закрыть модальное окно, если свайп вниз достаточен
            closeModal();
        } else {
            // Сбросить позицию
            modalContent.style.transform = 'translateY(0)';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }
        
        isDragging = false;
    }
    
    modalContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalContent.addEventListener('touchmove', handleTouchMove, { passive: true });
    modalContent.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// Улучшение доступности модальных окон для мобильных устройств
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        // Предотвратить прокрутку body на мобильных устройствах
        document.body.style.overflow = 'hidden';
        
        // Управление фокусом
        const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Добавить закрытие при клике на фон
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Закрытие модального окна
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        
        // Сбросить позицию содержимого модального окна
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.transition = '';
        }
        
        // Сбросить фон модального окна
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    });
    
    // Восстановить прокрутку body
    document.body.style.overflow = '';
}

// Модальное окно подтверждения
function showConfirmModal(message, confirmCallback) {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmBtn').onclick = function() {
            confirmCallback();
            closeModal();
        };
        showModal('confirmModal');
    } else {
        // Резервный вариант через браузерное подтверждение
        if (confirm(message)) {
            confirmCallback();
        }
    }
}

// Очистка всех избранных
function clearAllFavorites() {
    showConfirmModal(
        'Вы уверены, что хотите удалить все избранные команды? Это действие нельзя отменить.',
        function() {
            setCookie('favorite_teams', '[]', 365);
            console.log('Все избранные очищены');
            location.reload();
        }
    );
}

// Сброс настроек к значениям по умолчанию
function resetToDefaults() {
    showConfirmModal(
        'Сбросить все настройки к значениям по умолчанию? Это очистит ваш язык, тему и избранные команды.',
        function() {
            // Очистить все cookies настроек
            setCookie('django_language', '', -1);
            setCookie('theme', '', -1);
            setCookie('favorite_teams', '[]', -1);
            
            // Сбросить к значениям по умолчанию
            document.documentElement.setAttribute('data-theme', 'light');
            
            console.log('Настройки сброшены к значениям по умолчанию');
            location.reload();
        }
    );
}

// Функциональность обмена
function shareTeam(teamName, teamDescription) {
    if (navigator.share) {
        navigator.share({
            title: teamName || 'Баскетбольная команда',
            text: teamDescription || 'Посмотрите эту баскетбольную команду!',
            url: window.location.href
        }).catch(err => {
            console.log('Ошибка обмена:', err);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

// Резервный вариант обмена
function fallbackShare() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
            console.log('Ссылка на команду скопирована в буфер обмена!');
        }).catch(() => {
            console.log('Не удалось скопировать ссылку');
        });
    } else {
        console.log('Обмен не поддерживается на этом устройстве');
    }
}

// Функциональность печати
function printTeamInfo() {
    window.print();
}

// Обработчик выбора языка
let languageChangeInProgress = false;
let languageChangeTimeout = null;

// Обновление отображения языка
function updateLanguageDisplay() {
    const languageSelect = document.getElementById('language');
    const display = document.getElementById('current-language-display');
    
    if (languageSelect && display) {
        const selectedOption = languageSelect.options[languageSelect.selectedIndex];
        display.textContent = selectedOption.text;
    }
}

// Переключение языка через AJAX с предотвращением бесконечных запросов
function changeLanguageAjax(language) {
    // Предотвратить несколько одновременных запросов
    if (languageChangeInProgress) {
        console.log('Изменение языка уже выполняется, пропуск');
        return;
    }
    
    // Также сохранить в cookie немедленно для немедленного сохранения
    setCookie('django_language', language, 365);
    console.log('Язык сохранен в cookie немедленно:', language);
    
    // Очистить любые ожидающие таймауты
    if (languageChangeTimeout) {
        clearTimeout(languageChangeTimeout);
    }
    
    // Дебаунсинг запроса
    languageChangeTimeout = setTimeout(() => {
        executeLanguageChange(language);
    }, 300);
}

// Выполнение изменения языка
function executeLanguageChange(language) {
    if (languageChangeInProgress) {
        return;
    }
    
    languageChangeInProgress = true;
    
    // Немедленная обратная связь с пользователем
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.disabled = true;
    }
    
    // Показать обратную связь в консоли
    console.log('Изменение языка...');
    
    fetch('/change-language/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken || getCookie('csrftoken')
        },
        body: JSON.stringify({
            language: language
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Немедленно обновить интерфейс
            updateLanguageDisplay();
            
            // Перезагрузить страницу через короткую задержку для применения изменений языка
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(data.error || 'Произошла неизвестная ошибка');
        }
    })
    .catch(error => {
        console.error('Ошибка изменения языка через AJAX:', error);
        // Резервный вариант: сохранить напрямую в cookie (уже сделано выше)
        console.log('Язык сохранен в cookie как резервный вариант:', language);
        
        // Немедленно обновить интерфейс
        updateLanguageDisplay();
        
        // Перезагрузить страницу через короткую задержку для применения изменений языка
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    })
    .finally(() => {
        // Очистка
        languageChangeInProgress = false;
        
        if (languageSelect) {
            languageSelect.disabled = false;
        }
        
        // Очистить таймаут
        if (languageChangeTimeout) {
            clearTimeout(languageChangeTimeout);
            languageChangeTimeout = null;
        }
    });
}

// Инициализация обработчика изменения языка
function initializeLanguageHandling() {
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        // Удалить любые существующие обработчики для предотвращения дубликатов
        languageSelect.removeEventListener('change', handleLanguageChange);
        
        // Добавить новый обработчик
        languageSelect.addEventListener('change', handleLanguageChange);
    }
}

// Обработчик изменения языка
function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    if (selectedLanguage) {
        changeLanguageAjax(selectedLanguage);
    }
}

// Валидация формы
function validatePreferencesForm(form) {
    const language = form.querySelector('select[name="language"]');
    const theme = form.querySelector('input[name="theme"]:checked');
    
    if (!language || !language.value) {
        console.error('Пожалуйста, выберите язык');
        return false;
    }
    
    if (!theme) {
        console.error('Пожалуйста, выберите тему');
        return false;
    }
    
    return true;
}

// Функциональность поиска (если потребуется в будущем)
function searchTeams(query) {
    const teams = document.querySelectorAll('.team-card');
    const searchTerm = query.toLowerCase();
    
    teams.forEach(team => {
        const name = team.querySelector('.team-name').textContent.toLowerCase();
        const city = team.querySelector('.team-city').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || city.includes(searchTerm)) {
            team.style.display = 'block';
        } else {
            team.style.display = 'none';
        }
    });
}

// Мониторинг производительности
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Страница загружена за ${loadTime}мс`);
    }
}

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Ошибка JavaScript:', e.error);
});

// Загрузка мониторинга производительности
window.addEventListener('load', logPerformance);

// Функциональность модального окна информации о команде
function showTeamInfo(teamId) {
    // Найти данные команды на странице
    const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
    if (!teamCard) return;
    
    const teamName = teamCard.querySelector('.team-name')?.textContent || 'Неизвестная команда';
    const teamCity = teamCard.querySelector('.team-city')?.textContent || 'Неизвестный город';
    const conference = teamCard.querySelector('.detail-value')?.textContent || 'Неизвестно';
    
    // Получить или создать модальное окно
    let modal = document.getElementById('teamModal');
    if (!modal) {
        createTeamModal();
        modal = document.getElementById('teamModal');
    }
    
    // Заполнить содержимое модального окна
    const modalTeamName = modal.querySelector('#modalTeamName');
    const modalTeamCity = modal.querySelector('#modalTeamCity');
    const modalConference = modal.querySelector('#modalConference');
    const modalTeamInitials = modal.querySelector('#modalTeamInitials');
    
    if (modalTeamName) modalTeamName.textContent = teamName;
    if (modalTeamCity) modalTeamCity.textContent = teamCity;
    if (modalConference) modalConference.textContent = conference;
    if (modalTeamInitials) {
        modalTeamInitials.textContent = teamName.slice(0, 2).toUpperCase();
        // Копировать цвета из оригинальной карточки команды
        const originalInitials = teamCard.querySelector('.team-initials');
        if (originalInitials) {
            const style = window.getComputedStyle(originalInitials);
            modalTeamInitials.style.background = style.background;
        }
    }
    
    showModal('teamModal');
}

// Создать модальное окно команды динамически, если оно не существует
function createTeamModal() {
    const modalHTML = `
        <div id="teamModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close" onclick="closeModal()">&times;</span>
                    <h2 id="modalTeamName">Название команды</h2>
                </div>
                <div class="modal-body">
                    <div class="modal-team-logo">
                        <div id="modalTeamInitials" class="team-initials-modal"></div>
                    </div>
                    <div class="modal-team-info">
                        <p class="modal-team-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span id="modalTeamCity">Город</span>
                        </p>
                        <div class="modal-team-badges">
                            <span id="modalConference" class="badge conference-badge">Конференция</span>
                        </div>
                        <p id="modalTeamDescription" class="team-description">
                            Краткая информация об этой баскетбольной команде.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Добавить поддержку свайпа, если сенсорное устройство
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        const modal = document.getElementById('teamModal');
        addSwipeToClose(modal);
    }
}

// Функция фильтрации команд
function filterTeams(filter) {
    const allTeams = document.querySelectorAll('.team-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Обновить активную кнопку
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Фильтровать команды
    allTeams.forEach(team => {
        const favoriteBtn = team.querySelector('.favorite-btn');
        // Проверить, является ли команда избранной на основе активного класса кнопки
        const isFavorite = favoriteBtn && favoriteBtn.classList.contains('active');
        
        if (filter === 'all') {
            // Для "всех команд", показать все команды, соответствующие поиску (или все, если нет поиска)
            const searchInput = document.getElementById('searchInput');
            const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            
            if (searchTerm) {
                // Если есть поисковый запрос, проверить, соответствует ли команда поиску
                const name = team.querySelector('.team-name').textContent.toLowerCase();
                const city = team.querySelector('.team-city').textContent.toLowerCase();
                const matchesSearch = name.includes(searchTerm) || city.includes(searchTerm);
                team.style.display = matchesSearch ? 'block' : 'none';
            } else {
                // Если нет поискового запроса, показать все команды
                team.style.display = 'block';
            }
        } else if (filter === 'favorites') {
            team.style.display = isFavorite ? 'block' : 'none';
        }
    });
    
    // Показать сообщение, если нет избранных
    const visibleFavorites = document.querySelectorAll('.team-card .favorite-btn.active');
    if (filter === 'favorites' && visibleFavorites.length === 0) {
        showNoFavoritesMessage();
    } else {
        hideNoFavoritesMessage();
    }
}

// Показать сообщение об отсутствии избранных
function showNoFavoritesMessage() {
    let message = document.querySelector('.no-favorites-message');
    if (!message) {
        message = document.createElement('div');
        message.className = 'no-favorites-message';
        
        // Получить текущий язык для переводов
        const currentLang = getCookie('django_language') || 'en';
        
        let title, description;
        if (currentLang === 'ru') {
            title = 'Пока нет избранных команд';
            description = 'Нажмите на иконку сердца у любой команды, чтобы добавить её в избранное.';
        } else {
            title = 'No favorite teams yet';
            description = 'Click the heart icon on any team to add it to your favorites.';
        }
        
        message.innerHTML = `
            <div class="no-teams">
                <i class="fas fa-heart"></i>
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;
        const teamsGrid = document.querySelector('.teams-grid');
        if (teamsGrid) {
            teamsGrid.appendChild(message);
        }
    }
    message.style.display = 'block';
}

// Скрыть сообщение об отсутствии избранных
function hideNoFavoritesMessage() {
    const message = document.querySelector('.no-favorites-message');
    if (message) {
        message.style.display = 'none';
    }
}

window.toggleFavorite = toggleFavorite;
window.previewTheme = previewTheme;
window.showConfirmModal = showConfirmModal;
window.closeModal = closeModal;
window.clearAllFavorites = clearAllFavorites;
window.resetToDefaults = resetToDefaults;
window.shareTeam = shareTeam;
window.printTeamInfo = printTeamInfo;
window.updateLanguageDisplay = updateLanguageDisplay;
window.changeLanguageAjax = changeLanguageAjax;
window.changeThemeAjax = changeThemeAjax;
window.filterTeams = filterTeams;
window.showNoFavoritesMessage = showNoFavoritesMessage;
window.hideNoFavoritesMessage = hideNoFavoritesMessage;