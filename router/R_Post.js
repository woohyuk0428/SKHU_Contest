const express = require("express"); // express 프레임워크
const router = express.Router();
const request = require("request"); // request 모듈
const fs = require("fs"); // fs 모듈

const key = fs.readFileSync("APIKey.txt", "utf8"); // 지하철 API 키값 저장

//http://localhost:8080/post 경로로 요청 시 Suggestion.html파일 반환
router.get("/", (req, res) => {
    // 쿠키가 있는지 검사
    if (req.cookies.My_Station == undefined) {
        var before = []; // 쿠키가 없으면 빈 배열을 반환
        console.log(before);
    } else {
        var before = req.cookies.My_Station; // 쿠키가 있다면 쿠키값을 반환
        Array.isArray(before) ? null : (before = [before]); // 값이 1개면 문자열을 배열로 변경
        console.log(before);
    }

    res.render("Post", {
        result_Data: "",
        before_Data: before,
    });
});

// http://localhost:8080/post - post라우팅
router.post("/", (req, res) => {
    var s_response = req.body.station.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, ""); // XSS 공격 방어

    // ""입력시 현재 운행중인 모든 역이 나오기 때문에 이를 방지
    if (s_response == "") {
        if (req.cookies.My_Station == undefined) {
            var before = []; // 쿠키가 없으면 빈 배열을 반환
        } else {
            var before = req.cookies.My_Station; // 쿠키가 있다면 쿠키값을 반환
            Array.isArray(before) ? null : (before = [before]); // 값이 1개면 문자열을 배열로 변경
        }

        res.render("post", {
            result_Data: "<script>alert('지하철 역 이름을 입력해주세요.')</script>",
            before_Data: before,
        });
        return 0;
    }

    // 마지막 글자가 "역"이면 역을 삭제함
    if (s_response.slice(-1) == "역") {
        s_response = s_response.slice(0, -1);
    }

    // 지하철 API에서 가져올 데이터 - url수정
    const url = "http://swopenapi.seoul.go.kr/api/subway/" + key + "/json/realtimeStationArrival/0/10/" + encodeURI(s_response);
    console.log(url);
    request(
        {
            url: url,
            method: "GET",
        },
        function (error, response, body) {
            try {
                const obj = JSON.parse(body); // body의 데이터는 string으로 전  송되기 때문에 json형식으로 변환
                const data = obj.realtimeArrivalList[0]; // 필요한 데이터 경로 압축

                const arr = data.subwayList.split(","); // 문자열로 저장된 환승 정보를 배열로 변경
                var Mystr = "";
                arr.forEach((item, index) => {
                    Mystr += `<span>환승 정보(${index + 1}):</span> ${item}<br>`; // 배열 요소만큼 문자열 생성
                });

                // post페이지로 결과 반환
                var newHtml = `<br><h1>사용자님이 검색하신<span>"${s_response}"</span>에 대한 검색 결과입니다.</h1>
                    <div class="result-info">
                    <span>열차 노선:</span> ${data.subwayId}<br>
                    <span>열차 번호:</span> ${data.btrainNo}<br>
                    <span>열차 방향:</span> ${data.trainLineNm}<br>
                    <span>열차 위치:</span> ${data.arvlMsg2}<br>
                    ${Mystr}
                    열차 검색 시간은 "${data.recptnDt}"입니다.</div>`;

                // 쿠키가 존재하는지 확인
                if (req.cookies.My_Station == undefined) {
                    // 쿠키가 없을 때 실행
                    res.cookie("My_Station", s_response); // 검색한 역을 쿠키 값으로 생성
                    var MyCookie = [s_response]; // ejs에서 코드 실행 시 문자열이면 오류가 나기 때문에 배열로 변경
                    console.log(`쿠키 없음: ${MyCookie}`);
                } else {
                    // 쿠키가 있을 때 실행
                    var MyCookie = req.cookies.My_Station; // 쿠키값을 변수에 저장

                    Array.isArray(MyCookie) ? null : (MyCookie = [MyCookie]); // 요소가 1개일 경우 문자열을 배열로 변경
                    MyCookie.indexOf(s_response) + 1 ? MyCookie.splice(MyCookie.indexOf(s_response), 1) : null; // 중복된 요소가 있다면 삭제
                    MyCookie.length >= 5 ? MyCookie.pop() : null; // 요소가 5개 이상이면 마지막 요소 삭제
                    MyCookie.unshift(s_response); // 검색한 역을 배열 첫번째 요소로 추가

                    res.cookie("My_Station", MyCookie); // 배열을 쿠키값으로 추가
                    console.log(`쿠키 있음: ${MyCookie}`);
                }

                //결과 반환
                res.render("post", {
                    result_Data: newHtml,
                    before_Data: MyCookie,
                });
            } catch (error) {
                // 에러가 발생했을 때 예외 처리
                console.error(error);
                if (req.cookies.My_Station == undefined) {
                    var before = []; // 쿠키가 없으면 빈 배열을 반환
                } else {
                    var before = req.cookies.My_Station; // 쿠키가 있다면 쿠키값을 반환
                    Array.isArray(before) ? null : (before = [before]); // 값이 1개면 문자열을 배열로 변경
                }

                res.render("post", {
                    result_Data: `<br><p style="color:red">"${s_response}"에 대한 검색 결과가 존재하지 않거나 데이터를 가져오는 중에 오류가 발생했습니다.</p>`,
                    before_Data: before,
                });
            }
        }
    );
});

module.exports = router;
