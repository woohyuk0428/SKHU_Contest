var data;
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            data = { lat: latitude, lng: longitude };

            sendLocation(latitude, longitude).then((data) => {
                initMap(data);
            });
        },
        (error) => {}
    );
} else {
}

function sendLocation(latitude, longitude) {
    console.log("실행");
    return fetch("/mapping", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            return data;
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

var map;
var marker;
var infoWindow;

function initMap(data) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: data,
        zoom: 12,
    });

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    // 정보창 생성
    infoWindow = new google.maps.InfoWindow();

    // 마커 생성
    marker = new google.maps.Marker({
        map: map,
        position: data,
        title: "현재위치",
    });

    // 마커를 클릭했을 때 정보창 열기
    marker.addListener("click", function () {
        getAddress(data, function (address) {
            infoWindow.setContent("현재 주소: " + address);
            infoWindow.open(map, marker);
        });
    });
}

// 경위도 좌표를 주소로 변환하는 함수
function getAddress(latlng, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latlng }, function (results, status) {
        if (status === "OK") {
            if (results[0]) {
                callback(results[0].formatted_address);
            } else {
                callback("주소를 찾을 수 없습니다.");
            }
        } else {
            callback("주소 변환에 실패했습니다. 상태: " + status);
        }
    });
}

var colorCode = "#" + Math.round(Math.random() * 0xffffff).toString(16); // 경로에 사용할 색상을 랜덤으로 저장

document.addEventListener("DOMContentLoaded", function () {
    let autocomplete;
    // 모든 input 요소에 주소 자동 완성 기능 활성화
    const addressInputs = document.querySelectorAll('input[name="address"]');
    addressInputs.forEach(function (input) {
        autocomplete = new google.maps.places.Autocomplete(input);
    });

    function ins() {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            alert("유효한 주소를 선택해주세요.");
            return;
        }
    }

    // 주소를 선택했을 때 이벤트 처리
    autocomplete.addListener("place_changed", ins);

    button = document.getElementById("btn");

    button.addEventListener("click", function () {
        // 위치 검색 버튼 클릭 시 이벤트 처리

        var input = document.querySelector(".form-control").value; //검색위치
        var geocoder = new google.maps.Geocoder();
        var map;
        var directionsRenderers = [];

        geocoder.geocode({ address: input }, function (results, status) {
            var location = results[0].geometry.location; //todo 위도 경도값을 변수에 저장합니다.

            if (status == "OK") {
                //지도 초기화
                if (map) {
                    map.setMap(null);
                }

                map = new google.maps.Map(document.getElementById("map"), {
                    center: location,
                    zoom: 13,
                });

                var marker = new google.maps.Marker({
                    map: map,
                    position: location,
                });

                // 마커를 클릭했을 때 정보창 열기
                marker.addListener("click", function () {
                    getAddress(location, function (address) {
                        infoWindow.setContent("현재 주소: " + address);
                        infoWindow.open(map, marker);
                    });
                });

                // 출발지점에서 목적지까지의 경로표시
                const request = {
                    origin: data,
                    destination: location,
                    travelMode: google.maps.TravelMode.TRANSIT,
                };

                var directionsRenderer = new google.maps.DirectionsRenderer({
                    map: map,
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeColor: colorCode,
                    },
                });

                directionsRenderers.push(directionsRenderer);

                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsRenderer.setDirections(response);
                    } else {
                        alert(markerInfo.title + " 경로를 찾을 수 없습니다: " + status);
                    }
                });
            } else {
                alert("요청을 완료하지 못했습니다. 상태: " + status);
            }
        });
    });
});
