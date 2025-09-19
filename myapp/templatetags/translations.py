from django import template
from django.utils.safestring import mark_safe

register = template.Library()

# Russian translations dictionary
RUSSIAN_TRANSLATIONS = {
    'Home': 'Главная',
    'Preferences': 'Настройки',
    'Basketball Fans': 'я слежу за NBA',
    'Discover and follow your favorite NBA teams': 'Откройте для себя и следите за вашими любимыми командами НБА',
    'NBA Teams': 'Команды НБА',
    'Click the heart icon to add teams to your favorites': 'Нажмите на иконку сердца, чтобы добавить команды в избранное',
    'Teams Available': 'Доступно команд',
    'Your Favorites': 'Ваши избранные',
    'Conference:': 'Конференция:',
    'Division:': 'Дивизион:',
    'Championships:': 'Чемпионства:',
    'Founded:': 'Основана:',
    'View Details': 'Подробнее',
    'Add to favorites': 'Добавить в избранное',
    'Remove from favorites': 'Убрать из избранного',
    'Customize your experience with language and theme settings': 'Настройте ваш опыт с помощью языковых и тематических настроек',
    'Language Settings': 'Языковые настройки',
    'Choose your preferred language for the interface': 'Выберите предпочитаемый язык интерфейса',
    'Interface Language:': 'Язык интерфейса:',
    'Current Selection:': 'Текущий выбор:',
    'Theme Settings': 'Настройки темы',
    'Choose your preferred color theme': 'Выберите предпочитаемую цветовую тему',
    'theme': 'тема',
    'Favorite Teams': 'Избранные команды',
    'Add More Teams': 'Добавить ещё команды',
    'Clear All Favorites': 'Очистить избранное',
    'Save Preferences': 'Сохранить настройки',
    'Reset to Defaults': 'Сбросить к умолчанию',
    'Cancel': 'Отмена',
    'Your favorite basketball teams in one place.': 'Ваши любимые баскетбольные команды в одном месте.',
    'Quick Links': 'Быстрые ссылки',
    'Favorites': 'Избранное',
    'teams selected': 'команд выбрано',
    'Built with Django.': 'Создано с Django.',
}

@register.simple_tag(takes_context=True)
def trans(context, text):
    """Simple translation tag"""
    request = context.get('request')
    if request:
        language = getattr(request, 'LANGUAGE_CODE', 'en')
        if language == 'ru' and text in RUSSIAN_TRANSLATIONS:
            return mark_safe(RUSSIAN_TRANSLATIONS[text])
    return mark_safe(text)

@register.simple_tag(takes_context=True)
def blocktrans(context, text, count=None):
    """Simple block translation with plural support"""
    request = context.get('request')
    if request:
        language = getattr(request, 'LANGUAGE_CODE', 'en')
        if language == 'ru':
            # Handle plurals for Russian
            if 'favorite team' in text.lower():
                if count == 1:
                    return mark_safe(f"У вас {count} избранная команда")
                elif 2 <= count <= 4:
                    return mark_safe(f"У вас {count} избранные команды")
                else:
                    return mark_safe(f"У вас {count} избранных команд")
    
    # Default English with simple plural
    if count is not None:
        if 'favorite team' in text.lower():
            if count == 1:
                return mark_safe(f"You have {count} favorite team")
            else:
                return mark_safe(f"You have {count} favorite teams")
    
    return mark_safe(text)