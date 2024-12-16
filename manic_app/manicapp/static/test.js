$(document).ready(function() {
    console.log('файл подгрузился');
    var csrftoken = $('input[name="csrfmiddlewaretoken"]').val();
    var selectedServiceMainId = null; // хранить выбранный ID основной услуги
    var selectedAdditionalServiceId = []; // хранить массив выбранных ID дополнительных услуг
    updateSearchButtonState();
    var finalName = '';
    var finalPrice = 0;
    var finalTime = '0 ч 0 мин';
    var sended_finals = false;
    let begin_date = ''
    let begin_time = ''

    function createServiceCard(service, isMainService) {
        var card = $('<div>').addClass(isMainService ? 'type-card' : 'add-card');
        var serviceName = $('<div>').addClass('service-name');
        var h4Name = $('<h4>').addClass('name').text(service.name);
        serviceName.append(h4Name);

        var serviceDesc = $('<div>').addClass('service-desc');
        var pDesc = $('<p>').addClass('desc').text(service.desc);
        serviceDesc.append(pDesc);

        var servicePrice = $('<div>').addClass('service-price');
        var pPrice = $('<p>').addClass('price').text(`${service.price} ₽`);
        servicePrice.append(pPrice);

        var serviceTime = $('<div>').addClass('service-time');
        var pTime = $('<p>').addClass('time').text(formatTime(service.time));
        serviceTime.append(pTime);

        var selectBtn = $('<div>').addClass('select-btn');
        var checkbox = $('<input>')
           .attr('type', 'radio')
           .addClass('custom-radio')
           .attr('name', service.type)
           .attr('value', service.service_id)
           .on('change', function() {
                if ($(this).prop('checked')) {
                    if (isMainService) {
                        selectedAdditionalServiceId = [];
                        selectedServiceMainId = $(this).val();
                        $('#add_serv_add').empty();
                        console.log(`Выбрана основная услуга: ${service.name} (ID: ${selectedServiceMainId}, Тип: ${service.type})`);
                        logAllValues();
                        updateFinals();
                        loadAdditionalServices();
                    } else {
                        if (service.type === 'noadd') {
                            selectedAdditionalServiceId = [];
                            selectedAdditionalServiceId.push($(this).val());
                            $('input[name="length"], input[name="design"]').prop('checked', false);
                        } else if (service.type === 'length') {
                            selectedAdditionalServiceId = selectedAdditionalServiceId.filter(id => $('input[value="' + id + '"]').attr('name') !== service.type)
                            selectedAdditionalServiceId = selectedAdditionalServiceId.filter(id => $('input[value="' + id + '"]').attr('name') !== 'noadd')
                            selectedAdditionalServiceId.push($(this).val());
                            selectedAdditionalServiceId.sort((a, b) => a - b);
                            $('input[name="noadd"]').prop('checked', false);
                        } else if (service.type === 'design') {
                            selectedAdditionalServiceId = selectedAdditionalServiceId.filter(id => $('input[value="' + id + '"]').attr('name') !== service.type)
                            selectedAdditionalServiceId = selectedAdditionalServiceId.filter(id => $('input[value="' + id + '"]').attr('name') !== 'noadd')
                            selectedAdditionalServiceId.push($(this).val());
                            selectedAdditionalServiceId.sort((a, b) => a - b);
                            $('input[name="noadd"]').prop('checked', false);
                        }
                        console.log(`Выбрана дополнительная услуга: ${service.name} (ID: ${$(this).val()}, Тип: ${service.type})`);
                        logAllValues();
                        updateFinals();
                    }
                } else {
                    if (isMainService) {
                        selectedServiceMainId = null;
                        $('#add_serv_add').empty();
                        logAllValues();
                        updateFinals();
                    } else {
                        if (Array.isArray(selectedAdditionalServiceId)) {
                            selectedAdditionalServiceId = selectedAdditionalServiceId.filter(id => id !== $(this).val());
                        } else {
                            selectedAdditionalServiceId = [];
                        }
                        logAllValues();
                        updateFinals();
                    }
                }
            });
        selectBtn.append(checkbox);

        card.append(serviceName, serviceDesc, servicePrice, serviceTime, selectBtn);
        return card;

        function formatTime(timeString) {
        const durationParts = timeString.match(/P0DT(\d+)H(\d+)M(\d+)S/);
        if (durationParts) {
            const hours = parseInt(durationParts[1]);
            const minutes = parseInt(durationParts[2]);
            if (hours === 0) {
            return `${minutes} мин`;
            } else if (minutes === 0) {
             return `${hours} ч`;
            } else {
              return `${hours} ч ${minutes} мин`;
            }
        } else {
             return '';
            }
        }
    }

    function logAllValues() {
        console.log(`Текущие значения: 
            selectedServiceMainId: ${selectedServiceMainId},
            selectedAdditionalServiceId: ${JSON.stringify(selectedAdditionalServiceId)}`);
    }

    function updateFinals() {
    // Сохраняется предыдущее состояние
    const previousFinalName = finalName;
    const previousFinalPrice = finalPrice;
    const previousFinalTime = finalTime;

    finalName = '';
    finalPrice = 0;
    finalTime = '0 ч 0 мин';
    sended_finals = false;

    if (selectedServiceMainId) {
        var mainServiceName = $(`input[value="${selectedServiceMainId}"]`).closest('.type-card, .add-card').find('.name').text();
        var mainServicePrice = parseInt($(`input[value="${selectedServiceMainId}"]`).closest('.type-card, .add-card').find('.price').text().replace(' ₽', ''));
        var mainServiceTime = $(`input[value="${selectedServiceMainId}"]`).closest('.type-card, .add-card').find('.time').text();

        finalName += mainServiceName;
        finalPrice += mainServicePrice;
        finalTime = addTime(finalTime, mainServiceTime);
    }

    selectedAdditionalServiceId.forEach(function(serviceId) {
        var serviceName = $(`input[value="${serviceId}"]`).closest('.type-card, .add-card').find('.name').text();
        var servicePrice = parseInt($(`input[value="${serviceId}"]`).closest('.type-card, .add-card').find('.price').text().replace(' ₽', ''));
        var serviceTime = $(`input[value="${serviceId}"]`).closest('.type-card, .add-card').find('.time').text();

        if (finalName) {
            finalName += ', '; // Добавляем запятую и пробел, если finalName не пуст
        }
        finalName += serviceName;
        finalPrice += servicePrice;
        finalTime = addTime(finalTime, serviceTime);
    });

    console.log(`finalName: ${finalName}`); // Логируем значение finalName
    console.log(`finalPrice: ${finalPrice} ₽`); // Логируем значение finalPrice
    console.log(`finalTime: ${finalTime}`); // Логируем значение finalTime
    document.querySelector('.final-name .final-item').textContent = finalName;
    document.querySelector('.final-price .final-item').textContent = `Итоговая цена: ${finalPrice} ₽`;
    document.querySelector('.final-time .final-item').textContent = `Длительность: ${finalTime}`;

    // Проверяем, изменились ли данные
    if (finalName === previousFinalName && finalPrice === previousFinalPrice && finalTime === previousFinalTime) {
        sended_finals = true; // Данные не изменились
    }

    updateSearchButtonState();
    updateBookDateState();
    updateBookButtonState();
    console.log(`sended_finals: ${sended_finals}`);
    }

    function CreateDayElements(url) {
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
            // Очищаем селекторы
            $('#day-choose, #time-choose').empty();
            begin_date = '';
            begin_time = '';
            console.log(`begin_date: ${begin_date}`);
            console.log(`begin_time: ${begin_time}`);
            // Создаем опции для селектора #day-choose
            $('#day-choose').append('<option value="" disabled selected>Выберите день</option>');
            data.forEach(function(item) {
                $('#day-choose').append(`<option value="${Object.keys(item)[0]}">${Object.keys(item)[0]}</option>`);
            });

            // Обрабатываем выбор опции в селекторе #day-choose
            $('#day-choose').on('change', function() {
                var selectedDay = $(this).val();
                begin_date = selectedDay; // Сохраняем выбранный день в переменную begin_date
                begin_time = '';
                console.log(`begin_date: ${begin_date}`);
                updateBookButtonState();

                if (selectedDay !== "") {
                    var options = data.find(item => Object.keys(item)[0] === selectedDay);
                    $('#time-choose').empty();
                    $('#time-choose').append('<option value="" disabled selected>Выберите время</option>');
                    options[selectedDay].forEach(function(time) {
                        $('#time-choose').append(`<option value="${time}">${time}</option>`);
                    });
                } else {
                    $('#time-choose').empty();
                }
                updateBookButtonState();
            });

            // Обрабатываем выбор опции в селекторе #time-choose
            $('#time-choose').on('change', function() {
                begin_time = $(this).val(); // Сохраняем выбранное время в переменную begin_time
                console.log(`begin_time: ${begin_time}`);
                updateBookButtonState();
            });
        },
        error: function(xhr, status, error) {
            console.error("Ошибка при загрузке данных:", error);
        }
    });
    }

    function updateBookDateState() {
        console.log(`begin_date: ${begin_date}`);
        console.log(`begin_time: ${begin_time}`);
    const bookDateElement = document.querySelector('.book-date');
    const isDisabled = !sended_finals || (selectedServiceMainId === null && selectedAdditionalServiceId.length === 0);

    if (isDisabled) {
        bookDateElement.classList.add('disabled');
    } else {
        bookDateElement.classList.remove('disabled');
    }
    }

    function updateBookButtonState(){
    const button = document.getElementById('book-btn');
    if(begin_date != '' && begin_time != '' && sended_finals == true){
        button.disabled = false;
        console.log(`кнопка активна`);
    }
    else{
        button.disabled = true;
        console.log(`кнопка НЕактивна`);
    }
    }

    function updateSearchButtonState() {
    const button = document.getElementById('search-time-btn');
    // Если основная услуга не выбрана или дополнительные услуги пустые, кнопка отключена
    if(selectedServiceMainId === null || selectedAdditionalServiceId.length === 0) {
        button.disabled = true; // Отключаем кнопку
        document.querySelector('#search-time-btn p').textContent = 'Выбрать время';
    }
    else if (sended_finals == true){
        button.disabled = true;
        document.querySelector('#search-time-btn p').textContent = 'Свободные даты найдены';
    }
    else if (sended_finals == false){
         button.disabled = false;
         document.querySelector('#search-time-btn p').textContent = 'Выбрать время';
    }
    }

    function addTime(time1, time2) {
    // Функция для извлечения часов и минут из строки времени
    function parseTime(timeString) {
        let hours = 0;
        let minutes = 0;

        const hourMatch = timeString.match(/(\d+)\s*ч/);
        const minuteMatch = timeString.match(/(\d+)\s*мин/);

        if (hourMatch) {
            hours = parseInt(hourMatch[1], 10);
        }
        if (minuteMatch) {
            minutes = parseInt(minuteMatch[1], 10);
        }

        return { hours, minutes };
    }

    const time1Parts = parseTime(time1);
    const time2Parts = parseTime(time2);

    const totalHours = time1Parts.hours + time2Parts.hours;
    const totalMinutes = time1Parts.minutes + time2Parts.minutes;

    // Обработка переполнения минут
    const finalHours = totalHours + Math.floor(totalMinutes / 60);
    const finalMinutes = totalMinutes % 60;

    // Формируем строку результата
    let result = '';
    if (finalHours > 0) {
        result += `${finalHours} ч `;
    }
    if (finalMinutes > 0 || finalHours === 0) {
        result += `${finalMinutes} мин`;
    }

    return result.trim(); // Убираем лишние пробелы
    }

    function loadAndDisplayServices(url, containerId) {
        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                $(`#${containerId}`).empty();
                $.each(data, function(index, service) {
                    var card = createServiceCard(service, containerId === 'main_serv_add');
                    $(`#${containerId}`).append(card);
                });
            },
            error: function(xhr, status, error) {
                console.log(`Ошибка при загрузке данных: ${error}`);
            }
        });
         updateSearchButtonState();
    }

    function loadAdditionalServices() {
        if (selectedServiceMainId === null) {
        $('#add_serv_add').empty();
        return;
        }

        var url;
        if (selectedServiceMainId === '1' || selectedServiceMainId === '2') {
            url = '/noadd_services/';
        } else if (selectedServiceMainId === '3') {
            url = '/design_services/';
        } else if (selectedServiceMainId === '4') {
            url = '/length_services/';
        } else {
            $('#add_serv_add').empty();
            return;
        }

        loadAndDisplayServices(url, 'add_serv_add');
    }

    loadAndDisplayServices('/basic_services/', 'main_serv_add');

    // Обработчик событий изменения состояния radio-элементов на странице
    $(document).on('change', 'input[type="radio"]', function() {
        if ($(this).closest('.type-card').length > 0) {
            localStorage.setItem('selectedServiceMainId', $(this).val());
            loadAdditionalServices();
        } else {
            if ($(this).attr('name') === 'noadd') {
                localStorage.setItem('selectedServiceNoAddId', $(this).val());
            } else if ($(this).attr('name') === 'length') {
                localStorage.setItem('selectedServiceLengthId', $(this).val());
            } else if ($(this).attr('name') === 'design') {
                localStorage.setItem('selectedServiceDesignId', $(this).val());
            }
        }
        updateSearchButtonState();
    });

    // Обработчик клика на кнопку "Выбрать время"
$('#search-time-btn').on('click', function(e) {
    e.preventDefault();
    var dataToSend = {
        finalTime: finalTime
    };
    if (!csrftoken) {
        console.error('CSRF токен отсутствует');
        return;
    }
    $.ajax({
        url: '/search_time/',
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(dataToSend), // Преобразуем объект в JSON
        success: function(response) {
            console.log('Данные успешно отправлены:', response);
            sended_finals = true;
            updateSearchButtonState();
            updateBookDateState();
            // Обработка успешного ответа от сервера
            CreateDayElements('/get_freedays_for_client/');
        },
        error: function(xhr, status, error) {
            console.error('Ошибка при отправке данных:', error);
            console.error('Статус:', status);
            console.error('Ответ сервера:', xhr.responseText);
            // Обработка ошибки
        }
    });
});

$('#book-btn').on('click', function() {
    document.querySelector('#form-begin').textContent = `Вы записаны на услуги: ${finalName}, на ${begin_date} в ${begin_time}.`;
    document.querySelector('#form-final-price').textContent = `Стоимость: ${finalPrice}₽`;
    document.querySelector('#form-final-time').textContent = `Длительность: ${finalTime}`;
    document.getElementById('modal').style.display = 'block';
   });

function updateSubmitButtonState(isSent){
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn && isSent) {
        submitBtn.querySelector('p').textContent = 'Успешно';
        submitBtn.disabled = true;
    }
    else{
        submitBtn.querySelector('p').textContent = 'Подтвердить запись';
        submitBtn.disabled = false;
    }
}

document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('contactForm').reset();
     updateSubmitButtonState(false);
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == document.getElementById('modal')) {
        document.getElementById('contactForm').reset();
        updateSubmitButtonState(false);
        document.getElementById('modal').style.display = 'none';
    }
}

document.getElementById('submit-btn').addEventListener('click', function(event) {
    event.preventDefault();
    var formData = {
        finalName: finalName,
        finalTime: finalTime,
        finalPrice: finalPrice,
        begin_date: begin_date,
        begin_time: begin_time,
        name: $('#name').val(),
        email: $('#email').val(),
        phone: $('#phone').val() 
    };
    // Отправляем данные на сервер
    $.ajax({
        url: '/create_booking/',
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(formData),
        success: function(response) {
           updateSubmitButtonState(true);
        },
        error: function(error) {
            alert('Ошибка при отправке данных.'); // Уведомление об ошибке
        }
    });
});

$('#phone').on('input', function() {
        let input = $(this).val().replace(/\D/g, ''); // Удаляем все нецифровые символы
        if (input.length > 11) {
            input = input.slice(0, 11); // Ограничиваем длину до 11 цифр
        }

        // Форматируем номер телефона
        let formattedInput = '8'; // Начинаем с 8
        if (input.length > 0) {
            formattedInput += '-';
        }
        if (input.length > 1) {
            formattedInput += input.substring(1, 4); // 1-3 цифры
        }
        if (input.length > 4) {
            formattedInput += '-';
            formattedInput += input.substring(4, 7); // 4-6 цифры
        }
        if (input.length > 7) {
            formattedInput += '-';
            formattedInput += input.substring(7, 9); // 7-8 цифры
        }
        if (input.length > 9) {
            formattedInput += '-';
            formattedInput += input.substring(9, 11); // 9-11 цифры
        }

        $(this).val(formattedInput); // Обновляем значение поля ввода
});

logAllValues();
updateFinals();
updateBookDateState();
});