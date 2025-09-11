# 🏀 Basketball Fans - Web application for basketball fans

A Django web application for basketball enthusiasts with the ability to set up favorite teams, choose design themes and interface language.

## 🚀 Features

- **Favorite team management** - add and remove teams from favorites
- **Detailed team information** - view detailed information about each team
- **Theme customization** - choose between light, dark, blue and green themes
- **Multilingual support** - support for Russian, English, Spanish, French, German and Italian languages
- **Settings persistence** - use cookies to remember user preferences
- **Responsive design** - correct display on all devices

## 🛠️ Технический стек

- **Backend**: Django 5.2.6
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **База данных**: SQLite (по умолчанию)
- **Стили**: CSS Grid, Flexbox, CSS переменные
- **Иконки**: Font Awesome 6.0
- **Шрифты**: Google Fonts (Inter)

## 📋 Требования

- Python 3.8+
- pip (менеджер пакетов Python)
- Виртуальное окружение (рекомендуется)

## ⚡ Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <URL_репозитория>
cd django_project
```

### 2. Создание и активация виртуального окружения

**Windows:**
```bash
python -m venv venv
venv\\Scripts\\activate
```

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 4. Применение миграций

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Создание суперпользователя (опционально)

```bash
python manage.py createsuperuser
```

### 6. Запуск сервера разработки

```bash
python manage.py runserver
```

### 7. Открытие приложения

Откройте браузер и перейдите по адресу: `http://127.0.0.1:8000/`

## 📁 Структура проекта

```
django_project/
├── myapp/                      # Основное приложение
│   ├── admin.py               # Настройки админ-панели
│   ├── apps.py                # Конфигурация приложения
│   ├── models.py              # Модели данных (статичные данные команд)
│   ├── views.py               # Представления (views)
│   ├── urls.py                # URL маршруты приложения
│   └── tests.py               # Тесты
├── myproject/                  # Настройки проекта
│   ├── settings.py            # Основные настройки Django
│   ├── urls.py                # Главный URL конфигуратор
│   ├── wsgi.py                # WSGI конфигурация
│   └── asgi.py                # ASGI конфигурация
├── templates/                  # HTML шаблоны
│   ├── base.html              # Базовый шаблон
│   ├── home.html              # Главная страница
│   ├── preferences.html       # Страница настроек
│   ├── team_detail.html       # Детальная страница команды
│   └── leagues.html           # Страница лиг
├── static/                     # Статические файлы
│   ├── css/
│   │   └── style.css          # Основные стили
│   ├── js/
│   │   └── main.js            # JavaScript функциональность
│   └── images/                # Изображения
├── manage.py                   # Django утилита управления
├── requirements.txt           # Зависимости Python
├── .gitignore                 # Git ignore файл
└── README.md                  # Документация проекта
```

## 🎯 Основные страницы

### Home page (`/`)
- Display user's favorite basketball teams
- List of all available teams
- Application statistics

### Settings (`/preferences/`)
- Choose favorite teams
- Set interface language
- Choose design theme
- Additional settings

### Team detail page (`/team/<id>/`)
- Detailed team information
- History and achievements
- Latest news
- Photo gallery

## 🔧 Настройка и кастомизация

### Добавление новых команд

Команды хранятся в виде статических данных в файле `myapp/models.py`. Для добавления новой команды:

```python
# В TEAMS_DATA добавьте новый словарь:
{
    'id': 9,
    'name': 'Новая команда',
    'league': 'Премьер-лига',
    'country': 'Россия',
    'logo': 'new_team.png',
    'founded': 2000,
    'description': 'Описание команды.'
}
```

### Добавление новых языков

В файле `myapp/models.py` обновите `LANGUAGE_CHOICES`:

```python
LANGUAGE_CHOICES = [
    # ... существующие языки
    ('pt', 'Português'),
]
```

### Создание новых тем

В файле `static/css/style.css` добавьте новую тему:

```css
[data-theme="new-theme"] {
  --bg-primary: #ваш_цвет;
  --text-primary: #ваш_цвет;
  /* ... другие переменные */
}
```

## 🧪 Тестирование

Для запуска тестов выполните:

```bash
python manage.py test
```

## 📱 Адаптивность

Приложение полностью адаптивно и корректно отображается на:
- Настольных компьютерах (1200px+)
- Планшетах (768px - 1199px)
- Мобильных устройствах (до 767px)

## 🔒 Безопасность

- CSRF защита включена
- Безопасные настройки cookies
- Валидация данных на стороне сервера
- Экранирование пользовательского ввода

## 🌟 Особенности реализации

### Использование Cookies
- **Любимые команды**: `favorite_teams` (срок жизни: 1 год)
- **Язык интерфейса**: `language` (срок жизни: 1 год)
- **Тема оформления**: `theme` (срок жизни: 1 год)
- **Последняя посещенная страница**: `last_visited` (срок жизни: 30 дней)

### AJAX функциональность
- Добавление/удаление команд из избранного без перезагрузки страницы
- Динамическое обновление интерфейса
- Уведомления о действиях пользователя

### CSS переменные для тем
Использование CSS custom properties для легкого переключения между темами в реальном времени.

## 🚀 Развертывание в продакшен

Для развертывания в продакшене:

1. Установите `DEBUG = False` в `settings.py`
2. Настройте `ALLOWED_HOSTS`
3. Используйте продакшен базу данных (PostgreSQL/MySQL)
4. Настройте веб-сервер (Nginx + Gunicorn)
5. Настройте сбор статических файлов: `python manage.py collectstatic`

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функциональности (`git checkout -b feature/new-feature`)
3. Зафиксируйте изменения (`git commit -am 'Add new feature'`)
4. Отправьте ветку (`git push origin feature/new-feature`)
5. Создайте Pull Request

## 📝 Лицензия

Этот проект создан в образовательных целях.

## 👥 Автор

Разработано как учебный проект Django веб-приложения.

## 🔗 Полезные ссылки

- [Документация Django](https://docs.djangoproject.com/)
- [Font Awesome Icons](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**Удачного использования! ⚽🏆**