from django.db import models


class Service(models.Model):
    service_id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=100)
    price = models.IntegerField()
    time = models.DurationField()
    type = models.CharField(max_length=20)
    desc = models.TextField()

    class Meta:
        db_table = 'services'


class Client(models.Model):
    client_id = models.AutoField(primary_key=True, unique=True)
    name = models.CharField(max_length=30)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    class Meta:
        db_table = 'clients'


class TakenService(models.Model):
    takenserv_id = models.AutoField(primary_key=True, unique=True)
    client = models.ForeignKey('Client', on_delete=models.CASCADE, db_column='client_id')
    total_name = models.CharField(max_length=300)
    total_price = models.IntegerField()
    begin = models.DateTimeField()
    end = models.DateTimeField()

    class Meta:
        db_table = 'takenservices'


class FreeDate(models.Model):
    freedate_id = models.AutoField(primary_key=True, unique=True)
    begin = models.DateTimeField()
    duration = models.DurationField()
    takenserv = models.ForeignKey('TakenService', on_delete=models.CASCADE, null=True, db_column='takenserv_id')

    class Meta:
        db_table = 'freedates'


class IsCreatedDate(models.Model):
    sunday_date = models.DateField(primary_key=True, unique=True)
    status = models.BooleanField()

    class Meta:
        db_table = 'iscreateddates'

class IsDeletedDate(models.Model):
    monday_date = models.DateField(primary_key=True, unique=True)
    status = models.BooleanField()

    class Meta:
        db_table = 'isdeleteddates'
