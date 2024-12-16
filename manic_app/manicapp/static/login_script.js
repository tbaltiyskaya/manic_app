$(function() {
    var csrftoken = $('input[name="csrfmiddlewaretoken"]').val();
    $('#sign_in_form').on('submit', function(event) {
        event.preventDefault();
        var formData = {
            login: $('#text').val(),
            password: $('#password').val()
        };
        console.log(formData);
        $.ajax({
            url: '/show_account/',
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(formData),
            success: function(response) {
                console.log('Успех:', response);
                window.location.href = redirectUrl;
            },
            error: function(error) {
                alert('Ошибка при отправке данных.'); // Уведомление об ошибке
            }
        });
    });
});