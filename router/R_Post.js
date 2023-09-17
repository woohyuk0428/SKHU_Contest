const express = require("express"); // express 프레임워크
const router = express.Router();
const request = require("request"); // request 모듈
const fs = require("fs"); // fs 모듈
const jsonFile = require("jsonfile");
const reverse = jsonFile.readFileSync("./static/json/line_reverse.json");


const key = fs.readFileSync("./APIKey.txt", "utf-8");

//열차 정보 저장하는 json

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
    var s_response = "온수";
    s_response = req.body.station.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, ""); // XSS 공격 방어
    var s_updnline = "상행"; 
    var s_updnline = req.body.updnLine//상행 하행 구별
    console.log(s_updnline)
    var s_line = "1호선";
    var s_line = req.body.SubwayLine; //노선 받는 변수
    var stationNm = ""; //역코드 저장
    const line = jsonFile.readFileSync(`./static/json/Line/${s_line}.json`);
    if(s_line === "9호선"){
        var reverse_updn = {
            "1":"하행", 
            "2":"상행",
        }
    }else{
        reverse_updn = {
            "1":"상행", 
            "2":"하행",
        };
    }
    
    
    const line2_updn = {
        "1" : "내선",
        "2" : "외선"
    };

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
    const encodedStationName = encodeURI(s_response);
    
    // 지하철 API에서 가져올 데이터 - url수정
    const realarrive_url = `http://swopenapi.seoul.go.kr/api/subway/${key}/json/realtimeStationArrival/0/20/${encodedStationName}`; //seoul realtime url
    //const realTimePosition_url = `http://swopenapi.seoul.go.kr/api/subway/${key}/json/realtimePosition/0/50/${encodeURI(s_line)}/${encodeURI(s_updnline)}`;
   // console.log(realTimePosition_url)
    console.log(`서울시 공공데이터 : ${realarrive_url}`);
    if(line[s_response] === s_line){

    request(
        {
            url: realarrive_url,
            method: "GET",
        },
        function (error, response, body) {
            try {
                console.log("request 시작")
                const obj = JSON.parse(body); // body의 데이터는 string으로 전  송되기 때문에 json형식으로 변환
                if(obj.status != "500"){ // 검색했을때 500이 뜨면 정보가 안나온다.
                    
                        const s_data = obj.realtimeArrivalList; // 필요한 데이터 경로 압축
                        const convert = jsonFile.readFileSync("./static/json/line.json");

                    //열차 불러오는 작업
                    s_data.forEach((data1,index) =>{
                    const subwayLine = data1.subwayId;
                    const arvlMsg3 = data1.arvlMsg3;
                    const recptnDt = data1.recptnDt;
                    const bstatnNm = data1.bstatnNm;
                    const updnLine = data1.updnLine;
                    const trainLineNm = data1.trainLineNm;
                    let btrainNo = data1.btrainNo;
                    const arvlMsg2 = data1.arvlMsg2;

                    
                    // 역코드를 얻기 위한 작업
                    var trainNm = jsonFile.readFileSync("./static/json/reverse_train.json");
                        if(s_line == "1호선"||s_line == "2호선"||s_line == "3호선"||s_line == "4호선"||s_line == "5호선"||s_line == "6호선"||s_line == "7호선"||s_line == "8호선"||s_line == "9호선"){
                            var stationNm = trainNm[s_line][arvlMsg3];
                        }
                        else{
                            var stationNm = null;
                        }
                        
                    if(reverse[s_line] === subwayLine && reverse_updn[s_updnline] === updnLine || line2_updn[s_updnline]===updnLine &&stationNm != undefined){
                        console.log(`${arvlMsg3}역 역명코드${stationNm}`);
                        console.log(data1.updnLine);

                        const subwayId = convert[data1.subwayId];
                        const subwayData = {};
                        if(!subwayData[subwayId]){
                            subwayData[subwayId] = [];
                        }
                        //api 호출한 값 json화
                        let processData={
                            subwayId : subwayLine,
                            trainLineNm : trainLineNm,
                            btrainNo : btrainNo,
                            arvlMsg2 : arvlMsg2,
                            updnLine : updnLine,
                            bstatnNm : bstatnNm
                            
                        }
                       
                                
                        const arr = data1.subwayList.split(","); // 문자열로 저장된 환승 정보를 배열로 변경
                        //1호선 같은 경우 열차번호 앞자리가 0이 들어가기 때문에 급행열차가 아닌 열차 번호를 식별하기 위한 작업
                            let parse_btrainNo = parseInt(btrainNo,10);
                            btrainNo = String(parse_btrainNo);

                        
                        
                        
                        
                        console.log(`btrainNo: ${btrainNo}`);
                        
                        
                        var list = "";
                        arr.forEach(data2=>{
                            list += `${convert[data2]} `;
                        })
                        processData.subwayList = list;
                        const SearchSTNTimeTableByFRCodeService_url = `http://openapi.seoul.go.kr:8088/${key}/json/SearchSTNTimeTableByFRCodeService/1/253/${stationNm}/${getDayOfWeek()}/${s_updnline}/`;

                        console.log(SearchSTNTimeTableByFRCodeService_url);
                        try{
                        if(btrainNo && stationNm != null){    
                        request({
                            url: SearchSTNTimeTableByFRCodeService_url,
                            method: "GET",
                        }, function(err, response, body){
                            if(err){
                                console.error(err);
                            }
                            if(stationNm != null){
                                // 열차가 도착한 역의 시간표 불러오는 request
                                try{
                                    const obj = JSON.parse(body);
                                    const result = obj.SearchSTNTimeTableByFRCodeService.row;
                                    //delay 지연 정보 구현
                                    result.forEach(data2=>{
                                        var train_no = data2.TRAIN_NO;
                                        if(s_line == "1호선"||s_line == "3호선"||s_line == "4호선"||s_line == "9호선"){
                                            train_no = train_no.substring(1);
                                        }
                                        
                                        if(s_line === "2호선"&&btrainNo.charAt(0)=="3"){
                                            btrainNo = btrainNo.replace("3","2");
                                        }
                                        else if(s_line === "2호선"&&btrainNo.charAt(0)=="6"){
                                            btrainNo = btrainNo.replace("6","2");
                                        }
                                        else if(s_line === "2호선"&&btrainNo.charAt(0)=="7"){
                                            btrainNo = btrainNo.replace("7","2");
                                        }
                                        else if(s_line === "2호선"&&btrainNo.charAt(0)=="8"){
                                            btrainNo = btrainNo.replace("8","2");
                                        }
                                        
                                        

                                        if(btrainNo === train_no){
                                            let trainTime = data2.ARRIVETIME;
                                            console.log(trainTime);
                                            let trainDate = new Date("1970-01-01T"+trainTime);
                                            let recptnDate = new Date(recptnDt);
                                            let currentDate = new Date();
                                            recptnDate.setHours(trainDate.getHours(), trainDate.getMinutes(), trainDate.getSeconds());
                                            if(currentDate.getTime() > recptnDate.getTime()){
                                                let timeDiff = currentDate - recptnDate;
                                                let minuesDelayed = Math.floor(timeDiff/(1000*60));
                                                let secondsDelayed = Math.floor((timeDiff % (1000*60))/1000);
                                                if(minuesDelayed>400){
                                                    var delayInfo = `${data2.TRAIN_NO} ${bstatnNm}행 열차 ${data2.SUBWAYSNAME}역 출발 대기중`;
                                                }
                                                else{
                                                    var delayInfo = `${data2.TRAIN_NO} ${bstatnNm}행 열차 ${minuesDelayed}분 ${secondsDelayed}초 지연 운행중`;
                                                }
                                            }
                                            else if(currentDate.getTime() < recptnDate.getTime()){
                                                let timeDiff = recptnDate - currentDate;
                                                let minuesDelayed = Math.floor(timeDiff/(1000*60));
                                                let secondsDelayed = Math.floor((timeDiff % (1000*60))/1000);
                                                var delayInfo = `${data2.TRAIN_NO} ${bstatnNm}행 열차${minuesDelayed}분 ${secondsDelayed}초 조기 운행중`;
                                            }
                                            else if(currentDate.getTime() === recptnDate.getTime()){
                                                var delayInfo = `${data2.TRAIN_NO} ${bstatnNm}행 열차 정시 운행중`;
                                            }
                                            processData.delayInfo = delayInfo;
                                        }

                                        
                                    });
                                    subwayData[subwayId].push(processData);
                                    console.log(processData);
                                    res.render("post", {
                                        result_Data : processData
                                    });
                                    return;   
                                }catch(e){
                                    console.error(`error: ${e}`);
                                }
                            }
                            
                        })}else if(stationNm == null){
                            subwayData[subwayId].push(processData);
                            console.log(processData);
                        }
                        
                    }
                        catch(e){
                            console.log(`request 오류 : ${e}`);
                        }
                        
                            
                        
                        
                        var newHtml = `<br><h1>${subwayId} ${s_response}역 결과입니다.</h1>
                    <div class="result-info">
                    <span>열차 번호:</span> ${data1.btrainNo}<br>
                    <span>열차 방향:</span> ${data1.trainLineNm}<br>
                    <span>열차 위치:</span> ${data1.arvlMsg2}<br>
                    열차 검색 시간은 "${recptnDt}"입니다.</div>`;
                    //res.render("post", {
                    //    result_Data: newHtml
                    //});
                        
                    }
                    //var newHtml =`<br><p style="color:red">"${s_response}"에 대한 검색 결과가 존재하지 않거나 데이터를 가져오는 중에 오류가 발생했습니다.</p>`;
            })
                    
               
            
                }
                else if(obj.realtimeArrivalList.subwayId === undefined){
                    console.log("운행종료");
                }
                else{
                    var newHtml =`<br><p style="color:red">"${s_response}"에 대한 검색 결과가 존재하지 않거나 데이터를 가져오는 중에 오류가 발생했습니다.</p>`;
                    console.log("운행종료");
                }

                
                         
            

                // post페이지로 결과 반환
                


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
}
else{
    console.log(`${s_line}의 ${s_response}역은 없습니다. 다시 검색해주세요.`);
}

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
