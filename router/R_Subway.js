const express = require("express"); // express 프레임워크
const router = express.Router();
const request = require("request"); // request 모듈
const fs = require("fs"); // fs 모듈
const jsonFile = require("jsonfile");
const reverse = jsonFile.readFileSync("./static/json/line_reverse.json");
const key = "527078486174656e3131335074454453"
//요일 구분해주는 function
function getDayOfWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0은 일요일, 1은 월요일, ..., 6은 토요일

    if (dayOfWeek === 6 || dayOfWeek === 0) {
        return "9";
    } else {
        return "8";
    }
}

// http://localhost:8080/post - post라우팅
router.post("/", (req, res_router) => {
    console.log("실행");
    console.log(req.body);
    var s_response = req.body.response; // XSS 공격 방어
    var s_updnline = req.body.updnLine; //상행 하행 구별
    var s_line = req.body.subwayLine; //노선 받는 변수
    console.log(`${s_response}역\n 호선 : ${s_line}\n 상행 하행${s_updnline}`);
    const line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
    const rapid_line = jsonFile.readFileSync(`./static/json/Line/1호선_급행.json`);
    const express_line = jsonFile.readFileSync(`./static/json/Line/1호선_특급.json`);
    const reverse_updn = {
        1: "상행",
        2: "하행",
    };
    const line2_updn = {
        1: "내선",
        2: "외선",
    };

    // ""입력시 현재 운행중인 모든 역이 나오기 때문에 이를 방지
    if (s_response == "") {
        // res_router.json("Subway", {
        //     result_Data: "<script>alert('지하철 역 이름을 입력해주세요.')</script>",
        // });
        return 0;
    }

    // 마지막 글자가 "역"이면 역을 삭제함
    if (s_response.slice(-1) == "역") {
        s_response = s_response.slice(0, -1);
    }
    const encodedStationName = encodeURI(s_response);

    // 지하철 API에서 가져올 데이터 - url수정
    const realarrive_url = `http://swopenapi.seoul.go.kr/api/subway/${key}/json/realtimeStationArrival/0/20/${encodedStationName}`; //seoul realtime url
    const realTimePosition_url = `http://swopenapi.seoul.go.kr/api/subway/${key}/json/realtimePosition/0/100/${encodeURI(s_line)}`;
    console.log(realTimePosition_url);
    // console.log(realTimePosition_url)
    const convert = jsonFile.readFileSync("./static/json/line.json");

    console.log(`서울시 공공데이터 : ${realarrive_url}`);
    const subwayJson = { Status: 200, body: [] };

    if (line[s_response] === s_line) {

        request(
            {
                url: realarrive_url,
                method: "GET",
            },
            function (error, response, body) {
                try {
                    const obj = JSON.parse(body); // body의 데이터는 string으로 전  송되기 때문에 json형식으로 변환
                    if (obj.status != "500") {
                        // 검색했을때 500이 뜨면 정보가 안나온다.
                        const s_data = obj.realtimeArrivalList; // 필요한 데이터 경로 압축
                        if (s_data.btrainNo != undefined) {
                            s_data.sort((a, b) => {
                                // 열차 번호(btrainNo)를 비교하여 정렬
                                a_parse = parseInt(a.btrainNo, 10);
                                b_parse = parseInt(b.btrainNo, 10);
                                a_str = String(a_parse);
                                b_str = String(b_parse);
                                return a_str.localeCompare(b_str);
                            });
                        }
                        //열차 불러오는 작업
                        let j = 0;
                        let i_len = new Array();
                        s_data.forEach((data1, index) => {
                            const subwayLine = data1.subwayId;
                            const arvlMsg3 = data1.arvlMsg3;
                            const recptnDt = data1.recptnDt;
                            const bstatnNm = data1.bstatnNm;
                            const updnLine = data1.updnLine;
                            let trainLineNm = data1.trainLineNm;
                            const subwayId = data1.subwayId;
                            let btrainNo = data1.btrainNo;
                            const arvlMsg2 = data1.arvlMsg2;
                            const arvlCd = data1.arvlCd;
                            // 역코드를 얻기 위한 작업
                            var r_railOprIsttCd = jsonFile.readFileSync("./static/json/railOprIsttCd.json");
                            var railOprIsttCd = r_railOprIsttCd[s_line][arvlMsg3];
                            var r_InCd = jsonFile.readFileSync("./static/json/lnCd.json");
                            var InCd = r_InCd[s_line][arvlMsg3];
                            var r_stinCd = jsonFile.readFileSync("./static/json/stinCd.json");
                            var stinCd = r_stinCd[s_line][arvlMsg3];

                            if ((reverse[s_line] === subwayLine && reverse_updn[s_updnline] === updnLine) || line2_updn[s_updnline] === updnLine) {
                                //api 호출한 값 json화
                                let processData = {
                                    trainLineNm: trainLineNm,
                                    subwayId: convert[subwayId],
                                    btrainNo: btrainNo,
                                    arvlMsg2: arvlMsg2,
                                    updnLine: updnLine,
                                    bstatnNm: bstatnNm,
                                };
                                const arr = data1.subwayList.split(","); // 문자열로 저장된 환승 정보를 배열로 변경
                                //1호선 같은 경우 열차번호 앞자리가 0이 들어가기 때문에 급행열차가 아닌 열차 번호를 식별하기 위한 작업
                                let parse_btrainNo = parseInt(btrainNo, 10);
                                btrainNo = String(parse_btrainNo);
                                if (rapid_line[s_response] == undefined || express_line[s_response] == undefined) {
                                    if (parse_btrainNo < 1600 && parse_btrainNo > 1000) {
                                        processData.trainLineNm += " (통과)";
                                    }
                                }
                                var list = "";
                                arr.forEach((data2) => {
                                    list += `${convert[data2]} `;
                                });
                                processData.subwayList = list;

                                let SearchSTNTimeTableByFRCodeService_url = `https://openapi.kric.go.kr/openapi/trainUseInfo/subwayTimetable?serviceKey=${fs.readFileSync(
                                    "./kric_api.txt",
                                    "utf-8"
                                )}&format=json&railOprIsttCd=${railOprIsttCd}&dayCd=${getDayOfWeek()}&lnCd=${InCd}&stinCd=${stinCd}`;

                                console.log(SearchSTNTimeTableByFRCodeService_url);
                                let url_array = new Array();
                                url_array.push(SearchSTNTimeTableByFRCodeService_url);
                                if (railOprIsttCd != undefined && InCd != undefined && stinCd != undefined) {
                                    request(
                                        {
                                            url: realTimePosition_url,
                                            method: "GET",
                                        },
                                        function (err, res, body1) {
                                            const object = JSON.parse(body1);
                                            const result = object.realtimePositionList;
                                            if (object.status != "500") {
                                                result.forEach((data3) => {
                                                    const statnNm = data3.statnNm;
                                                    const directAt = data3.directAt;
                                                    const lstcarAt = data3.lstcarAt;
                                                    let trainNo = data3.trainNo;
                                                    const trainSttus = data3.trainSttus;
                                                    let parseInt_trainNo = parseInt(trainNo, 10);
                                                    trainNo = String(parseInt_trainNo);
                                                    if (btrainNo === trainNo) {
                                                        if (trainSttus === "0" && directAt === "0" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 진입`;
                                                        } else if (trainSttus === "1" && directAt === "0" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 도착`;
                                                        } else if (trainSttus === "2" && directAt === "0" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 출발`;
                                                        } else if (trainSttus === "3" && directAt === "0" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 전역출발`;
                                                        } else if (trainSttus === "0" && directAt === "1" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 진입 (급행)`;
                                                        } else if (trainSttus === "1" && directAt === "1" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 도착 (급행)`;
                                                        } else if (trainSttus === "2" && directAt === "1" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 출발 (급행)`;
                                                        } else if (trainSttus === "3" && directAt === "1" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 전역출발 (급행)`;
                                                        } else if (trainSttus === "0" && directAt === "7" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 진입 (특급)`;
                                                        } else if (trainSttus === "1" && directAt === "7" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 도착 (특급)`;
                                                        } else if (trainSttus === "2" && directAt === "7" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 출발 (특급)`;
                                                        } else if (trainSttus === "3" && directAt === "7" && lstcarAt === "0") {
                                                            processData.Position = `${statnNm}역 전역출발 (특급)`;
                                                        } else if (trainSttus === "0" && directAt === "0" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 진입 (막차)`;
                                                        } else if (trainSttus === "1" && directAt === "0" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 도착 (막차)`;
                                                        } else if (trainSttus === "2" && directAt === "0" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 출발 (막차)`;
                                                        } else if (trainSttus === "3" && directAt === "0" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 전역출발 (막차)`;
                                                        } else if (trainSttus === "0" && directAt === "1" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 진입 (급행) (막차)`;
                                                        } else if (trainSttus === "1" && directAt === "1" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 도착 (급행) (막차)`;
                                                        } else if (trainSttus === "2" && directAt === "1" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 출발 (급행) (막차)`;
                                                        } else if (trainSttus === "3" && directAt === "1" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 전역출발 (급행) (막차)`;
                                                        } else if (trainSttus === "0" && directAt === "7" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 진입 (특급) (막차)`;
                                                        } else if (trainSttus === "1" && directAt === "7" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 도착 (특급) (막차)`;
                                                        } else if (trainSttus === "2" && directAt === "7" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 출발 (특급) (막차)`;
                                                        } else if (trainSttus === "3" && directAt === "7" && lstcarAt === "1") {
                                                            processData.Position = `${statnNm}역 전역출발 (특급) (막차)`;
                                                        }
                                                        //subwayData[subwayId].push(processData);
                                                    }
                                                });
                                                try {
                                                    if (btrainNo != null || stinCd != undefined || InCd != undefined || railOprIsttCd != undefined) {
                                                        i_len.push(index);
                                                        request(
                                                            {
                                                                url: SearchSTNTimeTableByFRCodeService_url,
                                                                method: "GET",
                                                            },
                                                            function (err, response, body1) {
                                                                if (err) {
                                                                    console.error(err);
                                                                }
                                                                // 열차가 도착한 역의 시간표 불러오는 request
                                                                try {
                                                                    const obj = JSON.parse(body1);
                                                                    const result = obj.body;
                                                                    if (s_data.btrainNo != undefined) {
                                                                        result.sort((a, b) => {
                                                                            if (
                                                                                s_line == "1호선" ||
                                                                                s_line == "3호선" ||
                                                                                s_line == "4호선" ||
                                                                                s_line == "9호선" ||
                                                                                s_line == "경의중앙선" ||
                                                                                s_line == "경춘선" ||
                                                                                s_line == "수인분당선" ||
                                                                                s_line == "신분당선" ||
                                                                                s_line == "서해선" ||
                                                                                s_line == "우이신설선"
                                                                            ) {
                                                                                a_sub = a.trnNo.substring(1);
                                                                                b_sub = b.trnNo.substring(1);
                                                                                a_parse = parseInt(a_sub, 10);
                                                                                b_parse = parseInt(b_sub, 10);
                                                                                a_str = String(a_parse);
                                                                                b_str = String(b_parse);
                                                                                return a_str.localeCompare(b_str);
                                                                            } else {
                                                                                a_parse = parseInt(a, 10);
                                                                                b_parse = parseInt(b, 10);
                                                                                a_str = String(a_parse);
                                                                                b_str = String(b_parse);
                                                                                return a_str.localeCompare(b_str);
                                                                            }
                                                                        });
                                                                    }
                                                                    //delay 지연 정보 구현
                                                                    result.forEach((data2, index1) => {
                                                                        var train_no = data2.trnNo;
                                                                        if (
                                                                            s_line == "1호선" ||
                                                                            s_line == "3호선" ||
                                                                            s_line == "4호선" ||
                                                                            s_line == "9호선" ||
                                                                            s_line == "경의중앙선" ||
                                                                            s_line == "경춘선" ||
                                                                            s_line == "수인분당선" ||
                                                                            s_line == "신분당선" ||
                                                                            s_line == "서해선" ||
                                                                            s_line == "우이신설선"
                                                                        ) {
                                                                            train_no = train_no.substring(1);
                                                                        }

                                                                        if (s_line === "2호선" && btrainNo.charAt(0) == "3") {
                                                                            btrainNo = btrainNo.replace("3", "2");
                                                                        } else if (s_line === "2호선" && btrainNo.charAt(0) == "6") {
                                                                            btrainNo = btrainNo.replace("6", "2");
                                                                        } else if (s_line === "2호선" && btrainNo.charAt(0) == "7") {
                                                                            btrainNo = btrainNo.replace("7", "2");
                                                                        } else if (s_line === "2호선" && btrainNo.charAt(0) == "8") {
                                                                            btrainNo = btrainNo.replace("8", "2");
                                                                        }
                                                                        if (btrainNo === train_no) {
                                                                            let trainTime = data2.arvTm;
                                                                            let dptTm = data2.dptTm;
                                                                            if (trainTime != null && processData.Position) {
                                                                                let hours = parseInt(trainTime.slice(0, 2), 10);
                                                                                let minutes = parseInt(trainTime.slice(2, 4), 10);
                                                                                let seconds = parseInt(trainTime.slice(4, 6), 10);
                                                                                let currentDate = new Date();
                                                                                let trainDate = new Date(
                                                                                    currentDate.getFullYear(),
                                                                                    currentDate.getMonth(),
                                                                                    currentDate.getDate(),
                                                                                    hours,
                                                                                    minutes,
                                                                                    seconds
                                                                                );
                                                                                let recptnDate = new Date(recptnDt);

                                                                                recptnDate.setHours(
                                                                                    trainDate.getHours(),
                                                                                    trainDate.getMinutes(),
                                                                                    trainDate.getSeconds()
                                                                                );

                                                                                if (currentDate.getTime() > recptnDate.getTime()) {
                                                                                    let timeDiff = currentDate - recptnDate;
                                                                                    let minuesDelayed = Math.floor(timeDiff / (1000 * 60));
                                                                                    let secondsDelayed = Math.floor((timeDiff % (1000 * 60)) / 1000);
                                                                                    var delayInfo = `${data2.trnNo} ${bstatnNm}행 열차 ${minuesDelayed}분 ${secondsDelayed}초 지연 운행중`;
                                                                                } else if (currentDate.getTime() < recptnDate.getTime()) {
                                                                                    let timeDiff = recptnDate - currentDate;
                                                                                    let minuesDelayed = Math.floor(timeDiff / (1000 * 60));
                                                                                    let secondsDelayed = Math.floor((timeDiff % (1000 * 60)) / 1000);
                                                                                    var delayInfo = `${data2.trnNo} ${bstatnNm}행 열차${minuesDelayed}분 ${secondsDelayed}초 조기 운행중`;
                                                                                } else if (currentDate.getTime() === recptnDate.getTime()) {
                                                                                    var delayInfo = `${data2.trnNo} ${bstatnNm}행 열차 정시 운행중`;
                                                                                }
                                                                            } else {
                                                                                var hours = parseInt(dptTm.slice(0, 2), 10);
                                                                                var minutes = parseInt(dptTm.slice(2, 4), 10);
                                                                                var seconds = parseInt(dptTm.slice(4, 6), 10);
                                                                                var currentDate = new Date();
                                                                                var trainDate = new Date(
                                                                                    currentDate.getFullYear(),
                                                                                    currentDate.getMonth(),
                                                                                    currentDate.getDate(),
                                                                                    hours,
                                                                                    minutes,
                                                                                    seconds
                                                                                );
                                                                                var recptnDate = new Date(recptnDt);
                                                                                recptnDate.setHours(
                                                                                    trainDate.getHours(),
                                                                                    trainDate.getMinutes(),
                                                                                    trainDate.getSeconds()
                                                                                );
                                                                                if (currentDate.getTime() < recptnDate.getTime()) {
                                                                                    let timeDiff = recptnDate - currentDate;
                                                                                    let minuesDelayed = Math.floor(timeDiff / (1000 * 60));
                                                                                    let secondsDelayed = Math.floor((timeDiff % (1000 * 60)) / 1000);
                                                                                    var delayInfo = `${data2.trnNo} ${bstatnNm}행 열차 ${minuesDelayed}분 ${secondsDelayed}초 후 출발 예정`;
                                                                                } else if (currentDate.getTime() == recptnDate.getTime()) {
                                                                                    var delayInfo = `${data2.trnNo} ${bstatnNm}행 열차 정시 출발`;
                                                                                } else if (currentDate.getTime() > recptnDate.getTime()) {
                                                                                    let timeDiff = currentDate - recptnDate;
                                                                                    let minuesDelayed = Math.floor(timeDiff / (1000 * 60));
                                                                                    let secondsDelayed = Math.floor((timeDiff % (1000 * 60)) / 1000);
                                                                                    var delayInfo = `${data2.trnNo} ${bstatnNm}행 열차 ${minuesDelayed} 분 ${secondsDelayed}초 지연 출발`;
                                                                                }
                                                                            }
                                                                            processData.btrainNo = data2.trnNo;
                                                                            processData.delayInfo = delayInfo;
                                                                        }
                                                                    });
                                                                    subwayJson.body.push(processData);
                                                                    j++;
                                                                    console.log(j);
                                                                    console.log(i_len.length);
                                                                    if (j === i_len.length) {
                                                                        console.log(subwayJson);
                                                                        res_router.json(subwayJson);
                                                                    }
                                                                } catch (e) {
                                                                    console.error(`error: ${e}`);
                                                                }
                                                            }
                                                        ); // request 끝
                                                    } else if (btrainNo == null) {
                                                        subwayJson.push(processData);
                                                        if (j === i_len.length) {
                                                            console.log(subwayJson);
                                                            res_router.json(subwayJson);
                                                        }

                                                        return;
                                                    }
                                                } catch (e) {
                                                    console.log(`request 오류 : ${e}`);
                                                }
                                            }
                                        }
                                    );
                                }
                            }
                        });
                    } else {
                        console.log("운행종료");
                        res_router.json(subwayJson.Status = 500);

                    }
                    //결과 반환
                } catch (error) {
                    console.error(error);
                }
            }
        );
    } else {
        console.log(`${s_line}의 ${s_response}역은 없습니다. 다시 검색해주세요.`);
        res_router.json(subwayJson.Status = 400);
        // res_router.render("/Subway", {
        //     result_Data: `${s_line}의 ${s_response}역은 없습니다. 다시 검색해주세요.`,
        // });
        return;
    }
});
module.exports = router;
