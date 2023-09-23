function showMap() {
    new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정
        zoom: 14, // 확대/축소 레벨
    });

}

// 초기설정 화면(구글 지도) 적용
new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정
    zoom: 14, // 확대/축소 레벨
});
const foldingBtn = document.querySelector(".folding-btn");
const menu = document.querySelector(".menu");

// 사이드 메뉴 토글
foldingBtn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

// 길찾기 , 중간지점 , 지하철 이동 버튼
const gotoMappingBtn = document.querySelector("#gotoMappingBtn");
const gotoHalfWayBtn = document.querySelector("#gotoHalfWayBtn");
const gotoSubwayBtn = document.querySelector("#gotoSubwayBtn");

const section1 = document.querySelector(".mapping-section");
const section2 = document.querySelector(".halfway-section");
const section3 = document.querySelector(".subway-section");

function toggleSection(sectionShow, buttonHighlight) {
    [section1, section2, section3].forEach((section) => {
        section.classList.add("hidden");
    });

    sectionShow.classList.remove("hidden");

    [gotoMappingBtn, gotoHalfWayBtn, gotoSubwayBtn].forEach((button) => {
        button.classList.remove("on");
    });

    buttonHighlight.classList.add("on");
}

gotoMappingBtn.addEventListener('click', () => {
    showMap();
    const imageDisplay = document.getElementById("map");

  toggleSection(section1, gotoMappingBtn);
  imageDisplay.classList.remove("hidden");

})

gotoHalfWayBtn.addEventListener('click', () => {
    showMap();
    const imageDisplay = document.getElementById("map");

  toggleSection(section2, gotoHalfWayBtn);
  imageDisplay.classList.remove("hidden");

})

gotoSubwayBtn.addEventListener('click', () => {
    const imageDisplay = document.getElementById("map");
    console.log("hello");
  toggleSection(section3, gotoSubwayBtn);
  imageDisplay.classList.add("hidden");
});
//--------------------------------------
const radioLabels = document.querySelectorAll(".radio-label input[type='radio']"); // 주변 장소 필터버튼 선택

// 라디오 버튼들에 대해 클릭 이벤트 리스너 추가
radioLabels.forEach((radio) => {
    radio.addEventListener("click", handleRadioClick);
});


// 버튼 클래스 중 "selected"를 제거하는 함수 (선택된 버튼 초기화)
function removeSelectedClassFromLabels() {
    document.querySelectorAll(".radio-label").forEach((label) => {
        label.classList.remove("selected");
    });
}

// 도움말 버튼



