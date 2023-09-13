new google.maps.Map(document.getElementById("map"), {
  center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정
  zoom: 12, // 확대/축소 레벨
});

const foldingBtn = document.querySelector('.folding-btn');
const menu = document.querySelector('.menu');

// 사이드 메뉴 토글
foldingBtn.addEventListener('click', () => {
menu.classList.toggle('hidden');
});
