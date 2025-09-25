# Контекстный процессор для передачи пользовательских настроек в шаблоны
def user_preferences(request):
    # Получить текущую тему или установить значение по умолчанию
    theme = getattr(request, 'theme', 'light')
    # Получить текущий язык или установить значение по умолчанию
    language = getattr(request, 'LANGUAGE_CODE', None)
    if not language:
        language = request.COOKIES.get('django_language', 'en')
    # Получить список избранных команд
    favorite_teams = getattr(request, 'favorite_teams', [])
    
    # Вернуть контекст для шаблонов
    return {
        'current_theme': theme,
        'current_language': language,
        'favorite_teams_ids': favorite_teams,
        'favorite_count': len(favorite_teams),
    }