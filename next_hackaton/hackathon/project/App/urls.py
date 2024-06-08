from django.contrib import admin
from django.urls import path
from App import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.start, name='start'),
    path('rules/', views.rules, name='rules'),
    path('index/', views.index, name='index'),
    path('win/', views.win, name='win'),
    path('lose1/', views.lose1, name='lose1'),
    path('lose2/', views.lose2, name='lose2'),
    path('logout/', views.logout, name='logout'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
]
