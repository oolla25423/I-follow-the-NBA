from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('preferences/', views.preferences, name='preferences'),
    path('toggle-favorite/', views.toggle_favorite, name='toggle_favorite'),
    path('change-language/', views.change_language, name='change_language'),
    path('change-theme/', views.change_theme, name='change_theme'),
]