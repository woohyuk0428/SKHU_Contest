const express = require("express");
const router = express.Router();
const request = require("request");
const fs = require("fs");
const jsonFile = require("jsonfile");
const lineData = jsonFile.readFileSync("./static/json/line.json");
const key = fs.readFileSync("APIKey.txt", "utf8");
const axios = require('axios');
let seoul_url = "http://swopenapi.seoul.go.kr/api/subway/" + key + "/json/realtimeStationArrival/0/50/";
const date =  new Date();
// let kric_url = `https://openapi.kric.go.kr/openapi/convenientInfo/stationTimetable?serviceKey=${fs.readFileSync("timetableapi.txt","utf-8")}`;
// kric_url +=`&`+encodeURIComponent(`format`)+`=`+encodeURIComponent("json");
// let dayCd = 0; //평일 : 8 토요일 : 7 일요일 : 6
// let railOp0rIsttCd = ``; //철도 기관명 Korail : KR SeoulMetro : S1 
// let lnCd = 1; //호선 
let test= `https://openapi.kric.go.kr/openapi/convenientInfo/stationTimetable?serviceKey=${fs.readFileSync("timetableapi.txt","utf-8")}&format=json&railOprlsttCd=KR&UB+bCd=1&stinCd=144&dayCd=8`;

function isWeekday(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  }
  
  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }
  
  if (isWeekday(date)) {
    dayCd = 8;
  } else if (isWeekend(date)) {
    dayCd = 7;
  } else {
    dayCd = 9;
  }  

router.get("/", async (req, res) => {
    let station = req.query.station;
    try {
        const url = seoul_url + encodeURI(station);
        
        const response = await axios.get(url);
        const subwayArrivals = response.data.realtimeArrivalList;

        const subwayInfo = {}; //json 변환
        subwayArrivals.forEach(realtimeArrivalList => {
            const subwayId = realtimeArrivalList.subwayId;
            const subwayLine = lineData[subwayId];
            if (!subwayInfo[subwayLine]) {
                subwayInfo[subwayLine] = [];
            }
            const processedData = {
                subwayId: subwayLine, // 호선
                updnLine: realtimeArrivalList.updnLine, //상하행
                trainLineNm : realtimeArrivalList.trainLineNm, //방향
                statnNm: realtimeArrivalList.statnNm, //역 이름
                btrainSttus: realtimeArrivalList.btrainSttus, // 열차 종류
                btrainNo: realtimeArrivalList.btrainNo, // 열차번호
                arvlMsg: realtimeArrivalList.arvlMsg2 //도착 message
            };
            subwayInfo[subwayLine].push(processedData);
        });

        res.render("Subway", {
            result_Data: subwayInfo
        });
    } catch (error) {
        console.error(error);
        res.render("Subway", {
            result_Data: `<br><p style="color:red">"${station}"에 대한 검색 결과가 존재하지 않거나 데이터를 가져오는 중에 오류가 발생했습니다.</p>`
        });
    }
});

module.exports = router;
