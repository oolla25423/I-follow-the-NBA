from django.urls import path
from . import views

# URL-маршруты приложения
urlpatterns = [
    # Главная страница
    path('', views.home, name='home'),
    # Страница настроек
    path('preferences/', views.preferences, name='preferences'),
    # Переключение избранного (AJAX)
    path('toggle-favorite/', views.toggle_favorite, name='toggle_favorite'),
    # Изменение языка (AJAX)
    path('change-language/', views.change_language, name='change_language'),
    # Изменение темы (AJAX)
    path('change-theme/', views.change_theme, name='change_theme'),
]