const btn = document.getElementById("btn");
const search_input = document.getElementById("station").value;
const station_info = document.getElementById("station-info");


btn.addEventListener('click', function () {


    printName();

})

function printName() {
    const name = document.getElementById('station').value;

    document.getElementById("station-info").innerText = `${name}` + `역`;
}

function handleOnChange(e) {
    // 선택된 데이터 가져오기
    const value = e.value;

    // 데이터 출력
    document.getElementById("line-inf").innerText= `${value}` + `선`;
}
