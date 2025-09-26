from django.utils import translation
import json

class PreferencesMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        self.process_request(request)
        response = self.get_response(request)
        return response

    def process_request(self, request):
        language = request.COOKIES.get('django_language')
        if language:
            translation.activate(language)
            request.LANGUAGE_CODE = language
        
        theme = request.COOKIES.get('theme', 'light')
        request.theme = theme
        
        favorites = request.COOKIES.get('favorite_teams', '[]')
        try:
            request.favorite_teams = json.loads(favorites)
        except (json.JSONDecodeError, TypeError):
            request.favorite_teams = []