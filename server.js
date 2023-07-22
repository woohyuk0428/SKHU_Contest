const express = require("express"); // express 프레임워크
const request = require("request"); // request 모듈
const cookieParser = require("cookie-parser");
const fs = require("fs"); // fs 모듈
const app = express(); //express 객체 생성
const port = 8080; // 포트 번호 지정
const today = new Date(); // 서버 오픈 시 기록용 현재 시간 저장
var XMLHttpRequest = require('xhr2');
var xhr = new XMLHttpRequest();
const key = fs.readFileSync("APIKey.txt", "utf8"); // 지하철 API 키값 저장

// #region 파일 경로 지정, 옵션 설정
app.use(express.static("static/image"));
app.use(express.static("static/css"));
app.use(express.static("static/javascript"));

app.use(express.json()); // json형태로 body 파싱
app.use(express.urlencoded({ extended: false })); // 파싱 할 때 querystring모듈 사용

app.set("view engine", "ejs"); // 뷰 엔진을 ejs로 설정
app.set("views", "./views"); // 뷰 파일 경로 지정

app.use(cookieParser("SHKU_Cookie")); // 쿠키 시크릿 키 지정

// const cookieConfig = {
//     httpOnly: true,
//     maxAge: 500000,
//     signed: true,
//     httpOnly: false
// };
// #endregion

//서버 오픈시 실행되는 함수. 현재 시간과 함께 서버가 실행됨(Mon Jul 03 2023 21:23:13 GMT+0900 (대한민국 표준시) | server reload)
app.listen(port, () => {
    console.log(`${today} | server reload`);
    console.log("http://localhost:8080/");
});

// #region Get라우팅 - 클라이언트로 기본 html 파일 전송
//http://localhost:8080/ 경로로 요청 시 Main.html파일 반환
app.get("/", (req, res) => {
    res.render("Main");
});

//http://localhost:8080/halfway 경로로 요청 시 Halfway.html파일 반환
app.get("/halfway", (req, res) => {
    res.render("Halfway");
});

//http://localhost:8080/mapping 경로로 요청 시 Mapping.html파일 반환
app.get("/mapping", (req, res) => {
    res.render("Mapping");
});

//http://localhost:8080/suggestion 경로로 요청 시 Suggestion.html파일 반환
app.get("/suggestion", (req, res) => {
    res.render("Suggestion");
});
//http://localhost:8080/detail 경로로 요청 시 Detail.html파일 반환
app.get("/detail", (req, res) => {
    res.render("Detail");
});
//http://localhost:8080/post 경로로 요청 시 Suggestion.html파일 반환
app.get("/post", (req, res) => {
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

//쿠키 삭제
app.get("/clearCookie", (req, res) => {
    res.clearCookie("My_Station");

    res.send("쿠키를 삭제하였습니다.");
});

app.get("/co", (req, res) => {
    res.cookie("My_Station", ["서울", "부천", "부산"]);
    res.send("쿠키를 생성하였습니다.");
});

//http://localhost:8080/XSS 경로로 요청 시 Suggestion.html파일 반환
app.get("/XSS", (req, res) => {
    res.render("XSS", {
        result_Data: "",
    });
});
// #endregion

// http://localhost:8080/post - post라우팅
app.post("/post", (req, res) => {
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

// #region 서버 제작에서 주의해야 할 것, XSS 보안 취약점 - <script>alert("hi")</script>
app.post("/XSS", (req, res) => {
    var s_response = req.body.station;
    if (s_response == "") {
        res.render("post", {
            result_Data: "<script>alert('지하철 역 이름을 입력해주세요.')</script>",
        });
        return 0;
    }
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
                console.log(url);
                const obj = JSON.parse(body); // body의 데이터는 string으로 전송되기 때문에 json형식으로 변환
                const data = obj.realtimeArrivalList[0]; // 필요한 데이터 경로 압축

                const arr = data.subwayList.split(",");
                var Mystr = "";
                arr.forEach((item, index) => {
                    Mystr += `환승 정보(${index + 1}): ${item}<br>`;
                });

                // post페이지로 결과 반환
                var newHtml = `<br><h1>사용자 님이 검색하신"${s_response}"에 대한 검색 결과입니다.</h1>
                    <p>열차 번호: ${data.subwayId}<br>
                    열차 방향: ${data.trainLineNm}<br>
                    열차 위치: ${data.arvlMsg2}<br>
                    ${Mystr}
                    열차 검색 시간은 "${data.recptnDt}"입니다.</p>`;

                //결과 반환
                res.render("XSS", {
                    result_Data: newHtml,
                });
            } catch (error) {
                // 에러가 발생했을 때 예외 처리
                console.error(error);
                res.render("XSS", {
                    result_Data: `<br><p style="color:red">"${s_response}"에 대한 검색 결과가 존재하지 않거나 데이터를 가져오는 중에 오류가 발생했습니다.</p>`,
                });
            }
        }
    );
});
// #endregion




/* ***************** 여기서부터는 지하철 정보를 가져오기 위한 API를 통해 데이터를 Json 형식으로 파일을 제작하는 과정입니다. ******************* */
const key_new = "XXsK%2F1XwVTPaVFfkrpoBQapqSlNiziqMMJJRcS549BH3B2gH1ph4mkRwBJgDbI20uZDnt9SiLbsVlFT5%2FAHCBQ%3D%3D";

//지하철 역 API(new)에서 가져올 데이터
var url = 'http://apis.data.go.kr/1613000/SubwayInfoService/getKwrdFndSubwaySttnList'; /*URL*/
var queryParams = '?' + encodeURIComponent('serviceKey') + '='+ key_new; /*Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /*한 번에 데이터들을 가져오기 위해 1페이지로 지정*/
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1063'); /*모든 데이터들을 조회한 경우 1063개로 집계됨*/
queryParams += '&' + encodeURIComponent('_type') + '=' + encodeURIComponent('json'); /**/

console.log(url + queryParams);
request({
    url: url + queryParams,
    method: 'GET'
}, function (error, response, body) {

    fs.writeFileSync("test_new.json", body);
    console.log('Status', response.statusCode);
    console.log('Headers', JSON.stringify(response.headers));
    console.log('Reponse received', body);
});

/* ***************** 여기서부터는 지하철 출구 근처의 명소 내역을 가져오기 위한 API를 통해 데이터를 Json 형식으로 파일을 제작하는 과정입니다. ******************* */

var url = 'http://apis.data.go.kr/1613000/SubwayInfoService/getSubwaySttnExitAcctoCfrFcltyList';
var queryParams_sights = '?' + encodeURIComponent('serviceKey') + '=' + key_new; /* Service Key*/
queryParams_sights += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100090'); /* */
queryParams_sights += '&' + encodeURIComponent('_type') + '=' + encodeURIComponent('json'); /* */
queryParams_sights += '&' + encodeURIComponent('subwayStationId') + '=' + encodeURIComponent('MTRS11133'); /* */


request({
    url: url + queryParams_sights,
    method: 'GET'
}, function (error, response, body) {

    console.log('\n\n\n\n\nStatus', response.statusCode);
    console.log('Headers', JSON.stringify(response.headers));
    console.log('Reponse received', body);
    fs.writeFileSync("test_sights.json", body);
});
