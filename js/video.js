/*global TelehealthEdu _config*/

var TelehealthEdu = window.TelehealthEdu || {};

(function videoScopeWrapper($) {
    var authToken;
    TelehealthEdu.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestVideoURL(name) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/video',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                Name: name
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting video: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when requesting your video:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var video;
        console.log('Response received from API: ', result);
        video = result.Video;
        displayUpdate(video.Name + ' URL is ' + video.URL);
        console.log($('#video-frame'))
        $('#video-frame')[0].src = video.URL;
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);

        TelehealthEdu.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
    }

    function handleRequestClick(event) {
        console.log($('#video-name'))
        var videoName = $('#video-name')[0].value
        event.preventDefault();
        requestVideoURL(videoName);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
