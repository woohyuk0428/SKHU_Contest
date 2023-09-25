document.getElementById("SubwayForm").addEventListener("submit", function (event) {
    event.preventDefault(); // 폼 제출 기본 동작을 막음

    var a_subwayLine = document.getElementById("SubwayLine").value;
    var a_updnLine = document.getElementById("updnLine").value;
    var a_response = document.getElementById("station").value;

    let url = "http://localhost:8080/Subway";
    var data = { response: a_response, subwayLine: a_updnLine, updnLine: a_subwayLine }; // 보낼 데이터를 객체로 정의

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=UTF-8", // JSON 형태로 데이터를 보낼 때 헤더 설정
        },
        body: JSON.stringify(data), // 데이터를 JSON 문자열로 변환하여 보냅니다.
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json(); // JSON 형태로 변환하여 반환
        })
        .then((data) => {
            // 데이터 처리
            console.log(data);
        })
        .catch((error) => {
            // 오류 처리
            console.error("Error:", error);
        });
});
