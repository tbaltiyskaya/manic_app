# Generated by Django 5.1.2 on 2024-10-12 23:37

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Service',
            fields=[
                ('service_id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('time', models.DurationField()),
                ('type', models.CharField(max_length=20)),
                ('desc', models.TextField()),
            ],
        ),
    ]
