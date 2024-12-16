from django.urls import path

from . import views

urlpatterns = [
    path('',  views.index, name='index'),
    path('login/', views.login, name='login'),
    path('service/', views.service, name='service'),
    path('about/', views.about, name='about'),
    path('create_free_dates/',  views.create_free_dates, name='create_free_dates'),
    path('delete_last_dates/',  views.delete_last_dates, name='delete_last_dates'),
    path('check_status_dates_created/',  views.check_status_dates_created, name='check_status_dates_created'),
    path('check_status_dates_deleted/',  views.check_status_dates_deleted, name='check_status_dates_deleted'),
    path('show_day_schedule/',  views.show_day_schedule, name='show_day_schedule'),
    path('foradmin745H7egq/', views.for_admin, name='for_admin'),
    path('login/',  views.login, name='login'),
    path('basic_services/',  views.basic_services, name='basic_services'),
    path('noadd_services/',  views.noadd_services, name='noadd_services'),
    path('design_services/',  views.design_services, name='design_services'),
    path('length_services/',  views.length_services, name='length_services'),
    path('search_time/',  views.search_time, name='search_time'),
    path('create_booking/',  views.create_booking, name='create_booking'),
    path('get_freedays_for_client/',  views.get_freedays_for_client, name='get_freedays_for_client'),
    path('show_account/',  views.show_account, name='show_account'),
]