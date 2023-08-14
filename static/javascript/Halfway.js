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

var placeMarkers = []; // 동적으로 생성한 마커들을 저장할 배열
var responseData_place;
//-----------------------------------------------중간지점 찾기 요청--------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const midBtn = document.getElementById("mid_btn"); // 중간지점 찾기 버튼

    const iconList = ["start", "mid", "cafe", "convenience_store", "library", "bus_station", "subway_station", "restaurant"];
    var marker_iconList = {};
    iconList.forEach((data) => {
        const icon = {
            url: `${data}_icon.png`,
            scaledSize: new google.maps.Size(40, 40), // 이미지 크기 조정
        };
        marker_iconList[data] = icon;
    });

    // 중간지점 찾기 버튼을 누를 시 실행
    midBtn.addEventListener("click", function handleClick() {
        const inputValues = [];
        const addressInputs = document.querySelectorAll('input[name="address[]"]');
        const rangeValue = document.getElementById("rangeSlider").value;

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
        const data = JSON.stringify({ addresses: inputValues, range: rangeValue });
        xhr.send(data);

        // 서버에 요청한 데이터를 받아옴
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                var dynamicMarkers = []; // 마커의 정보를 담을 배열
                var markers = []; // 동적으로 생성한 마커들을 저장할 배열
                var directionsRenderers = []; // 동적으로 생성한 경로를 저장할 배열

                const responseData = JSON.parse(xhr.responseText);
                responseData_place = responseData.midplaces;
                console.log("받은 데이터:", responseData);

                // 검색할 수 없는 주소일 때 오류처리
                if (responseData.length == 0) {
                    alert("오류가 발생했습니다. 출발지점의 주소가 정확히 입력되어있는지 확인해주세요.");
                    return;
                }

                var midpoint = responseData.midpoint.address; // 중간지점 위치

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
                function createMarker(position, title, icon, tags, data) {
                    const markerOptions = {
                        position: position,
                        map: map,
                        title: title,
                        icon: icon,
                        tags: tags,
                    };

                    if (data) {
                        markerOptions["data"] = data;
                    }
                    return new google.maps.Marker(markerOptions);
                }

                const placetypes = ["cafe", "convenience_store", "library", "bus_station", "subway_station", "restaurant"];
                placetypes.forEach((placename) => {
                    responseData.midplaces[placename].forEach((placeinfo) => {
                        var contents_name = `<h5>${placeinfo.name}</h5><br>`;
                        var contents_maintext = `
                        <hr><p>검색 태그: ${placename} (${placeinfo.index})</p>
                        <p>점포 id: ${placeinfo.id}</p>
                        <p>주소: ${placeinfo.vicinity}</p>
                        <p>영업 여부: ${placeinfo.opening}</p>
                        <p>태그: ${placeinfo.types}</p>
                        <p>평점: ${placeinfo.rating}</p>`;

                        if (placename === "subway_station") {
                            contents_maintext += '<h6><a href="/Post">지하철 정보 검색 페이지로 이동하시겠습니까?</a></h6>';
                        }

                        var P_marker = createMarker(placeinfo.address, placeinfo.name, marker_iconList[placename], placename, { get_image: false }); // 마커를 생성할 위치

                        // 마커 클릭 시 띄울 메시지
                        var P_infoWindow = new google.maps.InfoWindow({
                            content: contents_name + contents_maintext,
                        });

                        // 마커 클릭 시 이벤트
                        P_marker.addListener("click", async function () {
                            if (this.data.get_image) {
                                P_infoWindow.open(map, P_marker);
                            } else {
                                const photoUrl = await fetchPlacePhoto(placeinfo.id);
                                const contentWithImage = `<img src="${photoUrl}" alt="대표 사진" width="300">`;

                                P_infoWindow.setContent(contents_name + contentWithImage + contents_maintext);
                                P_infoWindow.open(map, P_marker);
                                this.data.get_image = true;
                            }
                        });

                        P_marker.setVisible(false); // 생성한 마커를 숨겨둠
                        placeMarkers.push(P_marker);
                    });
                });

                // 동적으로 생성할 마커들의 정보를 배열에 저장
                responseData.startpoint.forEach((data) => {
                    dynamicMarkers.push({
                        position: data.address,
                        title: data.name,
                        content: "출발지점 입니다.",
                        icon: marker_iconList.start,
                        tags: "start",
                    });
                });

                var response_data;
                var midcontent = "";
                var travelTime_count = 1;
                // 저장된 데이터를 사용해 마커를 생성하고 경로를 생성
                dynamicMarkers.forEach(function (markerInfo, index) {
                    var colorCode = "#" + Math.round(Math.random() * 0xffffff).toString(16); // 경로에 사용할 색상을 랜덤으로 저장

                    var marker = createMarker(markerInfo.position, markerInfo.title, markerInfo.icon, markerInfo.tags); // 마커를 생성할 위치

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
                            // 경로 결과에서 필요한 데이터 추출
                            response_data = response.routes[0].legs[0];

                            const contents_info = `<p>출발 시간: ${response_data.departure_time.text}</p>
                            <p>도착 시간: ${response_data.arrival_time.text}</p>
                            <p>이동 거리: ${response_data.distance.text}</p>
                            <p>이동 시간: ${response_data.duration.text}</p>`;

                            // 마커 클릭 시 띄울 메시지
                            var infoWindow = new google.maps.InfoWindow({
                                content: `<h5>${markerInfo.title}</h5>
                                <p>사용자님이 검색하신 ${markerInfo.content}</p><hr>
                                ${contents_info}`,
                            });

                            midcontent += `<br><p>${travelTime_count++}. ${markerInfo.title}</p><br> ${contents_info} <br><hr>`;

                            // 마커 클릭 시 이벤트
                            marker.addListener("click", function () {
                                infoWindow.open(map, marker);
                            });

                            markers.push(marker);
                            directionsRenderer.setDirections(response);
                        } else {
                            alert(markerInfo.title + "에서 중간지점으로 가는 경로를 찾을 수 없습니다: " + status);
                        }
                    });
                });

                // 중간지점에 마커 표시
                var markerMid = new google.maps.Marker({
                    position: midpoint,
                    map: map,
                    title: responseData.midpoint.name,
                    icon: marker_iconList.mid,
                    tags: "mid",
                });

                // 중간지점을 클릭 시 생성할 메시지
                const midcontent_name = `<h5>${responseData.midpoint.name}</h5>
                <p>중간지점입니다.</p><hr>`;
                var infoWindowMid = new google.maps.InfoWindow({
                    content: midcontent_name,
                });

                // 중간지점 클릭 이벤트 설정
                markerMid.addListener("click", function () {
                    infoWindowMid.setContent(midcontent_name + midcontent);
                    infoWindowMid.open(map, markerMid);
                });
            }
        };
    });

    // 대표 사진을 가져오는 함수
    async function fetchPlacePhoto(placeId) {
        try {
            const response = await fetch(`http://localhost:8080/Halfway/PlacePhoto?placeId=${placeId}`);
            const data = await response.json();

            if (response.ok) {
                return data.photoUrl;
            } else {
                return "image_error.png";
            }
        } catch (error) {
            throw new Error(`에러 발생: ${error}`);
        }
    }
});

//------------------------- 장소 검색 버튼 이벤트 처리 --------------------------------'
document.addEventListener("DOMContentLoaded", function () {
    const labels = document.querySelectorAll(".radio-label");

    const resetButton = document.querySelector(".reset-button");
    const radioLabels = document.querySelectorAll(".radio-label input[type='radio']");

    resetButton.addEventListener("click", function () {
        radioLabels.forEach((radio) => {
            radio.checked = false; // 선택 해제
        });
        placeMarkers.forEach(function (marker) {
            marker.setVisible(false);
        });
        labels.forEach((label) => {
            label.classList.remove("selected");
        });
    });

    labels.forEach((label) => {
        label.addEventListener("click", function (event) {
            if (event.target.tagName === "INPUT" && event.target.type === "radio") {
                labels.forEach((lbl) => {
                    lbl.classList.remove("selected");
                });

                this.classList.add("selected");

                const selectedValue = this.querySelector("input[type='radio']").value;
                if (responseData_place[selectedValue].length == 0) {
                    alert(`${selectedValue}에 대한 정보가 없습니다.`);
                }
                placeMarkers.forEach(function (marker) {
                    if (marker.tags.includes(selectedValue)) {
                        marker.setVisible(true);
                    } else {
                        marker.setVisible(false);
                    }
                });
            }
        });
    });
});

//------------
document.addEventListener("DOMContentLoaded", function () {
    const rangeSlider = document.getElementById("rangeSlider");
    const sliderValue = document.getElementById("sliderValue");
    rangeSlider.addEventListener("input", function () {
        sliderValue.textContent = `${rangeSlider.value}미터`;
    });
});
