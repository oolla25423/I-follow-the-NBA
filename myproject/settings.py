from pathlib import Path

# Базовая директория проекта
BASE_DIR = Path(__file__).resolve().parent.parent

# Секретный ключ (не использовать в production)
SECRET_KEY = 'django-insecure-^w)brt7qnf4zx&mxqg=do5k9_ijbm28o1@ackb+lbitra39_%^'

# Режим отладки (не использовать в production)
DEBUG = True

# Разрешенные хосты
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']

# Установленные приложения
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'myapp',
]

# Промежуточное ПО (middleware)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'myapp.middleware.PreferencesMiddleware',
]

# Основной URL-конфигурационный файл
ROOT_URLCONF = 'myproject.urls'

# Настройки шаблонов
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',
                'myapp.context_processors.user_preferences',
            ],
        },
    },
]

# WSGI-приложение
WSGI_APPLICATION = 'myproject.wsgi.application'


# Настройки базы данных (используется фиктивная база данных)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.dummy',
    }
}

# Валидаторы паролей
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Код языка по умолчанию
LANGUAGE_CODE = 'en'

# Доступные языки
LANGUAGES = [
    ('en', 'English'),
    ('ru', 'Русский'),
]

# Часовой пояс
TIME_ZONE = 'UTC'

# Использование интернационализации
USE_I18N = True

# Использование часовых поясов
USE_TZ = True

# Пути к файлам локализации
LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

# URL для статических файлов
STATIC_URL = '/static/'
# Директории для поиска статических файлов
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
# Директория для сбора статических файлов
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Поле по умолчанию для автоинкрементных полей
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'