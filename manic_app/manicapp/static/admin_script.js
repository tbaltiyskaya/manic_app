document.addEventListener("DOMContentLoaded", function() {
    var csrftoken = $('input[name="csrfmiddlewaretoken"]').val();
    const today = new Date;
    console.log(today);
    const formattedDate = today.toISOString().split('T')[0];
    let isCreateButtonClicked = true;
    let isDropButtonClicked = true;
    updateButtonStates();
    checkDay();
    selectedDate = formattedDate;
    createDateSelect();
    
    
    function createDateSelect() {
        const select = document.getElementById('chose-show-date');
        const today = new Date();

        for (let i = -7; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const formattedDate = date.toISOString().split('T')[0];

            const option = document.createElement('option');
            option.value = formattedDate; // Значение опции
            option.textContent = formattedDate; // Текст опции
            select.appendChild(option);
        }
        // Добавляем обработчик события change
        select.addEventListener('change', function() {
            selectedDate = select.value; // Записываем выбранное значение в переменную
            showSchedule(selectedDate);
            console.log('Выбранная дата:', selectedDate); // Выводим в консоль
        });
    }

    function showSchedule(selectedDate){
        console.log('функция вызвана');
        fetch('/show_day_schedule/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ date: selectedDate })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            createTableFromJSON(data);
            console.log('таблица создана');
        })
        .catch(error => console.error('Error:', error));
    }

    function createTableFromJSON(data) {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        //Заголовок таблицы
        const headerRow = tbody.insertRow();
        const headers = ['Имя', 'Услуга', 'Стоимость', 'Начало', 'Конец'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        //Строки с данными
        data.forEach(item => {
                const row = tbody.insertRow();
                const values = [item.client_name, item.total_name, item.total_price, item.begin, item.end];
                values.forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    row.appendChild(td);
                });
            });
    }

    //Проверяем день недели
    function checkDay(){
        if(today.getDay() === 0){
           getCreatedButtonStatus();
           isDropButtonClicked = true;
     }
     else if(today.getDay() === 1){
            getDroppedButtonStatus();
            isCreateButtonClicked = true;
     }
   }

    //Обновление состояния кнопок
    function updateButtonStates() {
        document.getElementById("btn-create-dates").disabled = isCreateButtonClicked;
        document.getElementById("btn-drop-dates").disabled = isDropButtonClicked;
        updateCreateDatesButton();
        updateDeleteDatesButton();
    }

    //Текст кнопок в зависимости от доступности
    function updateCreateDatesButton() {
        if (document.getElementById("btn-create-dates").disabled) {
            document.querySelector('#btn-create-dates p').textContent = 'Недоступно. Возвращайтесь в ближайшее воскресенье';
        } else {
            document.querySelector('#btn-create-dates p').textContent = 'Создать';
        }
    }
    function updateDeleteDatesButton() {
        if (document.getElementById("btn-drop-dates").disabled) {
            document.querySelector('#btn-drop-dates p').textContent = 'Недоступно. Возвращайтесь в ближайший понедельник';
        } else {
            document.querySelector('#btn-drop-dates p').textContent = 'Удалить';
        }
    }

    //Была ли нажата кнопка создать сегодня
    function getCreatedButtonStatus(){
        var dataToSend = {
            date: formattedDate
        };
        $.ajax({
            url: '/check_status_dates_created/',
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(dataToSend),
            success: function(data) {
                console.log(data);
                // Если created: false, кнопка будет доступна
                isCreateButtonClicked = data.created; 
                updateButtonStates();
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            }
        });

    }

    //Была ли нажата кнопка удалить сегодня
    function getDroppedButtonStatus(){
        var dataToSend = {
            date: formattedDate
        };
        $.ajax({
            url: '/check_status_dates_deleted/',
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(dataToSend),
            success: function(data) {
                console.log(data);
                isDropButtonClicked = data.created;
                updateButtonStates();
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            }
        });
    }

    //Создать записи 
    $('#btn-create-dates').on('click', function(e) {
        e.preventDefault();
        var dataToSend = {
            date: formattedDate
        };
        $.ajax({
            url: '/create_free_dates/',
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(dataToSend),
            success: function(data) {
                console.log(data);
                isCreateButtonClicked = data.created;
                getCreatedButtonStatus();
                updateButtonStates();
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            }
        });
    });

    //Удалить записи
    $('#btn-drop-dates').on('click', function(e) {
        e.preventDefault();
        var dataToSend = {
            date: formattedDate
        };
        $.ajax({
            url: '/delete_last_dates/',
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(dataToSend),
            success: function(data) {
                console.log(data);
                isDropButtonClicked = data.created;
                getDroppedButtonStatus();
                updateButtonStates();
            },
            error: function(xhr, status, error) {
                console.log(xhr.responseText);
            }
        });
    });

});