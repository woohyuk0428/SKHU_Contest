var map;
function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정 (서울)
        zoom: 12, // 확대/축소 레벨
    });
}
initMap();

function search() {
    // 위치 검색 버튼 클릭 시 이벤트 처리
    document.querySelector(".btn").addEventListener("click", function () {
    var input = document.querySelector(".form-control").value;//검색위치
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: input }, function (results, status) {
    if (status == "OK") {
        //지도 초기화
        map.setCenter(results.geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results.geometry.location,
        });
        } else {
            alert("요청을 완료하지 못했습니다. 상태: " + status);
        }
        });
    });
}
       
if("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(
    position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        sendLocation(latitude,longitude);
    },
    error => {

        }
    );
}
else{

}

function sendLocation(){
    const latitude = 37.5665; // 서울
    const longitude = 126.978;

    fetch('/mapping',{method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({latitude,longitude})
    })

    .then(response => response.text())
        .catch(

        )
}

document.getElementById("btn").addEventListener('click',sendLocation);
             
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