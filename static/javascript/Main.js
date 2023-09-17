new google.maps.Map(document.getElementById("map"), {
  center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정
  zoom: 14, // 확대/축소 레벨
});

const foldingBtn = document.querySelector('.folding-btn');
const menu = document.querySelector('.menu');

// 사이드 메뉴 토글
foldingBtn.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});

// 길찾기 , 중간지점 , 지하철 이동 버튼
const gotoMappingBtn = document.querySelector('#gotoMappingBtn');
const gotoHalfWayBtn = document.querySelector('#gotoHalfWayBtn');
const gotoSubwayBtn = document.querySelector('#gotoSubwayBtn');

const section1 = document.querySelector('.mapping-section');
const section2 = document.querySelector('.halfway-section');
const section3 = document.querySelector('.subway-section');



function toggleSection(sectionShow, buttonHighlight) {
  [section1, section2, section3].forEach(section => {
    section.classList.add('hidden');
  });

  sectionShow.classList.remove('hidden');

  [gotoMappingBtn, gotoHalfWayBtn, gotoSubwayBtn].forEach(button => {
    button.classList.remove('on');
  });

  buttonHighlight.classList.add('on');
}

gotoMappingBtn.addEventListener('click', () => {
  toggleSection(section1, gotoMappingBtn);
})

gotoHalfWayBtn.addEventListener('click', () => {
  toggleSection(section2, gotoHalfWayBtn);
})

gotoSubwayBtn.addEventListener('click', () => {
  toggleSection(section3, gotoSubwayBtn);
})

// 도움말 버튼
