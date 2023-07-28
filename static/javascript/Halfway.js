var map;
function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정 (서울)
        zoom: 12, // 확대/축소 레벨
    });
}
initMap();

// --------------------------------인풋필드 설정 ----------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    // 출발지점 추가 버튼 클릭 시 실행
    document.querySelector(".add-address").addEventListener("click", function () {
        // 버튼을 눌렀을 때 늘어날 인풋필드 html코드
        var addressInput =
            '<div class="input-group mt-2">' +
            `<input id="address-input" type="text" class="form-control" name="address[]" placeholder="출발지점을 입력하세요.">` +
            '<div class="input-group-append">' +
            '<button class="btn btn-danger remove-address" type="button">삭제</button>' +
            "</div>" +
            "</div>";
        document.querySelector("#address-container").insertAdjacentHTML("beforeend", addressInput);

        // input이 추가됐을 때 삭제 버튼을 활성화
        var removeButtons = document.querySelectorAll(".remove-address");
        removeButtons[removeButtons.length - 1].addEventListener("click", removeAddress);

        // 모든 input 요소에 주소 자동 완성 기능 활성화
        const addressInputs = document.querySelectorAll('input[name="address[]"]');
        addressInputs.forEach(function (input) {
            autocomplete = new google.maps.places.Autocomplete(input);
        });
    });

    // 삭제 버튼을 눌렀을 때 실행
    function removeAddress() {
        var parentInputGroup = this.closest(".input-group");
        parentInputGroup.parentNode.removeChild(parentInputGroup);
    }

    // 기존에 있던 삭제 버튼을 활성화
    var removeButtons = document.querySelectorAll(".remove-address");
    removeButtons.forEach(function (button) {
        button.addEventListener("click", removeAddress);
    });
});

//-----------------------------------------------주소 자동완성--------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    let autocomplete;
    // 모든 input 요소에 주소 자동 완성 기능 활성화
    const addressInputs = document.querySelectorAll('input[name="address[]"]');
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

//-----------------------------------------------중간지점 찾기 요청--------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const midBtn = document.getElementById("mid_btn"); // 중간지점 찾기 버튼

    // 중간지점 찾기 버튼을 누를 시 실행
    midBtn.addEventListener("click", function handleClick() {
        const inputValues = [];
        const addressInputs = document.querySelectorAll('input[name="address[]"]');

        // 출발지점이 2개 이상인지 검사
        if (addressInputs.length < 2) {
            alert("출발지점이 2개 이상이어야 합니다. 출발지점 추가를 눌러 출발지점을 추가해주세요.");
            return;
        }

        // 출발지점의 주소만 배열에 저장
        addressInputs.forEach(function (input) {
            inputValues.push(input.value);
        });

        // 출발지점이 비어있는지 검사
        if (inputValues.includes("")) {
            alert("출발지점이 입력되지 않았습니다. 빈 출발지점을 삭제하거나 주소를 입력해주세요.");
            return;
        }

        // AJAX 요청을 보내기 위한 작업
        const xhr = new XMLHttpRequest();
        const url = "http://localhost:8080/halfway";

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        // 배열 데이터를 JSON 형식으로 변환하여 요청
        const data = JSON.stringify({ addresses: inputValues });
        xhr.send(data);

        // 서버에 요청한 데이터를 받아옴
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var dynamicMarkers = []; // 마커의 정보를 담을 배열
                var markers = []; // 동적으로 생성한 마커들을 저장할 배열
                var directionsRenderers = []; // 동적으로 생성한 경로를 저장할 배열

                const responseData = JSON.parse(xhr.responseText);
                console.log("받은 데이터:", responseData);

                // 검색할 수 없는 주소일 때 오류처리
                if (responseData.length == 0) {
                    alert("오류가 발생했습니다. 출발지점의 주소가 정확히 입력되어있는지 확인해주세요.");
                    return;
                }

                var midpoint = responseData.midpoint; // 중간지점 위치

                // 지도 초기화
                map = new google.maps.Map(document.getElementById("map"), {
                    center: midpoint,
                    zoom: 11,
                });

                // 길찾기 인스턴스 설정
                directionsService = new google.maps.DirectionsService();
                directionsRenderer = new google.maps.DirectionsRenderer({
                    map: map,
                    suppressMarkers: true,
                });

                // 마커를 동적으로 생성할 함수
                function createMarker(position, title) {
                    return new google.maps.Marker({
                        position: position,
                        map: map,
                        title: title,
                    });
                }

                // 중간지점의 아이콘 변경
                const svgMarker = {
                    path: "M-1.547 12l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM0 0q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
                    fillColor: "blue",
                    fillOpacity: 1,
                    strokeWeight: 0,
                    rotation: 0,
                    scale: 3,
                    anchor: new google.maps.Point(0, 20),
                };

                // 중간지점에 마커 표시
                var markerMid = new google.maps.Marker({
                    position: midpoint,
                    map: map,
                    title: "중간지점",
                    icon: svgMarker,
                });

                // 중간지점을 클릭 시 생성할 메시지
                var infoWindowMid = new google.maps.InfoWindow({
                    content: "중간지점입니다.",
                });

                // 중간지점 클릭 이벤트 설정
                markerMid.addListener("click", function () {
                    infoWindowMid.open(map, markerMid);
                });

                // 동적으로 생성할 마커들의 정보를 배열에 저장
                for (let index = 0; index < responseData.name.length; index++) {
                    dynamicMarkers.push({
                        position: responseData.address[index],
                        title: responseData.name[index],
                        content: "출발지점 입니다.",
                    });
                }

                // 저장된 데이터를 사용해 마커를 생성하고 경로를 생성
                dynamicMarkers.forEach(function (markerInfo) {
                    var colorCode = "#" + Math.round(Math.random() * 0xffffff).toString(16); // 경로에 사용할 색상을 랜덤으로 저장

                    var marker = createMarker(markerInfo.position, markerInfo.title); // 마커를 생성할 위치

                    // 마커 클릭 시 띄울 메시지
                    var infoWindow = new google.maps.InfoWindow({
                        content: "<h4>" + markerInfo.title + "</h4>" + markerInfo.content,
                    });

                    // 마커 클릭 시 이벤트
                    marker.addListener("click", function () {
                        infoWindow.open(map, marker);
                    });

                    markers.push(marker);

                    // 출발지점에서 중간지점까지의 경로를 동적으로 생성하여 지도에 표시
                    const request = {
                        origin: markerInfo.position,
                        destination: midpoint,
                        travelMode: google.maps.TravelMode.TRANSIT,
                    };

                    // 각 출발지점의 경로를 별도의 DirectionsRenderer로 표시
                    var directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: colorCode,
                        },
                    });

                    directionsRenderers.push(directionsRenderer);

                    // 출발지점에서 중간지점까지 경로 생성
                    directionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsRenderer.setDirections(response);
                        } else {
                            alert(markerInfo.title + "에서 중간지점으로 가는 경로를 찾을 수 없습니다: " + status);
                        }
                    });
                });
            }
        };
    });
});
