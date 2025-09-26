from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from django.templatetags.static import static

urlpatterns = [
    path('favicon.ico', RedirectView.as_view(url=static('images/favicon.png'), permanent=True)),
    path('admin/', admin.site.urls),
    path('', include('myapp.urls')),
]
