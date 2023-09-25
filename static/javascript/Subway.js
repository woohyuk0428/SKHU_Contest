document.getElementById('SubwayForm').addEventListener('submit', function(event) {
    event.preventDefault(); // 폼 제출 기본 동작을 막음

    var subwayLine = document.getElementById('SubwayLine').value;
    var updnLine = document.getElementById('updnLine').value;
    var response = document.getElementById('station').value;

    // 값을 R_Subway.js로 전달
    R_Subway.s_processData(response, subwayLine, updnLine);
});