from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('team/<int:team_id>/', views.team_detail, name='team_detail'),
    path('preferences/', views.preferences, name='preferences'),
    path('toggle-favorite/', views.toggle_favorite, name='toggle_favorite'),
]