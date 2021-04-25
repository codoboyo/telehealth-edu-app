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
//        var pronoun;
        console.log('Response received from API: ', result);
        video = result.Video;
        displayUpdate(video.Name + ', URL is ' + video.URL);
        animateArrival(function animateCallback() {
            displayUpdate(video.Name + ' was found');
//            TelehealthEdu.map.unsetLocation();
//            $('#request').prop('disabled', 'disabled');
//            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
//        $(TelehealthEdu.map).on('pickupChange', handlePickupChanged);

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
        requestButton.text('Request Video');
//        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
//        var pickupLocation = TelehealthEdu.map.selectedPoint;
        var videoName = $('#video-name').value
        event.preventDefault();
        requestVideoURL(videoName);
    }

    function animateArrival(callback) {
//        var dest = TelehealthEdu.map.selectedPoint;
//        var origin = {};
//
//        if (dest.latitude > TelehealthEdu.map.center.latitude) {
//            origin.latitude = TelehealthEdu.map.extent.minLat;
//        } else {
//            origin.latitude = TelehealthEdu.map.extent.maxLat;
//        }
//
//        if (dest.longitude > TelehealthEdu.map.center.longitude) {
//            origin.longitude = TelehealthEdu.map.extent.minLng;
//        } else {
//            origin.longitude = TelehealthEdu.map.extent.maxLng;
//        }
//
//        TelehealthEdu.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
