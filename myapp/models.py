from django.db import models

# Hardcoded basketball team data
TEAMS_DATA = [
    {
        'id': 1,
        'name': 'Los Angeles Lakers',
        'league': 'NBA',
        'country': 'USA',
        'logo': 'lakers.png',
        'founded': 1947,
        'description': 'One of the most successful franchises in NBA history.'
    },
    {
        'id': 2,
        'name': 'Boston Celtics',
        'league': 'NBA',
        'country': 'USA',
        'logo': 'celtics.png',
        'founded': 1946,
        'description': 'Historic franchise with the most NBA championships.'
    },
    {
        'id': 3,
        'name': 'Golden State Warriors',
        'league': 'NBA',
        'country': 'USA',
        'logo': 'warriors.png',
        'founded': 1946,
        'description': 'Known for their revolutionary three-point shooting style.'
    },
    {
        'id': 4,
        'name': 'Chicago Bulls',
        'league': 'NBA',
        'country': 'USA',
        'logo': 'bulls.png',
        'founded': 1966,
        'description': 'Famous for the Michael Jordan era and six championships.'
    },
    {
        'id': 5,
        'name': 'Miami Heat',
        'league': 'NBA',
        'country': 'USA',
        'logo': 'heat.png',
        'founded': 1988,
        'description': 'Known for their strong team culture and recent success.'
    }
]

# Language options for user preferences
LANGUAGE_CHOICES = [
    ('en', 'English'),
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
