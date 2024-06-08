from django.shortcuts import render, redirect
from django.utils import timezone
from django.http import JsonResponse
from .models import GameRecord

from django.views.decorators.csrf import csrf_exempt
import datetime
import json
import logging

logger = logging.getLogger(__name__)

def login_required_view(view_func):
    def wrapper(request, *args, **kwargs):
        if 'username' not in request.session:
            return redirect('start')
        return view_func(request, *args, **kwargs)
    return wrapper

def start(request):
    if request.method == 'POST':
        username = request.POST['username']
        request.session['username'] = username
        request.session['start_time'] = str(timezone.now())
        context = {'username': username}
        return render(request, 'App/start.html', context)
    context = {}
    if 'username' in request.session:
        context['username'] = request.session['username']
    return render(request, 'App/start.html', context)

@login_required_view
def rules(request):
    return render(request, 'App/rule.html')

@login_required_view
def index(request):
    return render(request, 'App/index.html')

@login_required_view
def win(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            time_taken_str = data.get('time_taken')
            logger.debug(f'Received time_taken: {time_taken_str}')
            time_taken = datetime.timedelta(seconds=datetime.datetime.fromisoformat(time_taken_str).timestamp())
            username = request.session.get('username')
            if username:
                GameRecord.objects.create(user=username, time_taken=time_taken)
                logger.debug('Game record created successfully.')
                return JsonResponse({'success': True})
            else:
                logger.error('User not found in session')
                return JsonResponse({'success': False, 'error': 'User not found in session'})
        except Exception as e:
            logger.error(f'Error recording time: {str(e)}')
            return JsonResponse({'success': False, 'error': str(e)})

    # GET 요청이거나 다른 잘못된 요청 방식 처리
    records = GameRecord.objects.all().order_by('time_taken')[:10]
    context = {'records': records}
    return render(request, 'App/win.html', context)


def lose1(request):
    return render(request, 'App/lose1.html')

def lose2(request):
    return render(request, 'App/lose2.html')

def logout(request):
    request.session.flush()
    return redirect('start')

def leaderboard(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            time_taken_str = data.get('time_taken')
            logger.debug(f'Received time_taken: {time_taken_str}')
            time_taken = datetime.timedelta(seconds=datetime.datetime.fromisoformat(time_taken_str).timestamp())
            username = request.session.get('username')
            if username:
                GameRecord.objects.create(user=username, time_taken=time_taken)
                logger.debug('Game record created successfully.')
                return JsonResponse({'success': True})
            else:
                logger.error('User not found in session')
                return JsonResponse({'success': False, 'error': 'User not found in session'})
        except Exception as e:
            logger.error(f'Error recording time: {str(e)}')
            return JsonResponse({'success': False, 'error': str(e)})
    records = GameRecord.objects.all().order_by('time_taken')[:10]
    context = {'records': records}
    return render(request, 'App/leaderboard.html', context)

