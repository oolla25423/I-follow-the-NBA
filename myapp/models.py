from django.db import models

TEAMS_DATA = {
    1: {
        'id': 1,
        'name': 'Los Angeles Lakers',
        'city': 'Los Angeles',
        'conference': 'Western',
        'division': 'Pacific',
        'founded': 1947,
        'championships': 17,
        'description': 'One of the most successful franchises in NBA history, known for their purple and gold colors.',
        'colors': ['#552583', '#FDB927']
    },
    2: {
        'id': 2,
        'name': 'Boston Celtics',
        'city': 'Boston',
        'conference': 'Eastern',
        'division': 'Atlantic',
        'founded': 1946,
        'championships': 18,
        'description': 'Historic franchise with the most NBA championships, known for their green and white colors.',
        'colors': ['#007A33', '#BA9653']
    },
    3: {
        'id': 3,
        'name': 'Golden State Warriors',
        'city': 'San Francisco',
        'conference': 'Western',
        'division': 'Pacific',
        'founded': 1946,
        'championships': 7,
        'description': 'Known for their fast-paced style and three-point shooting excellence.',
        'colors': ['#1D428A', '#FFC72C']
    },
    4: {
        'id': 4,
        'name': 'Chicago Bulls',
        'city': 'Chicago',
        'conference': 'Eastern',
        'division': 'Central',
        'founded': 1966,
        'championships': 6,
        'description': 'Famous for the Michael Jordan era and six championships in the 1990s.',
        'colors': ['#CE1141', '#000000']
    },
    5: {
        'id': 5,
        'name': 'Miami Heat',
        'city': 'Miami',
        'conference': 'Eastern',
        'division': 'Southeast',
        'founded': 1988,
        'championships': 3,
        'description': 'Known for their "Heat Culture" and multiple championship runs.',
        'colors': ['#98002E', '#F9A01B']
    },
    6: {
        'id': 6,
        'name': 'Brooklyn Nets',
        'city': 'Brooklyn',
        'conference': 'Eastern',
        'division': 'Atlantic',
        'founded': 1967,
        'championships': 2,
        'description': 'Modern franchise known for star-studded rosters and distinctive black uniforms.',
        'colors': ['#000000', '#FFFFFF']
    },
    7: {
        'id': 7,
        'name': 'Milwaukee Bucks',
        'city': 'Milwaukee',
        'conference': 'Eastern',
        'division': 'Central',
        'founded': 1968,
        'championships': 2,
        'description': 'Known for their passionate fanbase and recent championship success with Giannis Antetokounmpo.',
        'colors': ['#00471B', '#EEE1C6']
    },
    8: {
        'id': 8,
        'name': 'Phoenix Suns',
        'city': 'Phoenix',
        'conference': 'Western',
        'division': 'Pacific',
        'founded': 1968,
        'championships': 0,
        'description': 'Known for their orange and purple colors and fast-paced "Seven Seconds or Less" style of play.',
        'colors': ['#1D1160', '#E56020']
    },
    9: {
        'id': 9,
        'name': 'Dallas Mavericks',
        'city': 'Dallas',
        'conference': 'Western',
        'division': 'Southwest',
        'founded': 1980,
        'championships': 1,
        'description': 'Known for their unique style and championship run led by Dirk Nowitzki.',
        'colors': ['#00538C', '#002B5E']
    },
    10: {
        'id': 10,
        'name': 'Denver Nuggets',
        'city': 'Denver',
        'conference': 'Western',
        'division': 'Northwest',
        'founded': 1976,
        'championships': 1,
        'description': 'Known for their mountain-inspired identity and recent championship success with Nikola Jokić.',
        'colors': ['#0E2240', '#FEC524']
    }
}

LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('ru', 'Русский'),
]

THEME_CHOICES = [
    ('light', 'White'),
    ('dark', 'Black'),
    ('yellow', 'Yellow'),
]

def get_team_by_id(team_id):
    return TEAMS_DATA.get(team_id)

def get_all_teams():
    return list(TEAMS_DATA.values())