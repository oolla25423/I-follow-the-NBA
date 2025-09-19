from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import get_all_teams, get_team_by_id, LANGUAGE_CHOICES, THEME_CHOICES
from .forms import SearchForm



def home(request):
    if request.method == 'POST':
        form = SearchForm(request.POST)
        if form.is_valid():
            search_term = form.cleaned_data['search']
            teams = get_all_teams()
            teams = [team for team in teams if search_term.lower() in team['name'].lower()]
            return render(request, 'home.html', {'teams': teams})

    teams = get_all_teams()
    
    favorites = request.COOKIES.get('favorite_teams', '[]')
    try:
        favorite_list = json.loads(favorites)
    except (json.JSONDecodeError, TypeError):
        favorite_list = []
    
    for team in teams:
        team['is_favorite'] = team['id'] in favorite_list
    
    context = {
        'teams': teams,
        'favorite_count': len(favorite_list)
    }
    return render(request, 'home.html', context)

def preferences(request):
    if request.method == 'POST':
        response = redirect('home')
        
        language = request.POST.get('language')
        if language and any(lang[0] == language for lang in LANGUAGE_CHOICES):
            response.set_cookie('django_language', language, max_age=365*24*60*60, path='/')
        
        theme = request.POST.get('theme')
        if theme and any(t[0] == theme for t in THEME_CHOICES):
            response.set_cookie('theme', theme, max_age=365*24*60*60, path='/')
        
        return response
    
    current_language = getattr(request, 'LANGUAGE_CODE', None)
    if not current_language:
        current_language = request.COOKIES.get('django_language', 'en')
    current_theme = getattr(request, 'theme', request.COOKIES.get('theme', 'light'))
    
    favorites = request.COOKIES.get('favorite_teams', '[]')
    try:
        favorite_list = json.loads(favorites)
    except (json.JSONDecodeError, TypeError):
        favorite_list = []
    
    context = {
        'language_choices': LANGUAGE_CHOICES,
        'theme_choices': THEME_CHOICES,
        'current_language': current_language,
        'current_theme': current_theme,
        'favorite_count': len(favorite_list)
    }
    return render(request, 'preferences.html', context)

@csrf_exempt
def toggle_favorite(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            team_id = data.get('team_id')
            
            if not team_id:
                return JsonResponse({'error': 'Team ID required'}, status=400)
            
            favorites = request.COOKIES.get('favorite_teams', '[]')
            try:
                favorite_list = json.loads(favorites)
            except (json.JSONDecodeError, TypeError):
                favorite_list = []
            
            if team_id in favorite_list:
                favorite_list.remove(team_id)
                is_favorite = False
            else:
                favorite_list.append(team_id)
                is_favorite = True
            
            response = JsonResponse({
                'success': True,
                'is_favorite': is_favorite,
                'favorite_count': len(favorite_list)
            })
            
            response.set_cookie(
                'favorite_teams', 
                json.dumps(favorite_list), 
                max_age=365*24*60*60,
                path='/'
            )
            
            return response
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'POST method required'}, status=405)

@csrf_exempt
def change_theme(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            theme = data.get('theme')
            
            if not theme:
                return JsonResponse({'error': 'Theme required'}, status=400)
            
            if not any(t[0] == theme for t in THEME_CHOICES):
                return JsonResponse({'error': 'Invalid theme'}, status=400)
            
            response = JsonResponse({
                'success': True,
                'theme': theme,
                'message': 'Theme updated successfully'
            })
            
            response.set_cookie(
                'theme', 
                theme, 
                max_age=365*24*60*60,
                path='/'
            )
            
            return response
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'POST method required'}, status=405)

@csrf_exempt
def change_language(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            language = data.get('language')
            
            if not language:
                return JsonResponse({'error': 'Language required'}, status=400)
            
            if not any(lang[0] == language for lang in LANGUAGE_CHOICES):
                return JsonResponse({'error': 'Invalid language'}, status=400)
            
            response = JsonResponse({
                'success': True,
                'language': language,
                'message': 'Language updated successfully'
            })
            
            response.set_cookie(
                'django_language', 
                language, 
                max_age=365*24*60*60,
                path='/'
            )
            
            return response
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'POST method required'}, status=405)