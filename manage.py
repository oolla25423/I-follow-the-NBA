import os
import sys


# Основная функция для запуска Django-приложения
def main():
    # Установка переменной окружения для настроек Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
    try:
        # Импорт и выполнение команд Django
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Обработка ошибки импорта Django
        raise ImportError(
            "Не удалось импортировать Django. Убедитесь, что он установлен и "
            "доступен в вашей переменной окружения PYTHONPATH. Возможно, вы "
            "забыли активировать виртуальное окружение?"
        ) from exc
    # Выполнение командной строки Django
    execute_from_command_line(sys.argv)


# Точка входа в программу
if __name__ == '__main__':
    main()