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
    console.log('Basketball Fans App initialized');
}

// Setup mobile viewport handling
function setupMobileViewport() {
    // Handle mobile viewport height issues
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

// Handle orientation changes
function setupOrientationChange() {
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Recalculate grid layouts
            const teamsGrid = document.querySelector('.teams-grid');
            if (teamsGrid) {
                // Force reflow
                teamsGrid.style.display = 'none';
                teamsGrid.offsetHeight; // Trigger reflow
                teamsGrid.style.display = 'grid';
            }
            
            // Close any open modals on orientation change for better UX
            const openModals = document.querySelectorAll('.modal[style*="flex"]');
            if (openModals.length > 0) {
                closeModal();
            }
        }, 300);
    });
}

function initializeTheme() {
    const savedTheme = getCookie('theme') || 'light';
    console.log('Initializing theme:', savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeInputs = document.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
        if (input.value === savedTheme) {
            input.checked = true;
        }
    });
    const appliedTheme = document.documentElement.getAttribute('data-theme');
    console.log('Theme applied successfully:', appliedTheme);
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            updateFavoriteUI(teamId, data.is_favorite, data.favorite_count);
        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error toggling favorite:', error);
    })
    .finally(() => {
        if (favoriteBtn) {
            favoriteBtn.disabled = false;
            favoriteBtn.style.opacity = '1';
        }
    });
}

function updateFavoriteUI(teamId, isFavorite, favoriteCount) {
    const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
    if (teamCard) {
        const favoriteBtn = teamCard.querySelector('.favorite-btn');
        const heartIcon = favoriteBtn.querySelector('i');
        
        if (isFavorite) {
            favoriteBtn.classList.add('active');
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            favoriteBtn.title = 'Remove from favorites';
        } else {
            favoriteBtn.classList.remove('active');
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            favoriteBtn.title = 'Add to favorites';
        }
    }
    
    const detailBtn = document.querySelector('.btn-favorite');
    if (detailBtn) {
        if (isFavorite) {
            detailBtn.classList.add('active');
            detailBtn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites';
            detailBtn.title = 'Remove from favorites';
        } else {
            detailBtn.classList.remove('active');
            detailBtn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites';
            detailBtn.title = 'Add to favorites';
        }
    }
    
    updateFavoriteCounters(favoriteCount);
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
    
    console.log(`Theme changed to ${theme}`);
}

function changeThemeAjax(theme) {
    if (themeChangeInProgress) {
        console.log('Theme change already in progress, skipping');
        return;
    }
    
    setCookie('theme', theme, 365);
    console.log('Theme saved to cookie immediately:', theme);
    
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Theme saved successfully:', data.theme);
            setCookie('theme', theme, 365);
        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error saving theme via AJAX:', error);
        setCookie('theme', theme, 365);
        console.log('Theme saved to cookie as fallback:', theme);
        console.log('Theme changed (saved locally)');
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
    // Check if device supports touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        if (!isTouchDevice) {
            // Only add hover effects for non-touch devices
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        } else {
            // Add touch feedback for touch devices
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
        }
    });
    
    // Improve button interactions for touch devices
    const buttons = document.querySelectorAll('.btn, .favorite-btn, .team-info-btn');
    buttons.forEach(button => {
        if (isTouchDevice) {
            // Add touch feedback
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
    
    // Add double-tap prevention for favorite buttons
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
    
    // Add swipe support for modals on mobile
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (isTouchDevice) {
            addSwipeToClose(modal);
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
        
        // Ctrl+P for preferences
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.location.href = '/preferences/';
        }
    });
}

// Swipe to close modal functionality
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
        
        // Only allow downward swipe
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
            // Close modal if swiped down enough
            closeModal();
        } else {
            // Reset position
            modalContent.style.transform = 'translateY(0)';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }
        
        isDragging = false;
    }
    
    modalContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalContent.addEventListener('touchmove', handleTouchMove, { passive: true });
    modalContent.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// Improve modal accessibility for mobile
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        
        // Prevent body scroll on mobile
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstFocusable = modal.querySelector('button, input, select, textarea, a[href]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Add backdrop click to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        
        // Reset modal content position
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'translateY(0)';
            modalContent.style.transition = '';
        }
        
        // Reset modal background
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    });
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Confirmation modal
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
        // Fallback to browser confirm
        if (confirm(message)) {
            confirmCallback();
        }
    }
}

// Clear all favorites
function clearAllFavorites() {
    showConfirmModal(
        'Are you sure you want to remove all favorite teams? This action cannot be undone.',
        function() {
            setCookie('favorite_teams', '[]', 365);
            console.log('All favorites cleared');
            location.reload();
        }
    );
}

// Reset preferences to defaults
function resetToDefaults() {
    showConfirmModal(
        'Reset all preferences to default values? This will clear your language, theme, and favorite teams.',
        function() {
            // Clear all preference cookies
            setCookie('django_language', '', -1);
            setCookie('theme', '', -1);
            setCookie('favorite_teams', '[]', -1);
            
            // Reset to defaults
            document.documentElement.setAttribute('data-theme', 'light');
            
            console.log('Preferences reset to defaults');
            location.reload();
        }
    );
}

// Share functionality
function shareTeam(teamName, teamDescription) {
    if (navigator.share) {
        navigator.share({
            title: teamName || 'Basketball Team',
            text: teamDescription || 'Check out this basketball team!',
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
            console.log('Team link copied to clipboard!');
        }).catch(() => {
            console.log('Unable to copy link');
        });
    } else {
        console.log('Sharing not supported on this device');
    }
}

// Print functionality
function printTeamInfo() {
    window.print();
}

// Language selector functionality
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

// AJAX Language switching with infinite request prevention
function changeLanguageAjax(language) {
    // Prevent multiple concurrent requests
    if (languageChangeInProgress) {
        console.log('Language change already in progress, skipping');
        return;
    }
    
    // Also save to cookie immediately for immediate persistence
    setCookie('django_language', language, 365);
    console.log('Language saved to cookie immediately:', language);
    
    // Clear any pending timeout
    if (languageChangeTimeout) {
        clearTimeout(languageChangeTimeout);
    }
    
    // Debounce the request
    languageChangeTimeout = setTimeout(() => {
        executeLanguageChange(language);
    }, 300);
}

function executeLanguageChange(language) {
    if (languageChangeInProgress) {
        return;
    }
    
    languageChangeInProgress = true;
    
    // Immediate UI feedback
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.disabled = true;
    }
    
    // Show loading feedback in console
    console.log('Changing language...');
    
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Update UI immediately
            updateLanguageDisplay();
            
            // Reload page after short delay to apply language changes
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(data.error || 'Unknown error occurred');
        }
    })
    .catch(error => {
        console.error('Error changing language via AJAX:', error);
        // Fallback: save to cookie directly (already done above)
        console.log('Language saved to cookie as fallback:', language);
        
        // Update UI immediately
        updateLanguageDisplay();
        
        // Reload page after short delay to apply language changes
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    })
    .finally(() => {
        // Cleanup
        languageChangeInProgress = false;
        
        if (languageSelect) {
            languageSelect.disabled = false;
        }
        
        // Clear timeout
        if (languageChangeTimeout) {
            clearTimeout(languageChangeTimeout);
            languageChangeTimeout = null;
        }
    });
}

// Initialize language change handler
function initializeLanguageHandling() {
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        // Remove any existing handlers to prevent duplicates
        languageSelect.removeEventListener('change', handleLanguageChange);
        
        // Add new handler
        languageSelect.addEventListener('change', handleLanguageChange);
    }
}

function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    if (selectedLanguage) {
        changeLanguageAjax(selectedLanguage);
    }
}

// Form validation
function validatePreferencesForm(form) {
    const language = form.querySelector('select[name="language"]');
    const theme = form.querySelector('input[name="theme"]:checked');
    
    if (!language || !language.value) {
        console.error('Please select a language');
        return false;
    }
    
    if (!theme) {
        console.error('Please select a theme');
        return false;
    }
    
    return true;
}

// Search functionality (if needed in future)
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

// Performance monitoring
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Load performance logging
window.addEventListener('load', logPerformance);

// Team info modal functionality
function showTeamInfo(teamId) {
    // Find team data from the page
    const teamCard = document.querySelector(`[data-team-id="${teamId}"]`);
    if (!teamCard) return;
    
    const teamName = teamCard.querySelector('.team-name')?.textContent || 'Unknown Team';
    const teamCity = teamCard.querySelector('.team-city')?.textContent || 'Unknown City';
    const conference = teamCard.querySelector('.detail-value')?.textContent || 'Unknown';
    
    // Get or create modal
    let modal = document.getElementById('teamModal');
    if (!modal) {
        createTeamModal();
        modal = document.getElementById('teamModal');
    }
    
    // Populate modal content
    const modalTeamName = modal.querySelector('#modalTeamName');
    const modalTeamCity = modal.querySelector('#modalTeamCity');
    const modalConference = modal.querySelector('#modalConference');
    const modalTeamInitials = modal.querySelector('#modalTeamInitials');
    
    if (modalTeamName) modalTeamName.textContent = teamName;
    if (modalTeamCity) modalTeamCity.textContent = teamCity;
    if (modalConference) modalConference.textContent = conference;
    if (modalTeamInitials) {
        modalTeamInitials.textContent = teamName.slice(0, 2).toUpperCase();
        // Copy colors from the original team card
        const originalInitials = teamCard.querySelector('.team-initials');
        if (originalInitials) {
            const style = window.getComputedStyle(originalInitials);
            modalTeamInitials.style.background = style.background;
        }
    }
    
    showModal('teamModal');
}

// Create team modal dynamically if it doesn't exist
function createTeamModal() {
    const modalHTML = `
        <div id="teamModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close" onclick="closeModal()">&times;</span>
                    <h2 id="modalTeamName">Team Name</h2>
                </div>
                <div class="modal-body">
                    <div class="modal-team-logo">
                        <div id="modalTeamInitials" class="team-initials-modal"></div>
                    </div>
                    <div class="modal-team-info">
                        <p class="modal-team-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span id="modalTeamCity">City</span>
                        </p>
                        <div class="modal-team-badges">
                            <span id="modalConference" class="badge conference-badge">Conference</span>
                        </div>
                        <p id="modalTeamDescription" class="team-description">
                            Quick information about this basketball team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add swipe support if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        const modal = document.getElementById('teamModal');
        addSwipeToClose(modal);
    }
}

// Filter teams function
function filterTeams(filter) {
    const allTeams = document.querySelectorAll('.team-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Filter teams
    allTeams.forEach(team => {
        const favoriteBtn = team.querySelector('.favorite-btn');
        // Check if team is favorite based on the button's active class
        const isFavorite = favoriteBtn && favoriteBtn.classList.contains('active');
        
        if (filter === 'all') {
            team.style.display = 'block';
        } else if (filter === 'favorites') {
            team.style.display = isFavorite ? 'block' : 'none';
        }
    });
    
    // Show message if no favorites
    const visibleFavorites = document.querySelectorAll('.team-card .favorite-btn.active');
    if (filter === 'favorites' && visibleFavorites.length === 0) {
        showNoFavoritesMessage();
    } else {
        hideNoFavoritesMessage();
    }
}

function showNoFavoritesMessage() {
    let message = document.querySelector('.no-favorites-message');
    if (!message) {
        message = document.createElement('div');
        message.className = 'no-favorites-message';
        
        // Get current language for translations
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