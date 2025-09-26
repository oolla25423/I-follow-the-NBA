from django import template
from django.utils.safestring import mark_safe
from django.utils import translation

register = template.Library()

TRANSLATIONS = {
    'ru': {
        'Home': 'Главная',
        'Preferences': 'Настройки',
        'I follow the NBA': 'я слежу за NBA',
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
        'Quick Info': 'Краткая информация',
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
        'Reset All': 'Сбросить всё',
        'Cancel': 'Отмена',
        'Your favorite basketball teams in one place.': 'Ваши любимые баскетбольные команды в одном месте.',
        'Quick Links': 'Быстрые ссылки',
        'Favorites': 'Избранное',
        'teams selected': 'команд выбрано',
        'Built with Django.': 'Создано с Django.',
        'Favorites Only': 'Только избранные',
        'All Teams': 'Все команды',
        'Search teams...': 'Поиск команд...',
        'No teams available': 'Нет доступных команд',
        'Please check back later for team information.': 'Пожалуйста, проверьте позже для получения информации о командах.',
        'Back to Teams': 'Назад к командам',
        'Conference': 'Конференция',
        'Division': 'Дивизион',
        'Remove from Favorites': 'Убрать из избранного',
        'Add to Favorites': 'Добавить в избранное',
        'Team Information': 'Информация о команде',
        'Founded': 'Основана',
        'Championships': 'Чемпионства',
        'About': 'О команде',
        'Team Colors': 'Цвета команды',
        'Team Colors Preview': 'Предварительный просмотр цветов команды',
        'Quick Stats': 'Быстрая статистика',
        'Actions': 'Действия',
        'Share Team': 'Поделиться командой',
        'View All Teams': 'Показать все команды',
        'Print Info': 'Печать информации',

        'Close': 'Закрыть',
        'Team Info': 'Информация о команде',
        'is a professional basketball team based in': 'это профессиональная баскетбольная команда из города',
        'They compete in the': 'Они выступают в',
        'Conference,': 'Конференции,',
        'Division.': 'Дивизион.',
        'Known for their competitive spirit and dedicated fanbase.': 'Известны своим соревновательным духом и преданными болельщиками.',
        'Based in': 'Базируется в',
        'represents the': 'представляет',
        'The team has a rich history in professional basketball.': 'Команда имеет богатую историю в профессиональном баскетболе.',
        'They continue to strive for excellence in every season.': 'Они продолжают стремиться к совершенству в каждом сезоне.',
        'calls': 'называет',
        'home and plays in the': 'домом и играет в',
        'This franchise has built a strong reputation over the years.': 'Эта франшиза создала прочную репутацию за эти годы.',
        'Their fans are among the most passionate in basketball.': 'Их болельщики одни из самых страстных в баскетболе.',
        'No favorite teams yet': 'Пока нет избранных команд',
        'Click the heart icon on any team to add it to your favorites.': 'Нажмите на иконку сердца у любой команды, чтобы добавить её в избранное.',
        'Modern franchise known for star-studded rosters and distinctive black uniforms.': 'Современная франшиза, известная звездными составами и характерной черной формой.',
        'Known for their passionate fanbase and recent championship success with Giannis Antetokounmpo.': 'Известны страстной фанбазой и недавним чемпионским успехом с Гианнисом Антетокумпо.',
        'Known for their orange and purple colors and fast-paced "Seven Seconds or Less" style of play.': 'Известны своими оранжевыми и фиолетовыми цветами и быстрым стилем игры "Семь секунд или меньше".',
        'Known for their unique style and championship run led by Dirk Nowitzki.': 'Известны своим уникальным стилем и чемпионским туром под руководством Дирка Новицки.',
        'Known for their mountain-inspired identity and recent championship success with Nikola Jokić.': 'Известны своей горной идентичностью и недавним чемпионским успехом с Николой Йокичем.',
    }
}

@register.simple_tag(takes_context=True)
def trans(context, message):
    current_language = translation.get_language()
    lang_translations = TRANSLATIONS.get(current_language, {})
    return mark_safe(lang_translations.get(message, message))

@register.simple_tag(takes_context=True)
def blocktrans(context, message, count=None, **kwargs):
    current_language = translation.get_language()
    
    if current_language == 'ru' and count is not None:
        if 'favorite team' in message.lower():
            if count == 1:
                return mark_safe(f"У вас {count} избранная команда")
            elif 2 <= count <= 4:
                return mark_safe(f"У вас {count} избранные команды") 
            else:
                return mark_safe(f"У вас {count} избранных команд")
        elif 'Championship' in message:
            if count == 1:
                return mark_safe(f"{count} чемпионство")
            elif 2 <= count <= 4:
                return mark_safe(f"{count} чемпионства")
            else:
                return mark_safe(f"{count} чемпионств")
    
    if count is not None:
        if 'favorite team' in message.lower():
            if count == 1:
                return mark_safe(f"You have {count} favorite team")
            else:
                return mark_safe(f"You have {count} favorite teams")
        elif 'Championship' in message:
            if count == 1:
                return mark_safe(f"{count} Championship")
            else:
                return mark_safe(f"{count} Championships")
    
    lang_translations = TRANSLATIONS.get(current_language, {})
    return mark_safe(lang_translations.get(message, message))