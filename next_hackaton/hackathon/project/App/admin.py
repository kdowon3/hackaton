from django.contrib import admin
from .models import GameRecord

@admin.register(GameRecord)
class GameRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'time_taken', 'date')
    search_fields = ('user',)
    list_filter = ('date',)
