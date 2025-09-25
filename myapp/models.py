from django.db import models

# Данные команд НБА
TEAMS_DATA = {
    1: {
        'id': 1,
        'name': 'Los Angeles Lakers',
        'city': 'Los Angeles',
        'conference': 'Western',
        'division': 'Pacific',
        'founded': 1947,
        'championships': 17,
        'description': 'Одна из самых успешных франшиз в истории НБА, известная своими фиолетовыми и золотыми цветами.',
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
        'description': 'Историческая франшиза с наибольшим количеством чемпионств НБА, известная своими зелеными и белыми цветами.',
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
        'description': 'Известна своим быстрым стилем игры и превосходством в трехочковых бросках.',
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
        'description': 'Известна эпохой Майкла Джордана и шестью чемпионскими титулами в 1990-х годах.',
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
        'description': 'Известна своей "Культурой Heat" и несколькими чемпионскими титулами.',
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
        'description': 'Современная франшиза, известная звездными составами и характерной черной формой.',
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
        'description': 'Известна своей страстной фанбазой и недавним чемпионским успехом с Гианнисом Антетокумпо.',
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
        'description': 'Известна своими оранжевыми и фиолетовыми цветами и быстрым стилем игры "Семь секунд или меньше".',
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
        'description': 'Известна своим уникальным стилем и чемпионским туром под руководством Дирка Новицки.',
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
        'description': 'Известна своей горной идентичностью и недавним чемпионским успехом с Николой Йокичем.',
        'colors': ['#0E2240', '#FEC524']
    }
}

# Доступные языки
LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('ru', 'Русский'),
]

# Доступные темы
THEME_CHOICES = [
    ('light', 'White'),
    ('dark', 'Black'),
    ('yellow', 'Yellow'),
]

# Получить команду по ID
def get_team_by_id(team_id):
    return TEAMS_DATA.get(team_id)

# Получить все команды
def get_all_teams():
    return list(TEAMS_DATA.values())