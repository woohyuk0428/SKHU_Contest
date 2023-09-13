const express = require("express"); // express 프레임워크
const router = express.Router();
const request = require("request"); // request 모듈
const fs = require("fs"); // fs 모듈
const jsonFile = require("jsonfile");

const key = fs.readFileSync("./APIKey.txt", "utf-8");
const tago_key = fs.readFileSync("./tago_key.txt", "utf-8");

//요일 구분해주는 function
function getDayOfWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0은 일요일, 1은 월요일, ..., 6은 토요일
  
    if (dayOfWeek === 0) {
      return '3';
    } else if (dayOfWeek === 6) {
      return '2';
    } else {
      return '1';
    }
  }
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
    var s_updnline = req.body.updnLine//상행 하행 구별
    var s_line = req.body.SubwayLine; //노선 받는 변수
    var stationNm = ""; //역코드 저장


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
    const realarrive_url = "http://swopenapi.seoul.go.kr/api/subway/" + key + "/json/realtimeStationArrival/0/20/" + encodeURI(s_response); //seoul realtime url
    const realTimePosition_url = `http://swopenapi.seoul.go.kr/api/subway/${key}/json/realtimePosition/0/50/${s_line}`
    request(
        {
            url: realarrive_url,
            method: "get",
        },
        function (error, response, body) {
            try {
                const obj = JSON.parse(body); // body의 데이터는 string으로 전  송되기 때문에 json형식으로 변환
                const data = obj.realtimeArrivalList[0]; // 필요한 데이터 경로 압축
                const convert = jsonFile.readFileSync("./static/json/line.json");
                
                const subwayId = convert[data.subwayId];
                const btrainNo = data.btrainNo; //열차번호
                const trainLineNm = data.trainLineNm; //도착지방면
                const arvlMsg2 = data.arvlMsg2; //열차 도착 정보
                const arvlMsg3 = data.arvlMsg3; //열차 도착 정보 2
                const recptnDt = data.recptnDt; //열차 도착 시간

                const arr = data.subwayList.split(","); // 문자열로 저장된 환승 정보를 배열로 변경
                var Mystr = "";
                arr.forEach((item, index) => {
                    Mystr += `<span>환승 정보(${index + 1}):</span> ${convert[item]}<br>`; // 배열 요소만큼 문자열 생성
                });
                // 역코드를 얻기 위한 작업
                if(s_line === "1호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "2호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "3호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "4호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "5호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "6호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "7호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "8호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                else if(s_line === "9호선"){
                    var station_line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
                    stationNm = station_line[arvlMsg3];
                }
                //arvlMsg3에서 받은 역코드명으로 api 호출
                const SearchSTNTimeTableByFRCodeService_url = `http://openapi.seoul.go.kr:8088/${key}/json/SearchSTNTimeTableByFRCodeService/1/500/${stationNm}/${getDayOfWeek()}/${s_updnline}/`;
                request({
                    url: SearchSTNTimeTableByFRCodeService_url,
                    method: "GET",
                }, function(err, res, body){
                    if(err){
                        console.error(err);
                    }
                    try{
                        const obj = JSON.parse(body);
                    }catch(e){
                        console.log(`error: ${e}`);
                    }
                    
                })
                // post페이지로 결과 반환
                var newHtml = `<br><h1>${subwayId} ${s_response}역 결과입니다.</h1>
                    <div class="result-info">
                    <span>열차 번호:</span> ${btrainNo}<br>
                    <span>열차 방향:</span> ${trainLineNm}<br>
                    <span>열차 위치:</span> ${arvlMsg2}<br>
                    ${Mystr}
                    열차 검색 시간은 "${recptnDt}"입니다.</div>`;

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
 // const tago_api = `https://apis.data.go.kr/1613000/SubwayInfoService/getKwrdFndSubwaySttnList?serviceKey=${tago_key}&pageNo=1&numOfRows=10&_type=json&subwayStationName=${encodeURI(arvlMsg3)}`;//tago_api url
                // console.log(tago_api);

                // //국토부 tago api 받아오는 request
                // request({
                //     url: tago_api,
                //     method: "get",
                // },
                //     function (err, res, body) {
                //         const data = JSON.parse(body);
                //         let sugDataResult = data["response"]["body"]["items"]["item"];
                //         var subwayStationId = "";

                //         console.log(sugDataResult);
                //         sugDataResult.forEach((data, idx) => {
                //             if (sugDataResult[idx]["subwayStationName"] == arvlMsg3 && sugDataResult[idx]["subwayRouteName"] == s_line) {
                //                 subwayStationId = sugDataResult[idx]["subwayStationId"];
                //                 console.log("subwayStationId값: ", subwayStationId);
                //             }
                //         });
                        

                //     });
