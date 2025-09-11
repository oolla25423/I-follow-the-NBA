from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import (
    get_all_teams, get_team_by_id,
    LANGUAGE_CHOICES, THEME_CHOICES
)
import json

def home(request):
    """Главная страница"""
    # Получаем предпочтения пользователя из cookies
    favorite_team_ids = request.COOKIES.get('favorite_teams', '')
    language = request.COOKIES.get('language', 'en')
    theme = request.COOKIES.get('theme', 'light')
    
    # Получаем избранные команды
    favorite_teams = []
    if favorite_team_ids:
        team_ids = favorite_team_ids.split(',')
        for team_id in team_ids:
            if team_id.strip():
                team = get_team_by_id(team_id.strip())
                if team:
                    favorite_teams.append(team)
    
    # Получаем все команды
    all_teams = get_all_teams()
    
    context = {
        'favorite_teams': favorite_teams,
        'all_teams': all_teams,
        'current_language': language,
        'current_theme': theme,
        'language_choices': LANGUAGE_CHOICES,
        'theme_choices': THEME_CHOICES,
    }
    
    return render(request, 'home.html', context)

def team_detail(request, team_id):
    """Детальная страница команды"""
    team = get_team_by_id(team_id)
    if not team:
        return redirect('home')
    
    # Проверяем, является ли команда избранной
    favorite_team_ids = request.COOKIES.get('favorite_teams', '')
    is_favorite = str(team_id) in favorite_team_ids.split(',')
    
    context = {
        'team': team,
        'is_favorite': is_favorite,
    }
    
    return render(request, 'team_detail.html', context)

def preferences(request):
    """Страница настроек пользователя"""
    if request.method == 'POST':
        # Получаем данные из формы
        favorite_teams = request.POST.getlist('favorite_teams')
        language = request.POST.get('language', 'en')
        theme = request.POST.get('theme', 'light')
        
        # Создаем ответ с перенаправлением
        response = redirect('home')
        
        # Устанавливаем cookies
        response.set_cookie('favorite_teams', ','.join(favorite_teams), max_age=365*24*60*60)  # 1 год
        response.set_cookie('language', language, max_age=365*24*60*60)
        response.set_cookie('theme', theme, max_age=365*24*60*60)
        
        # Сохраняем последнюю посещенную страницу
        response.set_cookie('last_visited', 'preferences', max_age=30*24*60*60)  # 30 дней
        
        return response
    
    # Получаем текущие предпочтения
    favorite_team_ids = request.COOKIES.get('favorite_teams', '').split(',')
    current_language = request.COOKIES.get('language', 'en')
    current_theme = request.COOKIES.get('theme', 'light')
    
    context = {
        'all_teams': get_all_teams(),
        'favorite_team_ids': [id.strip() for id in favorite_team_ids if id.strip()],
        'language_choices': LANGUAGE_CHOICES,
        'theme_choices': THEME_CHOICES,
        'current_language': current_language,
        'current_theme': current_theme,
    }
    
    return render(request, 'preferences.html', context)

@csrf_exempt
def toggle_favorite(request):
    """AJAX endpoint для добавления/удаления команды из избранного"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            team_id = str(data.get('team_id'))
            
            # Получаем текущие избранные команды
            favorite_teams = request.COOKIES.get('favorite_teams', '')
            team_ids = [id.strip() for id in favorite_teams.split(',') if id.strip()]
            
            # Переключаем статус избранного
            if team_id in team_ids:
                team_ids.remove(team_id)
                is_favorite = False
            else:
                team_ids.append(team_id)
                is_favorite = True
            
            response = JsonResponse({
                'success': True,
                'is_favorite': is_favorite,
                'message': 'Team added to favorites' if is_favorite else 'Team removed from favorites'
            })
            
            # Обновляем cookie
            response.set_cookie('favorite_teams', ','.join(team_ids), max_age=365*24*60*60)
            
            return response
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Method not supported'})


