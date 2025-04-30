from django.urls import path, include

urlpatterns = [
    # ... other patterns ...
    path('api/', include('music.urls')),
]