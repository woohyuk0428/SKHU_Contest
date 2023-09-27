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

const imageDisplay = document.getElementById("map");
const subwayMap = document.querySelector("#iframeImg");

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

  toggleSection(section1, gotoMappingBtn);
  imageDisplay.classList.remove("hiddenMap");
  subwayMap.classList.add("hiddenMap");
})

gotoHalfWayBtn.addEventListener('click', () => {
    showMap();

  toggleSection(section2, gotoHalfWayBtn);
  imageDisplay.classList.remove("hiddenMap");
  subwayMap.classList.add("hiddenMap");
})

gotoSubwayBtn.addEventListener('click', () => {

  toggleSection(section3, gotoSubwayBtn);
  imageDisplay.classList.add("hiddenMap");
  subwayMap.classList.remove("hiddenMap");
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

//  지하철 노선도 이미지 표시를 위한 컨테이너 참조
const imageContainer = document.getElementById('imageContainer');

// 지하철 이미지 버튼을 클릭했을 때만 지하철 노선도 표시
gotoSubwayBtn.addEventListener('click', () => {
    imageContainer.style.display = 'block';
});

// 길찾기와 중간지점 이미지 버튼 클릭했을 때는 다시 지하철 노선도 이미지를 숨김
gotoMappingBtn.addEventListener('click', () => {
    imageContainer.style.display = 'none';
});
gotoHalfWayBtn.addEventListener('click', () => {
    imageContainer.style.display = 'none';
});

var imageContainer = document.getElementById("image-container");
var imagedisplay = document.getElementById("image-display");
var isDragging = false;
var startX, startY, translateX, translateY;

// 마우스 휠 이벤트 핸들러
imageContainer.addEventListener('wheel', function(event) {
    event.preventDefault();
    var scaleFactor = event.deltaY > 0 ? 1.1 : 0.9; // 확대 또는 축소 스케일 팩터
    var currentWidth = imagedisplay.width;
    var currentHeight = imagedisplay.height;
    var newWidth = currentWidth * scaleFactor;
    var newHeight = currentHeight * scaleFactor;

    imagedisplay.style.width = newWidth + 'px';
    imagedisplay.style.height = newHeight + 'px';

    // 이미지를 중앙으로 이동시킵니다.
    translateX += (currentWidth - newWidth) / 2;
    translateY += (currentHeight - newHeight) / 2;
    imagedisplay.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;
});

// 이미지 드래그 시작 이벤트 핸들러
imageContainer.addEventListener('mousedown', function(event) {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    translateX = imagedisplay.getBoundingClientRect().left;
    translateY = imagedisplay.getBoundingClientRect().top;
});

// 이미지 드래그 중 이벤트 핸들러
document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        var deltaX = event.clientX - startX;
        var deltaY = event.clientY - startY;
        translateX += deltaX;
        translateY += deltaY;
        imagedisplay.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;
        startX = event.clientX;
        startY = event.clientY;
    }
});

// 이미지 드래그 종료 이벤트 핸들러
document.addEventListener('mouseup', function() {
    isDragging = false;
});
