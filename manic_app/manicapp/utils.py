import math
import re

from typing import List, Dict

from datetime import datetime

from manicapp.models import FreeDate


def convert_time_to_interval(time_str: str) -> dict:
    pattern = re.compile(r'(?:(\d+)\s*ч)?\s*(?:(\d+)\s*мин)?')

    match = pattern.match(time_str.strip())

    if match:
        hours = int(match.group(1)) if match.group(1) else 0
        minutes = int(match.group(2)) if match.group(2) else 0
        return {
            'hours': hours,
            'minutes': minutes
        }
    else:
        raise ValueError('Неправильный формат строки времени')


def count_durations(final_time) -> int:
    # Регулярное выражение для парсинга строки времени
    pattern = re.compile(r'(?:(\d+)\s*ч)?\s*(?:(\d+)\s*мин)?')

    # Парсинг строки времени
    match = pattern.match(final_time.strip())

    if match:
        hours = int(match.group(1)) if match.group(1) else 0
        minutes = int(match.group(2)) if match.group(2) else 0

        # Calculate total minutes
        total_minutes = hours * 60 + minutes

        # Calculate need_durations
        need_durations = math.ceil(total_minutes / 30)

        # Формирование строки INTERVAL
        if hours > 0 and minutes > 0:
            interval = f'{hours} hours {minutes} minutes'
        elif hours > 0:
            interval = f'{hours} hours'
        elif minutes > 0:
            interval = f'{minutes} minutes'
        else:
            raise ValueError('Время не указано')

        return need_durations
    else:
        # Если строка времени не соответствует формату, возвращаем ошибку
        raise ValueError('Неправильный формат строки времени')


def find_days_with_free_dates(need_durations: int) -> List[str]:
    records = FreeDate.objects.filter(begin__gte=datetime.now()).order_by('begin')
    current_day = None
    current_count = 0
    days_with_free_dates = set()
    for record in records:
        day = record.begin.date()
        if day != current_day:
            current_day = day
            current_count = 0
        if record.takenserv_id is None:
            current_count += 1
        else:
            current_count = 0
        if current_count >= need_durations:
            days_with_free_dates.add(current_day.strftime('%Y-%m-%d'))
    return list(sorted(days_with_free_dates))


def find_time_for_free_days(days_with_free_dates: List[str], need_durations: int) -> List[Dict[str, List[str]]]:
    result = []
    for day in days_with_free_dates:
        dates = FreeDate.objects.filter(begin__date=day).order_by('begin')
        current_count = 0
        time_of_day = []
        for i, date in enumerate(dates):
            if date.takenserv_id is None:
                current_count += 1
                if current_count >= need_durations:
                    prev_date_time = dates[i - need_durations + 1].begin.strftime("%H:%M:%S")
                    time_of_day.append(prev_date_time)
            else:
                current_count = 0
        result.append({day: time_of_day})

    return result