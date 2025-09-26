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
    initializeSearch();
    
    // Восстановить состояние фильтра при загрузке страницы
    const savedFilter = sessionStorage.getItem('nbaFilter');
    if (savedFilter) {
        // Небольшая задержка, чтобы убедиться, что DOM полностью загружен
        setTimeout(() => {
            if (window.filterTeams && typeof window.filterTeams === 'function') {
                window.filterTeams(savedFilter);
            }
        }, 100);
    } else {
        // По умолчанию показывать избранные
        setTimeout(() => {
            if (window.filterTeams && typeof window.filterTeams === 'function') {
                window.filterTeams('favorites');
            }
        }, 100);
    }
    
    // Обработчик события pageshow для восстановления состояния при возврате по истории
    window.addEventListener('pageshow', function(event) {
        // При возврате по истории браузера восстановить состояние фильтра
        if (event.persisted) {
            const savedFilter = sessionStorage.getItem('nbaFilter') || 'favorites';
            setTimeout(() => {
                if (window.filterTeams && typeof window.filterTeams === 'function') {
                    window.filterTeams(savedFilter);
                }
            }, 50);
        }
    });
    
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
        // Добавить небольшую задержку для правильного пересчета
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
            
            // Пересчитать высоту области просмотра
            if (typeof setupMobileViewport === 'function') {
                setupMobileViewport();
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
    console.log(`Cookie ${name}:`, cookieValue);
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
            console.log('Toggle favorite response:', data);
            updateFavoriteUI(teamId, data.is_favorite, data.favorite_count);
            // Обновить фильтрацию после изменения избранного
            setTimeout(() => {
                const activeFilter = sessionStorage.getItem('nbaFilter') || 'favorites';
                if (window.filterTeams && typeof window.filterTeams === 'function') {
                    window.filterTeams(activeFilter);
                }
            }, 100); // Небольшая задержка для завершения обновления UI
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
    console.log(`Updating favorite UI for team ${teamId}, isFavorite: ${isFavorite}, count: ${favoriteCount}`);
    // Обновить все кнопки избранного для этой команды
    const teamCards = document.querySelectorAll(`[data-team-id="${teamId}"]`);
    console.log(`Found ${teamCards.length} team cards for team ${teamId}`);
    teamCards.forEach(teamCard => {
        const favoriteBtn = teamCard.querySelector('.favorite-btn');
        if (favoriteBtn) {
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
        
        // Обновить атрибут data-is-favorite для корректной фильтрации
        teamCard.dataset.isFavorite = isFavorite ? 'true' : 'false';
        console.log(`Updated team ${teamId} data-is-favorite to ${isFavorite ? 'true' : 'false'}`);
    });
    
    // Обновить кнопку в модальном окне, если она существует
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
    
    // Обновить фильтрацию после изменения избранного
    setTimeout(() => {
        const activeFilter = sessionStorage.getItem('nbaFilter') || 'favorites';
        if (window.filterTeams && typeof window.filterTeams === 'function') {
            window.filterTeams(activeFilter);
        }
    }, 100); // Небольшая задержка для завершения обновления UI
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
    // Инициализировать события карточек команд
    initializeTeamCardEvents();
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
    
    // Добавить обработку изменения размера окна для адаптивных элементов
    window.addEventListener('resize', function() {
        // Обновить позиционирование элементов при изменении размера
        const teamsGrid = document.querySelector('.teams-grid');
        if (teamsGrid) {
            teamsGrid.style.display = 'none';
            teamsGrid.offsetHeight; // Триггер перерасчета
            teamsGrid.style.display = 'grid';
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
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.width = '100%';
        
        // Управление фокусом
        const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Добавить закрытие при клике на фон (однократно)
        if (!modal.dataset.bgClickBound) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
            modal.dataset.bgClickBound = '1';
        }
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
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
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

// (удалено) validatePreferencesForm — не используется
// (удалено) searchTeams — дублировала поиск внутри filterTeams

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
    console.log('Filtering teams with filter:', filter);
    const allTeams = document.querySelectorAll('.team-card');
    console.log('Total teams:', allTeams.length);
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Сохранить состояние фильтра в sessionStorage
    sessionStorage.setItem('nbaFilter', filter);
    
    // Обновить активную кнопку
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Фильтровать команды
    allTeams.forEach(team => {
        // Для фильтра "избранное" проверяем атрибут data-is-favorite
        if (filter === 'all') {
            // Для "всех команд", показать все команды
            team.style.display = 'block';
        } else if (filter === 'favorites') {
            // Для "избранных" проверяем атрибут data-is-favorite
            const isFavorite = team.dataset.isFavorite === 'true';
            team.style.display = isFavorite ? 'block' : 'none';
            console.log(`Team ${team.dataset.teamId} favorite status: ${isFavorite}`);
        }
    });
    
    // Показать сообщение, если нет избранных
    const visibleFavorites = Array.from(allTeams).filter(team => team.dataset.isFavorite === 'true' && team.style.display !== 'none');
    console.log('Visible favorites count:', visibleFavorites.length);
    if (filter === 'favorites' && visibleFavorites.length === 0) {
        showNoFavoritesMessage();
    } else {
        hideNoFavoritesMessage();
    }
    
    // Обновить состояние поиска при переключении фильтров
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        if (filter === 'all') {
            searchBar.style.display = 'block';
            // При переключении на "все команды" выполнить поиск, если есть поисковый запрос
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                // Выполнить поиск только если есть значение для поиска
                if (searchInput.value.trim() !== '') {
                    performSearch(searchInput.value);
                }
            }
        } else {
            searchBar.style.display = 'none';
            // Очистить поиск при переключении на избранные
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
                // Не выполнять поиск с пустым запросом
            }
        }
    }
}

// Добавим обработчик для динамического поиска
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchForm = searchInput ? searchInput.closest('form') : null;
    
    if (searchInput) {
        // Предотвратить отправку формы при нажатии Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Выполнить поиск немедленно
                performSearch(this.value);
            }
        });
        
        // Предотвратить отправку формы при нажатии кнопки поиска
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Выполнить поиск немедленно
                performSearch(searchInput.value);
            });
        }
        
        // Добавить обработчик для динамического поиска
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            // Очистить предыдущий таймаут
            clearTimeout(searchTimeout);
            
            // Установить новый таймаут для debounce
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300); // Задержка 300 мс
        });
    }
}

// Функция для выполнения поиска через AJAX
function performSearch(searchTerm) {
    // Получить CSRF токен
    const csrftoken = getCookie('csrftoken');
    
    // Выполнить AJAX-запрос
    // Важно: даже если searchTerm пустой, мы все равно выполняем запрос для получения всех команд
    fetch(`/?search=${encodeURIComponent(searchTerm || '')}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        updateTeamsDisplay(data.teams);
    })
    .catch(error => {
        console.error('Ошибка поиска:', error);
    });
}

// Функция для обновления отображения команд
function updateTeamsDisplay(teams) {
    const teamsGrid = document.querySelector('.teams-grid');
    if (!teamsGrid) return;
    
    // Очистить текущее содержимое
    while (teamsGrid.firstChild) {
        teamsGrid.removeChild(teamsGrid.firstChild);
    }
    
    // Если нет команд, показать сообщение
    if (teams.length === 0) {
        const noTeamsMessage = document.createElement('div');
        noTeamsMessage.className = 'no-teams';
        noTeamsMessage.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>Команды не найдены</h3>
            <p>Попробуйте изменить поисковый запрос</p>
        `;
        teamsGrid.appendChild(noTeamsMessage);
        return;
    }
    
    // Получить текущие избранные команды из cookies для синхронизации
    let favoriteList = [];
    try {
        const favoritesCookie = getCookie('favorite_teams');
        console.log('Favorites cookie value:', favoritesCookie);
        if (favoritesCookie) {
            favoriteList = JSON.parse(favoritesCookie);
            console.log('Favorite list from cookies:', favoriteList);
        }
    } catch (e) {
        console.error('Ошибка при разборе избранных команд:', e);
    }
    
    // Создать HTML для каждой команды
    teams.forEach(team => {
        // Убедиться, что статус избранного синхронизирован
        const isFavorite = favoriteList.includes(team.id);
        console.log(`Team ${team.id} is favorite: ${isFavorite}`);
        
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.dataset.teamId = team.id;
        // Добавляем атрибут для отслеживания избранного статуса
        teamCard.dataset.isFavorite = isFavorite ? 'true' : 'false';
        
        // Получить текущий язык для переводов
        const currentLang = getCookie('django_language') || 'en';
        
        // Определить тексты в зависимости от языка
        const removeFromFavoritesText = currentLang === 'ru' ? 'Убрать из избранного' : 'Remove from favorites';
        const addToFavoritesText = currentLang === 'ru' ? 'Добавить в избранное' : 'Add to favorites';
        const quickInfoText = currentLang === 'ru' ? 'Быстрая информация' : 'Quick Info';
        const conferenceText = currentLang === 'ru' ? 'Конференция:' : 'Conference:';
        const divisionText = currentLang === 'ru' ? 'Дивизион:' : 'Division:';
        
        teamCard.innerHTML = `
            <div class="team-header">
                <div class="team-logo">
                    <div class="team-initials" data-color1="${team.colors[0]}" data-color2="${team.colors[1] || team.colors[0]}">
                    </div>
                </div>
                <button class="favorite-btn toggle-favorite-btn ${isFavorite ? 'active' : ''}" 
                        data-team-id="${team.id}"
                        title="${isFavorite ? removeFromFavoritesText : addToFavoritesText}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            
            <div class="team-info">
                <h3 class="team-name">${team.name}</h3>
                <p class="team-city"><i class="fas fa-map-marker-alt"></i> ${team.city}</p>
                
                <div class="team-details">
                    <div class="detail-item">
                        <span class="detail-label">${conferenceText}</span>
                        <span class="detail-value">${team.conference}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">${divisionText}</span>
                        <span class="detail-value">${team.division}</span>
                    </div>
                </div>
                
                <button class="btn btn-primary team-info-btn" data-team-id="${team.id}">
                    <i class="fas fa-info-circle"></i>
                    ${quickInfoText}
                </button>
            </div>
        `;
        
        teamsGrid.appendChild(teamCard);
    });
    
    // Переинициализировать обработчики событий для новых элементов
    initializeTeamCardEvents();
    
    // Применить текущий фильтр после обновления
    const currentFilter = sessionStorage.getItem('nbaFilter') || 'favorites';
    filterTeams(currentFilter);
}

// Функция для инициализации обработчиков событий карточек команд
function initializeTeamCardEvents() {
    // Инициализировать цвета команд
    document.querySelectorAll('.team-initials[data-color1]').forEach(element => {
        const color1 = element.dataset.color1;
        const color2 = element.dataset.color2;
        element.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
    });
    
    // Добавить обработчики для кнопок избранного
    document.querySelectorAll('.toggle-favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const teamId = parseInt(this.dataset.teamId);
            toggleFavorite(teamId);
        });
    });
    
    // Добавить обработчики для кнопок информации
    document.querySelectorAll('.team-info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const teamId = parseInt(this.dataset.teamId);
            showTeamInfo(teamId);
        });
    });
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