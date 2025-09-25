from django import forms

# Форма поиска команд
class SearchForm(forms.Form):
    # Поле поиска
    search = forms.CharField(label='Поиск', max_length=100)