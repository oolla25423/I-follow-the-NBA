/**
 * Спортивные Фанаты - Основной JavaScript
 */

// Утилиты для работы с cookies
const CookieUtils = {
    get: function(name) {
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
    },
    
    set: function(name, value, days = 365) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
};

// Система уведомлений
const NotificationSystem = {
    show: function(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 100);
        
        if (duration > 0) {
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);
        }
        
        return notification;
    }
};

// Управление избранными командами
const FavoriteManager = {
    toggle: function(teamId) {
        return fetch('/toggle-favorite/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                team_id: teamId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.updateUI(teamId, data.is_favorite);
                NotificationSystem.show(
                    data.message, 
                    data.is_favorite ? 'success' : 'info'
                );
                return data;
            } else {
                throw new Error(data.error || 'Произошла ошибка');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            NotificationSystem.show('Произошла ошибка при обновлении избранного', 'error');
            throw error;
        });
    },
    
    updateUI: function(teamId, isFavorite) {
        const buttons = document.querySelectorAll(`#favorite-btn-${teamId}`);
        
        buttons.forEach(btn => {
            if (isFavorite) {
                btn.classList.remove('btn-outline', 'btn-primary');
                btn.classList.add('btn-danger');
            } else {
                btn.classList.remove('btn-danger');
                btn.classList.add('btn-outline');
            }
        });
    }
};

// Управление темами
const ThemeManager = {
    init: function() {
        const savedTheme = CookieUtils.get('theme') || 'light';
        this.setTheme(savedTheme);
        
        document.addEventListener('change', (e) => {
            if (e.target.name === 'theme') {
                this.setTheme(e.target.value);
            }
        });
    },
    
    setTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        CookieUtils.set('theme', theme);
    }
};

// Фильтрация команд
const TeamFilter = {
    filterByLeague: function(league) {
        const teamCards = document.querySelectorAll('#teams-grid .team-card, .teams-grid .team-card');
        
        teamCards.forEach(card => {
            const cardLeague = card.dataset.league;
            if (league === 'all' || cardLeague === league) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
};

// Обработка форм
const FormHandler = {
    selectAllTeams: function() {
        const checkboxes = document.querySelectorAll('input[name="favorite_teams"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
        NotificationSystem.show('Все команды выбраны', 'success', 2000);
    },
    
    clearAllTeams: function() {
        const checkboxes = document.querySelectorAll('input[name="favorite_teams"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        NotificationSystem.show('Выбор команд сброшен', 'info', 2000);
    },
    
    resetSettings: function() {
        if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
            this.clearAllTeams();
            
            const englishLang = document.getElementById('lang-en');
            if (englishLang) englishLang.checked = true;
            
            const lightTheme = document.getElementById('theme-light');
            if (lightTheme) {
                lightTheme.checked = true;
                ThemeManager.setTheme('light');
            }
            
            NotificationSystem.show('Настройки сброшены', 'success');
        }
    }
};

// Глобальные функции
window.toggleFavorite = function(teamId) {
    FavoriteManager.toggle(teamId);
};

window.selectAllTeams = function() {
    FormHandler.selectAllTeams();
};

window.clearAllTeams = function() {
    FormHandler.clearAllTeams();
};

window.resetSettings = function() {
    FormHandler.resetSettings();
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Спортивные Фанаты - Инициализация...');
    
    ThemeManager.init();
    
    // Сохраняем информацию о последней посещенной странице
    const currentPage = window.location.pathname;
    CookieUtils.set('last_visited_page', currentPage, 30);
    
    console.log('✅ Инициализация завершена');
});