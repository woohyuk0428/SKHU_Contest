// const inputContainer = document.querySelector("#address-container"); // input이 들어갈 컨테이너 위치
// const addressFunctions = new InputAddressFunctions(inputContainer);

// const rangeSlider = document.getElementById("rangeSlider"); // 슬라이더 위치
// const sliderValue = document.getElementById("sliderValue"); // 슬라이더 값을 표시할 위치

const marker_iconList = CreateIcon(); // 아이콘을 리스트에 저장
let placeMarkers = []; // 동적으로 생성한 마커들을 저장할 배열
let responseData_place; // 근처 장소들에 대한 json데이터를 저장
let Mydata;

//! ------------------------------- 지도 초기화 ---------------------------------------
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            Mydata = { lat: latitude, lng: longitude };

            sendLocation(latitude, longitude).then((data) => {
                CreateMap(Mydata);
            });
        },
        (error) => {}
    );
}

document.addEventListener("DOMContentLoaded", function () {
    //! ------------------------------- 주소 입력 필드 관련 이벤트 ---------------------------------------
    const addressInputs = document.querySelectorAll('input[name="address"]'); // 주소 입력폼

    // 모든 input 요소에 주소 자동 완성 기능 활성화
    addressInputs.forEach(function (input) {
        new google.maps.places.Autocomplete(input);
    });

    //! ------------------------------- 상단 필터 관련 이벤트 ---------------------------------------
    const resetButton = document.querySelector(".reset-button"); // 초기화 버튼

    // 이미지 클릭 시 입력 내용 삭제 함수
    function deleteInputText() {
        var inputElement = document.getElementById("textInput");
        inputElement.value = "";
    }
    // 이미지를 클릭할 때 deleteInputText 함수 호출
    var imageElement = document.getElementById("reset-button");
    imageElement.addEventListener("click", deleteInputText);

    const radioLabels = document.querySelectorAll(".radio-label input[type='radio']"); // 주변 장소 필터버튼 선택

    // resetButton.addEventListener("click", () => {
    //     resetRadioSelection(radioLabels);
    // }); // 초기화 버튼 실행

    // 라디오 버튼들에 대해 클릭 이벤트 리스너 추가
    radioLabels.forEach((radio) => {
        radio.addEventListener("click", handleRadioClick);
    });

    // 슬라이더 값 변경
    // rangeSlider.addEventListener("input", function () {
    //     sliderValue.textContent = `${rangeSlider.value}미터`;
    // });

    //! ------------------------------- 경로 정보 삭제 관련 이벤트 ---------------------------------------
    const AdrOffBtn = document.getElementById("addressInfoOff"); // 경로 정보 끄기 버튼
    const AdrOnBtn = document.getElementById("addressInfoOn"); // 경로 정보 표시 버튼

    // // 경로 정보 끄기
    // AdrOffBtn.addEventListener("click", () => {
    //     AdrInfo_OnOff("off");
    // });

    // // 경로 정보 표시
    // AdrOnBtn.addEventListener("click", () => {
    //     AdrInfo_OnOff("on");
    // });

    //! ------------------------------- 중간지점 찾기 관련 이벤트 ---------------------------------------
    // 중간지점 찾기 버튼을 누를 시 실행
    const Btn = document.getElementById("btn"); // 중간지점 찾기 버튼

    // 중간지점 찾기 버튼 클릭 시 실행되는 핸들러
    Btn.addEventListener("click", () => {
        MappingSearch(marker_iconList, Mydata);
    });
});

//! ------------------------------- 지도 초기화 ---------------------------------------
function CreateMap(address) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: address, // 초기 위치 설정
        zoom: 14, // 확대/축소 레벨
    });

    infoWindow = new google.maps.InfoWindow();

    marker = new google.maps.Marker({
        map: map,
        position: address,
        title: "현재위치",
    });

    // 마커를 클릭했을 때 정보창 열기
    marker.addListener("click", function () {
        getAddress(address, function (address) {
            infoWindow.setContent("현재 주소: " + address);
            infoWindow.open(map, marker);
        });
    });

    return map;
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

//본인 위치의 위도 경도 구하는 함수
function sendLocation(latitude, longitude) {
    return fetch("/mapping", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
    })
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

//! ------------------------------- 주소 입력 필드 관련 함수 ---------------------------------------
// 주소 자동 완성 기능 활성화
function activateAutoAddress() {
    const addressInputs = document.querySelectorAll('input[name="address"]');
    new google.maps.places.Autocomplete(addressInputs[addressInputs.length - 1]);
}

//! ------------------------------- 상단 필터 관련 함수 ---------------------------------------
// 버튼 선택을 초기화하는 함수
function resetRadioSelection(radioLabels) {
    // 모든 버튼 선택 해제
    console.log(radioLabels);
    radioLabels.forEach((radio) => {
        radio.checked = false;
    });
    // 주변 장소 마커들을 안보이게 함
    placeMarkers.forEach((marker) => {
        marker.setVisible(false);
    });
    // 라벨에서 선택된 클래스 제거
    removeSelectedClassFromLabels();
}

// 라디오 버튼 클릭 이벤트를 처리하는 함수
function handleRadioClick(event) {
    if (event.target.tagName === "INPUT" && event.target.type === "radio") {
        const selectedValue = this.value;
        console.log(selectedValue);
        removeSelectedClassFromLabels(); // 선택된 버튼 제거
        this.closest(".radio-label").classList.add("selected"); // 누른 버튼에 클래스 추가

        responseData_place[selectedValue].length === 0 ? alert(`주변에 ${selectedValue}이(가) 없습니다.`) : null; // 해당하는 정보가 없을 경우 실행

        // 마커의 태그에 선택한 값이 포함되어 있으면 보이게 설정
        placeMarkers.forEach((marker) => {
            marker.setVisible(marker.tags.includes(selectedValue));
        });
    }
}

// 버튼 클래스 중 "selected"를 제거하는 함수 (선택된 버튼 초기화)
function removeSelectedClassFromLabels() {
    document.querySelectorAll(".radio-label").forEach((label) => {
        label.classList.remove("selected");
    });
}

//! ------------------------------- 경로 정보 삭제 관련 함수 ---------------------------------------
// 경로 정보가 들어있는 요소를 찾아 on off를 해주는 함수
function AdrInfo_OnOff(onoff) {
    var Ladr = document.querySelectorAll('img[src="https://maps.gstatic.com/mapfiles/tiph.png"]');
    var Radr = document.querySelectorAll('img[src="https://maps.gstatic.com/mapfiles/tip.png"]');

    if (onoff == "on") {
        AdrInfoFor(Ladr, "block");
        AdrInfoFor(Radr, "block");
    } else {
        AdrInfoFor(Ladr, "none");
        AdrInfoFor(Radr, "none");
    }
}

// 가져온 이미지 정보의 부모요소에 display를 수정하는 함수
function AdrInfoFor(adrs, displayInfo) {
    adrs.forEach(function (adr) {
        if (adr.parentNode && adr.parentNode.tagName === "DIV") {
            adr.parentNode.style.display = displayInfo;
        }
    });
}

//! ------------------------------- 중간지점 찾기 관련 함수 ---------------------------------------
// 중간지점 버튼 클릭 시 실행되는 함수
function MappingSearch(marker_iconList, Mydata) {
    // const rangeValue = 300;
    const inputValues = document.querySelector('input[name="address"]').value; // 인풋폼 저장
    const url = "http://localhost:8080/Mapping/data"; // ajax요청 url
    let sendData = "";

    // 서버로 AJAX 요청을 보내기 위한 작업
    sendData = JSON.stringify({ startpoint: Mydata, addresses: inputValues, range: 300 });
    console.log(sendData);
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=UTF-8",
        },
        body: sendData,
    })
        .then(async (response) => {
            console.log(response.ok);
            if (!response.ok) {
                throw new Error("오류가 발생했습니다.");
            }
            return response.json();
        })
        .then(async (responseData) => {
            console.log("받은 데이터:", responseData);

            // 검색할 수 없는 주소일 때 오류처리
            if (responseData == null) {
                alert("오류가 발생했습니다. 출발지점의 주소가 정확히 입력되어있는지 확인해주세요.");
                return;
            }

            // 동적으로 생성할 마커들의 정보를 배열에 저장
            let dynamicMarkers = [
                {
                    position: responseData.startpoint.address,
                    title: responseData.startpoint.name,
                    content: "출발지점 입니다.",
                    icon: marker_iconList.start,
                    tags: "start",
                },
            ];

            const directionsService = new google.maps.DirectionsService(); // 길찾기 서비스 인스턴스 생성
            const endpoint = responseData.endpoint[0].address; // 중간지점 위치
            const map = CreateMap(endpoint); // 지도 초기화
            responseData_place = responseData.places; // 중간지점 근처 장소 데이터 전역변수에 저장
            placeMarkers = await createPlaceMarkers(map, responseData, marker_iconList);

            // 길찾기 인스턴스 설정
            new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: true,
            });

            (function () {
                let midcontent = "";

                const markerPromises = dynamicMarkers.map(function (markerInfo, index) {
                    return new Promise(function (resolve, reject) {
                        const colorCode = "#" + Math.round(Math.random() * 0xffffff).toString(16); // 경로 랜덤 색깔
                        const marker = createMarker(markerInfo.position, map, markerInfo.title, markerInfo.icon, markerInfo.tags); // 시작지점 마커 생성

                        // 길찾기 옵션 설정
                        const request = {
                            origin: markerInfo.position,
                            destination: endpoint,
                            travelMode: google.maps.TravelMode.TRANSIT,
                        };
                        console.log(request);
                        // 길찾기 옵션 설정
                        const directionsRenderer = new google.maps.DirectionsRenderer({
                            map,
                            suppressMarkers: true,
                            polylineOptions: {
                                strokeColor: colorCode,
                            },
                        });

                        // 경로 찾기
                        directionsService.route(request, function (response, status) {
                            if (status == google.maps.DirectionsStatus.OK) {
                                const contents_info = `
                                <p>출발 시간: ${response.routes[0].legs[0].departure_time.text}</p>
                                <p>도착 시간: ${response.routes[0].legs[0].arrival_time.text}</p>
                                <p>이동 거리: ${response.routes[0].legs[0].distance.text}</p>
                                <p>이동 시간: ${response.routes[0].legs[0].duration.text}</p>`;
                                midcontent += `<br><p>${index + 1}. ${markerInfo.title}</p><br> ${contents_info} <br><hr>`; //  MID마커에 표시될 데이터 저장

                                createRoute(contents_info, response, markerInfo, map, marker, directionsRenderer); // 경로 생성
                                resolve(); // 비동기 작업 완료
                            } else {
                                reject(new Error(markerInfo.title + "에서 중간지점으로 가는 경로를 찾을 수 없습니다: " + status));
                            }
                        });
                    });
                });

                // 모든 비동기 작업이 완료되길 기다림
                Promise.all(markerPromises)
                    .then(function () {
                        createEndMarkers(responseData, endpoint, map, marker_iconList, midcontent); // 중간지점 마커 생성
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            })();
        })
        .catch((error) => {
            console.error("fetch 작업 중 문제가 발생했습니다:", error);
        });
}

// 시작할 때 마커에 들어갈 아이콘을 생성하는 함수
function CreateIcon() {
    const iconList = ["start", "mid", "cafe", "convenience_store", "library", "bus_station", "subway_station", "restaurant"];
    var isIconList = {};

    iconList.forEach((data) => {
        const icon = {
            url: `${data}_icon.png`,
            scaledSize: new google.maps.Size(40, 40), // 이미지 크기 조정
        };
        isIconList[data] = icon;
    });
    return isIconList;
}

// 마커를 동적으로 생성할 함수
function createMarker(position, map, title, icon, tags, data) {
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

// 중간지점 근처 장소 마커 생성 함수
async function createPlaceMarkers(map, responseData, iconList) {
    const placetypes = ["cafe", "convenience_store", "library", "bus_station", "subway_station", "restaurant"]; // 검색할 장소 타입
    const placeMarkers = []; // 동적으로 생성된 마커가 들어갈 배열

    for (const placename of placetypes) {
        for (const placeinfo of responseData.places[placename]) {
            const contentsName = `<h5>${placeinfo.name}</h5><br>`;
            let contentsMaintext = `
                <hr><p>검색 태그: ${placename} (${placeinfo.index})</p>
                <p>점포 id: ${placeinfo.id}</p>
                <p>주소: ${placeinfo.vicinity}</p>
                <p>영업 여부: ${placeinfo.opening}</p>
                <p>태그: ${placeinfo.types}</p>
                <p>평점: ${placeinfo.rating}</p>`;

            contentsMaintext += placename === "subway_station" ? '<h6><a href="/Post">지하철 정보 검색 페이지로 이동하시겠습니까?</a></h6>' : "";

            const P_marker = createMarker(placeinfo.address, map, placeinfo.name, iconList[placename], placename, { get_image: false }); // 마커 생성

            const P_infoWindow = new google.maps.InfoWindow({
                content: contentsName + contentsMaintext,
            });

            P_marker.addListener("click", async function () {
                const self = this; // this를 저장

                if (self.data.get_image) {
                    P_infoWindow.open(map, P_marker);
                    // 버튼 요소들을 선택
                } else {
                    new Promise(async function (resolve, reject) {
                        try {
                            const photoUrl = await fetchPlacePhoto(placeinfo.name);

                            P_infoWindow.setContent(contentsName + photoUrl + contentsMaintext);
                            P_infoWindow.open(map, P_marker);
                            self.data.get_image = true; // 저장한 this 사용

                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }).then(() => {
                        setMidAdrEvent();
                    });
                }
            });

            P_marker.setVisible(false); // 생성한 마커를 숨겨둠
            placeMarkers.push(P_marker);
        }
    }

    return placeMarkers;
}

// 길찾기 경로 생성 함수
function createRoute(contents_info, response, markerInfo, map, marker, directionsRenderer) {
    const infoWindowContent = `
    <h5>${markerInfo.title}</h5>
    <p>사용자님이 검색하신 ${markerInfo.content}</p><hr>
    ${contents_info}
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
    });

    marker.addListener("click", () => {
        infoWindow.open(map, marker);
    });

    directionsRenderer.setDirections(response);
}

// 중간지점 마커 생성 함수
function createEndMarkers(responseData, endpoint, map, marker_iconList, midcontent) {
    const midcontent_name = `
        <h5>${responseData.endpoint[0].name}</h5>
        <p>도착지점입니다.</p><hr>
        `;

    const markerEnd = new google.maps.Marker({
        position: endpoint,
        map,
        title: responseData.endpoint[0].name,
        icon: marker_iconList.mid,
        tags: "end",
    });

    const infoWindowEnd = new google.maps.InfoWindow();

    markerEnd.addListener("click", () => {
        infoWindowEnd.setContent(midcontent_name + midcontent);
        infoWindowEnd.open(map, markerEnd);
    });
}

// 대표 사진을 가져오는 함수
async function fetchPlacePhoto(placeId) {
    const parser = new DOMParser();

    const place_image_html = await fetch(`http://localhost:8080/Mapping/PlacePhoto?placeId=${placeId}`);
    const image_html = await place_image_html.json();

    let doc = parser.parseFromString(image_html.Html, "text/html");
    let imageElement = doc.getElementsByClassName("DS1iW")[0];

    if (imageElement) {
        let imageUrl = imageElement.getAttribute("src");
        if (imageUrl) {
            return `<img src="${imageUrl}" alt="대표 사진" width="300">`;
        } else {
            alert("검색 결과 이미지를 찾을 수 없습니다.");
        }
    } else {
        alert("검색 결과를 찾을 수 없습니다.");
    }
}
