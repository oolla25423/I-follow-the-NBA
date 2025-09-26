document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeTheme();
    setupCSRF();
    initializeInteractivity();
    setupKeyboardNavigation();
    initializeLanguageHandling();
    setupMobileViewport();
    setupOrientationChange();
    initializeSearch();
    
    const savedFilter = sessionStorage.getItem('nbaFilter');
    {
        setTimeout(() => {
            if (window.filterTeams && typeof window.filterTeams === 'function') {
                window.filterTeams('favorites');
            }
        }, 100);
    }
    
    window.addEventListener('pageshow', function(event) {
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

function setupMobileViewport() {
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

function setupCSRF() {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
        window.csrfToken = csrftoken;
    }
}

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

function setCookie(name, value, days = 365) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
}

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
            setTimeout(() => {
                const activeFilter = sessionStorage.getItem('nbaFilter') || 'favorites';
                if (window.filterTeams && typeof window.filterTeams === 'function') {
                    window.filterTeams(activeFilter);
                }
            }, 100);
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

function updateFavoriteUI(teamId, isFavorite, favoriteCount) {
    console.log(`Updating favorite UI for team ${teamId}, isFavorite: ${isFavorite}, count: ${favoriteCount}`);
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
        
        teamCard.dataset.isFavorite = isFavorite ? 'true' : 'false';
        console.log(`Updated team ${teamId} data-is-favorite to ${isFavorite ? 'true' : 'false'}`);
    });
    
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
    
    setTimeout(() => {
        const activeFilter = sessionStorage.getItem('nbaFilter') || 'favorites';
        if (window.filterTeams && typeof window.filterTeams === 'function') {
            window.filterTeams(activeFilter);
        }
    }, 100);
}

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

function previewTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (!themeChangeInProgress) {
        changeThemeAjax(theme);
    }
    
    console.log(`Тема изменена на ${theme}`);
}

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

function initializeInteractivity() {
    initializeTeamCardEvents();
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        if (!isTouchDevice) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        } else {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
        }
    });
    
    const buttons = document.querySelectorAll('.btn, .favorite-btn, .team-info-btn');
    buttons.forEach(button => {
        if (isTouchDevice) {
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
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (isTouchDevice) {
            addSwipeToClose(modal);
        }
    });
    
    window.addEventListener('resize', function() {
        const teamsGrid = document.querySelector('.teams-grid');
        if (teamsGrid) {
            teamsGrid.style.display = 'none';
            teamsGrid.offsetHeight;
            teamsGrid.style.display = 'grid';
        }
    });
}

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
        
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.location.href = '/preferences/';
        }
    });
}

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
            closeModal();
        } else {
            modalContent.style.transform = 'translateY(0)';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }
        
        isDragging = false;
    }
    
    modalContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalContent.addEventListener('touchmove', handleTouchMove, { passive: true });
    modalContent.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.width = '100%';
        
        const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
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

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.transition = '';
        }
        
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    });
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
}

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
        if (confirm(message)) {
            confirmCallback();
        }
    }
}

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

function resetToDefaults() {
    showConfirmModal(
        'Сбросить все настройки к значениям по умолчанию? Это очистит ваш язык, тему и избранные команды.',
        function() {
            setCookie('django_language', '', -1);
            setCookie('theme', '', -1);
            setCookie('favorite_teams', '[]', -1);
            
            document.documentElement.setAttribute('data-theme', 'light');
            
            console.log('Настройки сброшены к значениям по умолчанию');
            location.reload();
        }
    );
}

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

function printTeamInfo() {
    window.print();
}

let languageChangeInProgress = false;
let languageChangeTimeout = null;

function updateLanguageDisplay() {
    const languageSelect = document.getElementById('language');
    const display = document.getElementById('current-language-display');
    
    if (languageSelect && display) {
        const selectedOption = languageSelect.options[languageSelect.selectedIndex];
        display.textContent = selectedOption.text;
    }
}

function changeLanguageAjax(language) {
    if (languageChangeInProgress) {
        console.log('Изменение языка уже выполняется, пропуск');
        return;
    }
    
    setCookie('django_language', language, 365);
    console.log('Язык сохранен в cookie немедленно:', language);
    
    if (languageChangeTimeout) {
        clearTimeout(languageChangeTimeout);
    }
    
    languageChangeTimeout = setTimeout(() => {
        executeLanguageChange(language);
    }, 300);
}

function executeLanguageChange(language) {
    if (languageChangeInProgress) {
        return;
    }
    
    languageChangeInProgress = true;
    
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.disabled = true;
    }
    
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
            updateLanguageDisplay();
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(data.error || 'Произошла неизвестная ошибка');
        }
    })
    .catch(error => {
        console.error('Ошибка изменения языка через AJAX:', error);
        console.log('Язык сохранен в cookie как резервный вариант:', language);
        
        updateLanguageDisplay();
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    })
    .finally(() => {
        languageChangeInProgress = false;
        
        if (languageSelect) {
            languageSelect.disabled = false;
        }
        
        if (languageChangeTimeout) {
            clearTimeout(languageChangeTimeout);
            languageChangeTimeout = null;
        }
    });
}

function initializeLanguageHandling() {
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.removeEventListener('change', handleLanguageChange);
        
        languageSelect.addEventListener('change', handleLanguageChange);
    }
}

function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    if (selectedLanguage) {
        changeLanguageAjax(selectedLanguage);
    }
}

function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Страница загружена за ${loadTime}мс`);
    }
}

window.addEventListener('error', function(e) {
    console.error('Ошибка JavaScript:', e.error);
});

window.addEventListener('load', logPerformance);

function showTeamInfo(teamId) {
    const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
    if (!teamCard) return;
    
    const teamName = teamCard.querySelector('.team-name')?.textContent || 'Неизвестная команда';
    const teamCity = teamCard.querySelector('.team-city')?.textContent || 'Неизвестный город';
    const conference = teamCard.querySelector('.detail-value')?.textContent || 'Неизвестно';
    
    let modal = document.getElementById('teamModal');
    if (!modal) {
        createTeamModal();
        modal = document.getElementById('teamModal');
    }
    
    const modalTeamName = modal.querySelector('#modalTeamName');
    const modalTeamCity = modal.querySelector('#modalTeamCity');
    const modalConference = modal.querySelector('#modalConference');
    const modalTeamInitials = modal.querySelector('#modalTeamInitials');
    
    if (modalTeamName) modalTeamName.textContent = teamName;
    if (modalTeamCity) modalTeamCity.textContent = teamCity;
    if (modalConference) modalConference.textContent = conference;
    if (modalTeamInitials) {
        modalTeamInitials.textContent = teamName.slice(0, 2).toUpperCase();
        const originalInitials = teamCard.querySelector('.team-initials');
        if (originalInitials) {
            const style = window.getComputedStyle(originalInitials);
            modalTeamInitials.style.background = style.background;
        }
    }
    
    showModal('teamModal');
}

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
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        const modal = document.getElementById('teamModal');
        addSwipeToClose(modal);
    }
}

function filterTeams(filter) {
    console.log('Filtering teams with filter:', filter);
    const allTeams = document.querySelectorAll('.team-card');
    console.log('Total teams:', allTeams.length);
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    sessionStorage.setItem('nbaFilter', filter);
    
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    allTeams.forEach(team => {
        if (filter === 'all') {
            team.style.display = 'block';
        } else if (filter === 'favorites') {
            const isFavorite = team.dataset.isFavorite === 'true';
            team.style.display = isFavorite ? 'block' : 'none';
            console.log(`Team ${team.dataset.teamId} favorite status: ${isFavorite}`);
        }
    });
    
    const visibleFavorites = Array.from(allTeams).filter(team => team.dataset.isFavorite === 'true' && team.style.display !== 'none');
    console.log('Visible favorites count:', visibleFavorites.length);
    if (filter === 'favorites' && visibleFavorites.length === 0) {
        showNoFavoritesMessage();
    } else {
        hideNoFavoritesMessage();
    }
    
    const searchBar = document.getElementById('searchBar');
    if (searchBar) {
        if (filter === 'all') {
            searchBar.style.display = 'block';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                if (searchInput.value.trim() !== '') {
                    performSearch(searchInput.value);
                }
            }
        } else {
            searchBar.style.display = 'none';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }
        }
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchForm = searchInput ? searchInput.closest('form') : null;
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value);
            }
        });
        
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                performSearch(searchInput.value);
            });
        }
        
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }
}

function performSearch(searchTerm) {
    const csrftoken = getCookie('csrftoken');
    
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

function updateTeamsDisplay(teams) {
    const teamsGrid = document.querySelector('.teams-grid');
    if (!teamsGrid) return;
    
    while (teamsGrid.firstChild) {
        teamsGrid.removeChild(teamsGrid.firstChild);
    }
    
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
    
    teams.forEach(team => {
        const isFavorite = favoriteList.includes(team.id);
        console.log(`Team ${team.id} is favorite: ${isFavorite}`);
        
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.dataset.teamId = team.id;
        teamCard.dataset.isFavorite = isFavorite ? 'true' : 'false';
        
        const currentLang = getCookie('django_language') || 'en';
        
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
    
    initializeTeamCardEvents();
    
    const currentFilter = sessionStorage.getItem('nbaFilter') || 'favorites';
    filterTeams(currentFilter);
}

function initializeTeamCardEvents() {
    document.querySelectorAll('.team-initials[data-color1]').forEach(element => {
        const color1 = element.dataset.color1;
        const color2 = element.dataset.color2;
        element.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
    });
    
    document.querySelectorAll('.toggle-favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const teamId = parseInt(this.dataset.teamId);
            toggleFavorite(teamId);
        });
    });
    
    document.querySelectorAll('.team-info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const teamId = parseInt(this.dataset.teamId);
            showTeamInfo(teamId);
        });
    });
}

function showNoFavoritesMessage() {
    let message = document.querySelector('.no-favorites-message');
    if (!message) {
        message = document.createElement('div');
        message.className = 'no-favorites-message';
        
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