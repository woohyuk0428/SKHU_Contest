const express = require("express"); // express 프레임워크
const request = require("request"); // request 모듈
const app = express(); //express 객체 생성
const port = 8080; // 포트 번호 지정
const today = new Date(); // 서버 오픈 시 기록용 현재 시간 저장

const key = "72594c566a77686b3536686666694f"; // 지하철 API 키값 저장 - 추후 보안 업데이트 필요
var url = "http://openapi.seoul.go.kr:8088/sample/json/CardSubwayStatsNew/1/5/20220301"; // 오류 방지용으로 임시 url 지정

// body-parser 옵션 지정
app.use(express.json()); // json형태로 body 파싱
app.use(express.urlencoded({ extended: false })); // 파싱 할 때 querystring모듈 사용

// static으로 html과 같이 전송할 파일 경로 지정
// #region
app.use(express.static("static/image"));
app.use(express.static("static/css"));
app.use(express.static("static/javascript"));
app.use(express.static("template"));
// #endregion

//서버 오픈시 실행되는 함수. 현재 시간과 함께 서버가 실행됨(Mon Jul 03 2023 21:23:13 GMT+0900 (대한민국 표준시) | server reload)
app.listen(port, () => {
    console.log(`${today} | server reload`);
    console.log("http://localhost:8080/");
});

// Get라우팅 - 클라이언트로 기본 html 파일 전송
//http://localhost:8080/ 경로로 요청 시 Main.html파일 반환
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/template/Main.html");
});
//http://localhost:8080/detail 경로로 요청 시 Detail.html파일 반환
app.get("/detail", (req, res) => {
    res.sendFile(__dirname + "/template/Detail.html");
});
//http://localhost:8080/halfway 경로로 요청 시 Halfway.html파일 반환
app.get("/halfway", (req, res) => {
    res.sendFile(__dirname + "/template/Halfway.html");
});

//http://localhost:8080/mapping 경로로 요청 시 Mapping.html파일 반환
app.get("/mapping", (req, res) => {
    res.sendFile(__dirname + "/template/Mapping.html");
});

//http://localhost:8080/suggestion 경로로 요청 시 Suggestion.html파일 반환
app.get("/suggestion", (req, res) => {
    res.sendFile(__dirname + "/template/Suggestion.html");
});

//http://localhost:8080/suggestion 경로로 요청 시 Suggestion.html파일 반환
app.get("/post", (req, res) => {
    res.sendFile(__dirname + "/template/Post.html");
});

// http://localhost:8080/post - post라우팅
app.post("/post", (req, res) => {
    // 지하철 API에서 가져올 데이터 - url수정
    url = "http://swopenapi.seoul.go.kr/api/subway/" + key + "/json/realtimeStationArrival/0/10/" + encodeURI(req.body.station);
    console.log(url);
    // url에 GET으로 request요청
    request(
        {
            url: url,
            method: "GET",
        },
        function (error, response, body) {
            const obj = JSON.parse(body); // body의 데이터는 string으로 전송되기 때문에 json형식으로 변환
            const data = obj.realtimeArrivalList[0]; // 필요한 데이터 경로 압축
            console.log(data);

            // post페이지로 결과 반환
            res.send(`<h1>사용자 님이 검색하신"${req.body.station}"에 대한 검색 결과입니다.</h1>
            <p>열차 번호: ${data.subwayId}<br>
            열차 방향: ${data.trainLineNm}<br>
            열차 위치: ${data.arvlMsg2}<br><br>
            열차 검색 시간은 "${data.recptnDt}"입니다.</p>`);
        }
    );
});

// 서울공공데이터 지하철API 테스트  (console.log)
// #region
app.get("/post/test", (req, res) => {
    request(
        {
            url: url,
            method: "GET",
        },
        function (error, response, body) {
            const obj = JSON.parse(body);
            //console.log("Status", response.statusCode);
            //console.log("Headers", JSON.stringify(response.headers));
            console.log("Reponse received", obj.CardSubwayStatsNew.row[0].USE_DT);
        }
    );
});
// #endregion
