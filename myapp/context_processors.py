def user_preferences(request):
    theme = getattr(request, 'theme', 'light')
    language = getattr(request, 'LANGUAGE_CODE', None)
    if not language:
        language = request.COOKIES.get('django_language', 'en')
    favorite_teams = getattr(request, 'favorite_teams', [])
    
    return {
        'current_theme': theme,
        'current_language': language,
        'favorite_teams_ids': favorite_teams,
        'favorite_count': len(favorite_teams),
    }