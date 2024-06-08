from django.db import models

class GameRecord(models.Model):
    user = models.CharField(max_length=100)
    time_taken = models.DurationField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user} - {self.time_taken}'
