import json
from datetime import datetime, date, time
from datetime import timedelta

from Tools.scripts.combinerefs import combine
from django.db.models.fields import return_None
from django.http import JsonResponse
from django.db.models import OuterRef, Subquery
from django.contrib.postgres.aggregates import StringAgg

from django.shortcuts import render
from django.utils.duration import duration_string

from django.views.decorators.http import require_http_methods
from djangoProject import settings

from . import utils
from .models import FreeDate, Service, Client, TakenService, IsCreatedDate, IsDeletedDate



def index(request):
    return render(request, 'index.html', {'MEDIA_URL': settings.MEDIA_URL})
def login(request):
    return render(request, 'logine.html', {'MEDIA_URL': settings.MEDIA_URL})
def service(request):
    return render(request, 'service.html', {'MEDIA_URL': settings.MEDIA_URL})
def about(request):
    return render(request, 'about.html', {'MEDIA_URL': settings.MEDIA_URL})
def for_admin(request):
    return render(request, 'foradmin745H7egq.html', {'MEDIA_URL': settings.MEDIA_URL})
def login(request):
    return render(request, 'login.html', {'MEDIA_URL': settings.MEDIA_URL})


@require_http_methods(['POST'])
def show_account(request):
    try:
        data = json.loads(request.body)
        login = data.get('login')
        password = data.get('password')
        if not login or not password:
            return JsonResponse({'error': 'login and password are required'}, status=400)
        if login == 'adminlogin' and password == '123456':
            return JsonResponse({'message': 'Login successful'}, status=200)
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


def show_day_schedule(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        data = json.loads(request.body)
        admin_date = data.get('date')

        try:
            today_date = datetime.strptime(admin_date, "%Y-%m-%d").date()
        except ValueError:
            return JsonResponse({'error': 'Неверный формат даты'}, status=400)

        today_schedule = TakenService.objects.filter(
            begin__gte=datetime.combine(today_date, time(10, 0, 0)),
            begin__lte=datetime.combine(today_date, time(18, 30, 0))
        ).order_by('begin').annotate(
            client_name=Subquery(
                Client.objects.filter(client_id=OuterRef('client_id')).values('name')[:1]
            )
        ).values('client_name', 'total_name', 'total_price', 'begin', 'end')
        result = list(today_schedule)
        for item in result:
            item['begin'] = item['begin'].time()
            item['end'] = item['end'].time()

        return JsonResponse(result, safe=False)
    else:
        return render(request, 'for_admin.html')


def basic_services(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        basic_services = Service.objects.filter(type='basic').values('service_id', 'name', 'desc', 'price', 'time', 'type')
        return JsonResponse(list(basic_services), safe=False)
    else:
        return render(request, 'index.html')


def noadd_services(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        noadd_services = Service.objects.filter(type='noadd').values('service_id', 'name', 'desc', 'price', 'time', 'type')
        return JsonResponse(list(noadd_services), safe=False)
    else:
        return render(request, 'index.html')


def design_services(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        design_services = Service.objects.filter(type__in=['noadd', 'design']).values('service_id', 'name', 'desc', 'price', 'time', 'type')
        return JsonResponse(list(design_services), safe=False)
    else:
        return render(request, 'index.html')


def length_services(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        length_services = Service.objects.filter(type__in=['noadd', 'design', 'length']).values('service_id', 'name', 'desc', 'price', 'time', 'type')
        return JsonResponse(list(length_services), safe=False)
    else:
        return render(request, 'index.html')


@require_http_methods(['POST'])
def search_time(request):
    try:
        data = json.loads(request.body)
        final_time = data.get('finalTime')
        if not final_time:
            return JsonResponse({'error': 'finalTime is required'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    try:
        need_durations = utils.count_durations(final_time)
        request.session['need_durations'] = need_durations  # Сохраняем в сессии
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)

    print(f'Calculated need_durations: {need_durations}')
    return JsonResponse({'need_durations': need_durations}, safe=False)


def get_freedays_for_client(request):
    need_durations = request.session.get('need_durations')  # Получаем из сессии
    if need_durations is None:
        return JsonResponse({'error': 'need_durations is required'}, status=400)

    freedates = utils.find_time_for_free_days(utils.find_days_with_free_dates(need_durations), need_durations)
    return JsonResponse(freedates, safe=False)


@require_http_methods(['POST'])
def create_booking(request):
    try:
        data = json.loads(request.body)
        if not data:
            return JsonResponse({'error': 'данные не получены'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    request.session['client_data'] = data
    print('DATA:', data)

    client_response, status_code = check_client_id(request)
    if status_code in [201, 200]:
        client_id = client_response.get('client_id')
        add_taken_service(request, client_id)
        return JsonResponse({'message': 'Запись успешно создана'}, status=201)

    return JsonResponse(client_response)


def check_client_id(request):
    data = request.session.get('client_data')
    client_name = data.get('name')
    client_email = data.get('email')
    client_phone = data.get('phone')

    client = Client.objects.filter(name=client_name, email=client_email, phone=client_phone).first()

    if client is None:
        new_client = Client(name=client_name, email=client_email, phone=client_phone)
        try:
            new_client.save()
            print(f"Клиент создан: {new_client.client_id}")
            return {'message': 'Клиент создан', 'client_id': new_client.client_id}, 201
        except Exception as e:
            print(f"Ошибка при сохранении клиента: {e}")
            return {'error': 'Ошибка при создании клиента'}, 500
    else:
        print(f"Клиент уже существует: {client.client_id}")
        return {'message': 'Клиент уже существует', 'client_id': client.client_id}, 200


def add_taken_service(request, client_id):
    data = request.session.get('client_data')
    if not data:
        raise ValueError("Нет данных клиента в сессии")

    final_name = data.get('finalName')
    final_time = utils.convert_time_to_interval(data.get('finalTime'))
    final_price = data.get('finalPrice')

    begin_date = data.get('begin_date') + ' ' + data.get('begin_time')
    begin = datetime.strptime(begin_date, '%Y-%m-%d %H:%M:%S')
    duration = timedelta(hours=final_time["hours"], minutes=final_time["minutes"])

    try:
        client = Client.objects.get(client_id=client_id)  # Получаем объект клиента
        new_taken_service = TakenService(
            client=client,
            total_name=final_name,
            total_price=final_price,
            begin=begin,
            end=begin + duration
        )
        new_taken_service.save()
        print(f"Услуга записана: {new_taken_service.takenserv_id}")

        FreeDate.objects.filter(begin__gte=new_taken_service.begin, begin__lt=new_taken_service.end).update(
            takenserv=new_taken_service.takenserv_id)
    except Exception as e:
        print(f"Ошибка при добавлении услуги: {e}")
        raise ValueError("Ошибка при добавлении услуги")


def status_dates_created(today_date):
    new_sunday = IsCreatedDate(sunday_date= today_date, status = True)
    new_sunday.save()
    return True

@require_http_methods(['POST'])
def check_status_dates_created(request):
    try:
        data = json.loads(request.body)
        admin_date = data.get('date')
        if not admin_date:
            return JsonResponse({'error': 'данные не получены'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    today_date = datetime.strptime(admin_date, "%Y-%m-%d").date()
    sunday = IsCreatedDate.objects.filter(sunday_date=today_date).first()
    if not sunday:
         return JsonResponse({'created': False}) 
    return JsonResponse({'created': True})


@require_http_methods(['POST'])
def create_free_dates(request):
    try:
        data = json.loads(request.body)
        admin_date = data.get('date')
        if not admin_date:
            return JsonResponse({'error': 'данные не получены'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    today_date = datetime.strptime(admin_date, "%Y-%m-%d").date()
    begin_day = today_date + timedelta(days=7)

    for i in range(1, 8):
        current_date = begin_day + timedelta(days=i)
        begin_time = time(10, 0, 0)
        duration = timedelta(minutes=30)

        for j in range(0, 18):
            new_freedate = FreeDate(
                begin=datetime.combine(current_date, begin_time) + (duration * j),
                duration=duration,
                takenserv=None
            )
            new_freedate.save()
    update_status = status_dates_created(today_date)
    return JsonResponse({'message': 'Новые окошки созданы.', 'update_status': update_status})


def status_dates_deleted(today_date):
    new_monday = IsDeletedDate(monday_date= today_date, status = True)
    new_monday.save()
    return True

@require_http_methods(['POST'])
def check_status_dates_deleted(request):
    try:
        data = json.loads(request.body)
        admin_date = data.get('date')
        if not admin_date:
            return JsonResponse({'error': 'данные не получены'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    today_date = datetime.strptime(admin_date, "%Y-%m-%d").date()
    monday = IsDeletedDate.objects.filter(monday_date=today_date).first()
    if not monday:
        return JsonResponse({'created': False})
    return JsonResponse({'created': True})


@require_http_methods(['POST'])
def delete_last_dates(request):
    try:
        body = request.body.decode('utf-8')
        data = json.loads(body)
        admin_date = data.get('date')
        if not admin_date:
            return JsonResponse({'error': 'данные не получены'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    today_date = datetime.strptime(admin_date, "%Y-%m-%d").date()
    current_datetime = datetime.combine(today_date, time(10, 0, 0))
    start_datetime = datetime.combine(today_date - timedelta(days=7), time(10, 0, 0))
    entries_to_delete = FreeDate.objects.filter(begin__gte=start_datetime, begin__lt=current_datetime).order_by('begin')
    try:
        deleted_count = entries_to_delete.delete()[0]
        update_status = status_dates_deleted(today_date)
        return JsonResponse({'message': f'Удалено прошлых записей: {deleted_count}',
                             'update_status': update_status})
    except Exception as e:
        return JsonResponse({'error': f'Записи не удалены: {str(e)}'}, status=500)