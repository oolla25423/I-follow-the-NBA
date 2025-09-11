from django.db import models

# Hardcoded team data as requested
TEAMS_DATA = [
    {
        'id': 1,
        'name': 'Manchester United',
        'league': 'Premier League',
        'country': 'England',
        'logo': 'man_united.png',
        'founded': 1878,
        'description': 'One of the most successful clubs in English football history.'
    },
    {
        'id': 2,
        'name': 'Real Madrid',
        'league': 'La Liga',
        'country': 'Spain',
        'logo': 'real_madrid.png',
        'founded': 1902,
        'description': 'The most successful club in UEFA Champions League history.'
    },
    {
        'id': 3,
        'name': 'Bayern Munich',
        'league': 'Bundesliga',
        'country': 'Germany',
        'logo': 'bayern_munich.png',
        'founded': 1900,
        'description': 'The most successful club in German football.'
    },
    {
        'id': 4,
        'name': 'Barcelona',
        'league': 'La Liga',
        'country': 'Spain',
        'logo': 'barcelona.png',
        'founded': 1899,
        'description': 'Famous for their tiki-taka playing style.'
    },
    {
        'id': 5,
        'name': 'Liverpool',
        'league': 'Premier League',
        'country': 'England',
        'logo': 'liverpool.png',
        'founded': 1892,
        'description': 'Famous for their passionate fanbase and "You\'ll Never Walk Alone".'
    },
    {
        'id': 6,
        'name': 'Juventus',
        'league': 'Serie A',
        'country': 'Italy',
        'logo': 'juventus.png',
        'founded': 1897,
        'description': 'The most successful club in Italian football.'
    },
    {
        'id': 7,
        'name': 'Paris Saint-Germain',
        'league': 'Ligue 1',
        'country': 'France',
        'logo': 'psg.png',
        'founded': 1970,
        'description': 'The most successful club in French football in recent years.'
    },
    {
        'id': 8,
        'name': 'Chelsea',
        'league': 'Premier League',
        'country': 'England',
        'logo': 'chelsea.png',
        'founded': 1905,
        'description': 'Based in West London with a rich modern history.'
    }
]

# Language options for user preferences
LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('es', 'Español'),
    ('fr', 'Français'),
    ('de', 'Deutsch'),
    ('it', 'Italiano'),
    ('ru', 'Русский'),
]

# Theme options for user preferences
THEME_CHOICES = [
    ('light', 'Light Theme'),
    ('dark', 'Dark Theme'),
    ('blue', 'Blue Theme'),
    ('green', 'Green Theme'),
]

# Helper functions to work with team data
def get_all_teams():
    """Return all teams data"""
    return TEAMS_DATA

def get_team_by_id(team_id):
    """Get team by ID"""
    for team in TEAMS_DATA:
        if team['id'] == int(team_id):
            return team
    return None

def get_teams_by_league(league):
    """Get teams by league"""
    return [team for team in TEAMS_DATA if team['league'] == league]

def get_leagues():
    """Get all unique leagues"""
    return list(set(team['league'] for team in TEAMS_DATA))
