var map;
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정 (서울)
        zoom: 12, // 확대/축소 레벨
    });
}
initMap();

document.addEventListener("DOMContentLoaded", function () {
    button = document.getElementById("btn");

    button.addEventListener("click", function () {
        // 위치 검색 버튼 클릭 시 이벤트 처리
        var input = document.querySelector(".form-control").value; //검색위치
        var geocoder = new google.maps.Geocoder();
        var map;

        geocoder.geocode({ address: input }, function (results, status) {
            var location = results[0].geometry.location; //todo 위도 경도값을 변수에 저장합니다.

            if (status == "OK") {
                //지도 초기화
                if (map) {
                    map.setMap(null);
                }

                map = new google.maps.Map(document.getElementById("map"), {
                    center: location,
                    zoom: 11,
                });

                var marker = new google.maps.Marker({
                    map: map,
                    position: location,
                });
            } else {
                alert("요청을 완료하지 못했습니다. 상태: " + status);
            }
        });
    });
});

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            sendLocation(latitude, longitude);
        },
        (error) => {}
    );
} else {
}

var results_data;
function sendLocation() {
    const latitude = 37.5665; // 서울
    const longitude = 126.978;

    console.log("실행");
    fetch("/mapping", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
    })
        .then((response) => response.text())
        .then((data) => {
            console.log(data);
            results_data = JSON.parse(data); //todo 서버에서 보낸 데이터를 일단 임시로 저장합니다.
        })
        .catch();
}

document.getElementById("btn").addEventListener("click", sendLocation);

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
});
