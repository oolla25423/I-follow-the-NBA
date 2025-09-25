from django.utils import translation
import json

# Промежуточное ПО для обработки пользовательских настроек
class PreferencesMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        self.process_request(request)
        response = self.get_response(request)
        return response

    # Обработка запроса для установки языка и темы
    def process_request(self, request):
        # Установка языка из cookies
        language = request.COOKIES.get('django_language')
        if language:
            translation.activate(language)
            request.LANGUAGE_CODE = language
        
        # Установка темы из cookies
        theme = request.COOKIES.get('theme', 'light')
        request.theme = theme
        
        # Установка избранных команд из cookies
        favorites = request.COOKIES.get('favorite_teams', '[]')
        try:
            request.favorite_teams = json.loads(favorites)
        except (json.JSONDecodeError, TypeError):
            request.favorite_teams = []