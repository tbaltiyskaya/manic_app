$(document).ready(function() {
    var csrftoken = $('input[name="csrfmiddlewaretoken"]').val();
    var selectedServiceMainId = null; // хранит выбранный ID основной услуги
    var selectedAdditionalServiceId = []; // хранит массив выбранных ID дополнительных услуг
    var finalName = 'start';
    var finalPrice = 10000000;
    var finalTime = '1000 ч 10 мин';
    var sended_finals = false;
    let begin_date = ''
    let begin_time = ''
    document.querySelector('.time-chose').style.display = 'none';
    //создаем карточки
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

    //выводим в консоль выбранные значения
    function logAllValues() {
        console.log(`Текущие значения: 
            selectedServiceMainId: ${selectedServiceMainId},
            selectedAdditionalServiceId: ${JSON.stringify(selectedAdditionalServiceId)}`);
    }
    
    //обновляем выбранные услуги
    function updateFinals() {
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
                finalName += ', ';
            }
            finalName += serviceName;
            finalPrice += servicePrice;
            finalTime = addTime(finalTime, serviceTime);
        });

        if (finalName === previousFinalName && finalPrice === previousFinalPrice && finalTime === previousFinalTime) {
            sended_finals = true; // Данные не изменились
        }
        else{
            console.log('данные обновились');
            updateBooking();    //Обновляем возможность записи
            updateBookButtonState(); //Обновляем состояние кнопки записаться 
        }
    }

    //Обновляем возможность записи
    function updateBooking() {
    const bookDateElement = document.querySelector('.time-chose');
    if (selectedServiceMainId === null || selectedAdditionalServiceId.length === 0) {
        bookDateElement.style.display = 'none';
        console.log('закрыт выбор времени');
    }
     else {
        bookDateElement.style.display = 'flex';
        console.log('открыт выбор времени');
        updateSearchState();
    }
    }
    

    //Обновляем состояние кнопки записаться 
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

    //Обновление поиска свободных окошек
    function updateSearchState() {
        if (sended_finals == false){
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
        }
    }

    //Генерация свободных окошек
    function CreateDayElements(url) {
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: function(data) {
                $('#date-block, #time-block').empty();
                begin_date = '';
                begin_time = '';
                console.log(`begin_date: ${begin_date}`);
                console.log(`begin_time: ${begin_time}`);
            
                // Создаем карточки для дней
                data.forEach(function(item) {
                    var dateCard = $('<div>');
                    var dateLink = $('<a>').attr('href', 'javascript:void(0)').data('date', Object.keys(item)[0]);
                    var dateCardInner = $('<div>').addClass('date-card');
                    var dateText = $('<p>').text(formatDate(Object.keys(item)[0]));
                    dateCardInner.append(dateText);
                    dateLink.append(dateCardInner);
                    dateCard.append(dateLink);
                    $('#date-block').append(dateCard);
                });
            
                // Обработчик клика на карточке дня
                $('#date-block').on('click', 'a', function() {
                    var selectedDay = $(this).data('date');
                    begin_date = selectedDay; // Сохраняем выбранный день в переменную begin_date
                    begin_time = '';
                    console.log(`begin_date: ${begin_date}`);
                    updateBookButtonState();
            
                    // Очищаем блок времени
                    $('#time-block').empty();
            
                    // Создаем карточки для времени
                    if (selectedDay !== "") {
                        var options = data.find(item => Object.keys(item)[0] === selectedDay);
                        options[selectedDay].forEach(function(time) {
                            var timeCard = $('<div>');
                            var timeLink = $('<a>').attr('href', 'javascript:void(0)').data('time', time);
                            var timeCardInner = $('<div>').addClass('time-card');
                            var timeText = $('<p>').text(formatTime(time));
                            timeCardInner.append(timeText);
                            timeLink.append(timeCardInner);
                            timeCard.append(timeLink);
                            $('#time-block').append(timeCard);
                        });
                    }
                    updateBookButtonState();
                });
            
                // Обработчик клика на карточке времени
                $('#time-block').on('click', 'a', function() {
                    begin_time = $(this).data('time'); 
                    console.log(`begin_time: ${begin_time}`);
                    updateBookButtonState();
                });
            },
            error: function(xhr, status, error) {
                console.error("Ошибка при загрузке данных:", error);
            }
        });
    }

    // Функция для извлечения часов и минут из строки времени
    function addTime(time1, time2) {
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
    
        let result = '';
        if (finalHours > 0) {
            result += `${finalHours} ч `;
        }
        if (finalMinutes > 0 || finalHours === 0) {
            result += `${finalMinutes} мин`;
        }
    
        return result.trim();
    }
    
    //Функции для читабельного формата даты и времени
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }

    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const formattedHours = Number(hours).toString().padStart(2, '0');
        const formattedMinutes = Number(minutes).toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`;
      }

    //Загрузка карточек услуг
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
    }

    //Загрузка карточек дополнительных услуг
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

    //Вызывыем карточки
    loadAndDisplayServices('/basic_services/', 'main_serv_add');

    // Вызываем карточки доп услуг по клику пользователя
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
        updateFinals();
    });


    // Нажата кнопка записаться
    $('#book-btn').on('click', function() {
        console.log('кнопка нажата');
        document.querySelector('#form-begin').textContent = `Вы записаны на услуги: ${finalName}, на ${begin_date} в ${begin_time}.`;
        document.querySelector('#form-final-price').textContent = `Стоимость: ${finalPrice}₽`;
        document.querySelector('#form-final-time').textContent = `Длительность: ${finalTime}`;

        // Создаем overlay и добавляем его к body
        var overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);

        document.getElementById('modal').style.display = 'block';
    });

    //Обновление состояния кнопки отправить
    function updateSubmitButtonState(isSent){
        var submitBtn = document.getElementById('submit-btn');
        if (submitBtn && isSent) {
            submitBtn.querySelector('p').textContent = 'Успешно';
            submitBtn.disabled = true;
            document.getElementById('contactForm').reset();
            var modal = document.getElementById('modal');
            //var overlay = document.querySelector('.overlay');
            document.getElementById('modal').style.display = 'none';
            //document.body.removeChild(overlay);

            var successModal = document.getElementById('success');
            successModal.style.display = 'block';
            setTimeout(() => {
                successModal.style.display = 'none';
                // Перезагружаем страницу
                window.location.reload();
            }, 3000);
        }
        else{
            submitBtn.querySelector('p').textContent = 'Подтвердить запись';
            submitBtn.disabled = false;
        }
    }

    // Обработчики закрытия окна с формой 
    document.getElementsByClassName('close')[0].onclick = function() {
        document.getElementById('contactForm').reset();
        updateSubmitButtonState(false);
        var modal = document.getElementById('modal');
        var overlay = document.querySelector('.overlay');
        document.getElementById('modal').style.display = 'none';
        document.body.removeChild(overlay);
    }

    window.onclick = function(event) {
        if (event.target == document.getElementById('modal')) {
            document.getElementById('contactForm').reset();
            updateSubmitButtonState(false);
            var modal = document.getElementById('modal');
            var overlay = document.querySelector('.overlay');
            document.getElementById('modal').style.display = 'none';
            document.body.removeChild(overlay);
        }
    }

    //Отправка формы на сервер
    document.getElementById('contactForm').addEventListener('submit', function(event) {
        var fields = this.querySelectorAll('input, textarea');
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].value.trim() === '') {
                alert('Пожалуйста, заполните все поля');
                event.preventDefault();
                return;
            }
        }
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

    //Обработчик номера телефона
    $('#phone').on('input', function() {
        let input = $(this).val().replace(/\D/g, ''); // Удаляем все нецифровые символы
        if (input.length > 11) {
            input = input.slice(0, 11); // Ограничиваем длину до 11 цифр
        }

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
updateBooking();
});