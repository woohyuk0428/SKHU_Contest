const folding_bar = document.getElementById('folding-btn');

new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.5665, lng: 126.978 }, // 초기 위치 설정
    zoom: 12, // 확대/축소 레벨
});

function folding(obj){
    const menu = document.getElementById('menu');
    menu.style.left('-30%');
}

folding_bar.addEventListener("click", folding)