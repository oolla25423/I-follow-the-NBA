from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import get_all_teams, LANGUAGE_CHOICES, THEME_CHOICES
from .forms import SearchForm



# Представление для главной страницы
def home(request):
    # Обработка POST-запроса для поиска
    if request.method == 'POST':
        form = SearchForm(request.POST)
        if form.is_valid():
            search_term = form.cleaned_data['search']
            teams = get_all_teams()
            teams = [team for team in teams if search_term.lower() in team['name'].lower()]
            return render(request, 'home.html', {'teams': teams})

    # Получение всех команд
    teams = get_all_teams()
    
    # Получение избранных команд из cookies
    favorites = request.COOKIES.get('favorite_teams', '[]')
    try:
        favorite_list = json.loads(favorites)
    except (json.JSONDecodeError, TypeError):
        favorite_list = []
    
    # Пометить команды как избранные
    for team in teams:
        team['is_favorite'] = team['id'] in favorite_list
    
    # Подготовить контекст для шаблона
    context = {
        'teams': teams,
        'favorite_count': len(favorite_list)
    }
    return render(request, 'home.html', context)

# Представление для страницы настроек
def preferences(request):
    # Обработка POST-запроса для сохранения настроек
    if request.method == 'POST':
        response = redirect('home')
        
        # Сохранить выбранный язык
        language = request.POST.get('language')
        if language and any(lang[0] == language for lang in LANGUAGE_CHOICES):
            response.set_cookie('django_language', language, max_age=365*24*60*60, path='/')
        
        # Сохранить выбранную тему
        theme = request.POST.get('theme')
        if theme and any(t[0] == theme for t in THEME_CHOICES):
            response.set_cookie('theme', theme, max_age=365*24*60*60, path='/')
        
        return response
    
    # Получить текущие настройки
    current_language = getattr(request, 'LANGUAGE_CODE', None)
    if not current_language:
        current_language = request.COOKIES.get('django_language', 'en')
    current_theme = getattr(request, 'theme', request.COOKIES.get('theme', 'light'))
    
    # Получить количество избранных команд
    favorites = request.COOKIES.get('favorite_teams', '[]')
    try:
        favorite_list = json.loads(favorites)
    except (json.JSONDecodeError, TypeError):
        favorite_list = []
    
    # Подготовить контекст для шаблона
    context = {
        'language_choices': LANGUAGE_CHOICES,
        'theme_choices': THEME_CHOICES,
        'current_language': current_language,
        'current_theme': current_theme,
        'favorite_count': len(favorite_list)
    }
    return render(request, 'preferences.html', context)

# Представление для переключения избранного (AJAX)
@csrf_exempt
def toggle_favorite(request):
    # Обработка POST-запроса
    if request.method == 'POST':
        try:
            # Разбор JSON-данных
            data = json.loads(request.body)
            team_id = data.get('team_id')
            
            # Проверка наличия ID команды
            if not team_id:
                return JsonResponse({'error': 'Требуется ID команды'}, status=400)
            
            # Получить текущий список избранных
            favorites = request.COOKIES.get('favorite_teams', '[]')
            try:
                favorite_list = json.loads(favorites)
            except (json.JSONDecodeError, TypeError):
                favorite_list = []
            
            # Переключить статус избранного
            if team_id in favorite_list:
                favorite_list.remove(team_id)
                is_favorite = False
            else:
                favorite_list.append(team_id)
                is_favorite = True
            
            # Подготовить ответ
            response = JsonResponse({
                'success': True,
                'is_favorite': is_favorite,
                'favorite_count': len(favorite_list)
            })
            
            # Сохранить обновленный список в cookies
            response.set_cookie(
                'favorite_teams', 
                json.dumps(favorite_list), 
                max_age=365*24*60*60,
                path='/'
            )
            
            return response
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Неверный JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Требуется метод POST'}, status=405)

# Представление для изменения темы (AJAX)
@csrf_exempt
def change_theme(request):
    # Обработка POST-запроса
    if request.method == 'POST':
        try:
            # Разбор JSON-данных
            data = json.loads(request.body)
            theme = data.get('theme')
            
            # Проверка наличия темы
            if not theme:
                return JsonResponse({'error': 'Требуется тема'}, status=400)
            
            # Проверка корректности темы
            if not any(t[0] == theme for t in THEME_CHOICES):
                return JsonResponse({'error': 'Неверная тема'}, status=400)
            
            # Подготовить ответ
            response = JsonResponse({
                'success': True,
                'theme': theme,
                'message': 'Тема успешно обновлена'
            })
            
            # Сохранить тему в cookies
            response.set_cookie(
                'theme', 
                theme, 
                max_age=365*24*60*60,
                path='/'
            )
            
            return response
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Неверный JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Требуется метод POST'}, status=405)

# Представление для изменения языка (AJAX)
@csrf_exempt
def change_language(request):
    # Обработка POST-запроса
    if request.method == 'POST':
        try:
            # Разбор JSON-данных
            data = json.loads(request.body)
            language = data.get('language')
            
            # Проверка наличия языка
            if not language:
                return JsonResponse({'error': 'Требуется язык'}, status=400)
            
            # Проверка корректности языка
            if not any(lang[0] == language for lang in LANGUAGE_CHOICES):
                return JsonResponse({'error': 'Неверный язык'}, status=400)
            
            # Подготовить ответ
            response = JsonResponse({
                'success': True,
                'language': language,
                'message': 'Язык успешно обновлен'
            })
            
            # Сохранить язык в cookies
            response.set_cookie(
                'django_language', 
                language, 
                max_age=365*24*60*60,
                path='/'
            )
            
            return response
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Неверный JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Требуется метод POST'}, status=405)