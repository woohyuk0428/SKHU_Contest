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

gotoMappingBtn.addEventListener('click', () => {
  section1.classList.remove('hidden');
  section2.classList.add('hidden');
  section3.classList.add('hidden');

  // gotoMappingBtn.classList.add('on');
  // gotoHalfWayBtn.classList.remove('on');
  // gotoSubwayBtn.classList.remove('on');
})

gotoHalfWayBtn.addEventListener('click', () => {
  section1.classList.add('hidden');
  section2.classList.remove('hidden');
  section3.classList.add('hidden');

  // gotoMappingBtn.classList.remove('on');
  // gotoHalfWayBtn.classList.add('on');
  // gotoSubwayBtn.classList.remove('on');
})

gotoSubwayBtn.addEventListener('click', () => {
  section1.classList.add('hidden');
  section2.classList.add('hidden');
  section3.classList.remove('hidden');

  // gotoMappingBtn.classList.remove('on');
  // gotoHalfWayBtn.classList.remove('on');
  // gotoSubwayBtn.classList.add('on');
})

// 도움말 버튼