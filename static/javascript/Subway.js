document.getElementById("SubwayForm").addEventListener("submit", function (event) {
    event.preventDefault(); // 폼 제출 기본 동작을 막음

    var a_subwayLine = document.getElementById("SubwayLine").value;
    var a_updnLine = document.getElementById("updnLine").value;
    var a_response = document.getElementById("station").value;
    console.log(a_response);
    let url = "http://www.skhuroad.com/Subway";
    //let dns = "http://www.skhuload.com/Subway";
    //let dns2 = "http://www.skhuload.com:8080/Subway";
    var data = { response: a_response, subwayLine: a_subwayLine, updnLine: a_updnLine }; // 보낼 데이터를 객체로 정의
    console.log(data);
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
            console.log(a_subwayLine);
            console.log(data.Status);
            if (data.Status == 200) {
                let resurt_tag;
                // if (a_subwayLine == "1호선") {
                //     resurt_tag = "1";
                // } else if (a_subwayLine == "2호선") {
                //     resurt_tag = "2";
                // } else if (a_subwayLine == "3호선") {
                //     resurt_tag = "3";
                // } else if (a_subwayLine == "4호선") {
                //     resurt_tag = "4";
                // } else if (a_subwayLine == "5호선") {
                //     resurt_tag = "5";
                // } else if (a_subwayLine == "6호선") {
                //     resurt_tag = "6";
                // } else if (a_subwayLine == "7호선") {
                //     resurt_tag = "7";
                // } else if (a_subwayLine == "8호선") {
                //     resurt_tag = "8";
                // } else if (a_subwayLine == "9호선") {
                //     resurt_tag = "9";
                // } else if (a_subwayLine == "경의중앙선") {
                //     resurt_tag = "gj";
                // } else if (a_subwayLine == "경춘선") {
                //     resurt_tag = "gc";
                // } else if (a_subwayLine == "공항철도") {
                //     resurt_tag = "ar";
                // } else if (a_subwayLine == "서해선") {
                //     resurt_tag = "sh";
                // } else if (a_subwayLine == "수인분당선") {
                //     resurt_tag = "sb";
                // } else if (a_subwayLine == "신분당선") {
                //     resurt_tag = "ssb";
                // } else if (a_subwayLine == "우이신설선") {
                //     resurt_tag = "ui";
                // }
                switch(a_subwayLine){
                    case "1호선": resurt_tag = "1"; break;
                    case "2호선": resurt_tag = "2"; break;
                    case "3호선": resurt_tag = "3"; break;
                    case "4호선": resurt_tag = "4"; break;
                    case "5호선": resurt_tag = "5"; break;
                    case "6호선": resurt_tag = "6"; break;
                    case "7호선": resurt_tag = "7"; break;
                    case "8호선": resurt_tag = "8"; break;
                    case "9호선": resurt_tag = "9"; break;
                    case "경의중앙선": resurt_tag = "gj"; break;
                    case "경춘선": resurt_tag = "gc"; break;
                    case "공항철도": resurt_tag = "ar"; break;
                    case "서해선": resurt_tag = "sh"; break;
                    case "수인분당선": resurt_tag = "sb"; break;
                    case "신분당선": resurt_tag = "ssb"; break;
                    case "우이신설선": resurt_tag = "ui"; break;
                }
                console.log(resurt_tag);
                let leftcon = document.getElementById("leftcon");
                let midcon = document.getElementById("midcon");
                let rightcon = document.getElementById("ringthcon");
                let resultSubway = document.getElementById("resultSubway");
                
                leftcon.classList.remove("subway-line1", `lineNum_${resurt_tag}`); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.remove("subway-line-con", `lineNum_${resurt_tag}`);
                rightcon.classList.remove("subway-line2", `lineNum_${resurt_tag}`);
                
                leftcon.classList.add("subway-line1", `lineNum_${resurt_tag}`); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", `lineNum_${resurt_tag}`);
                rightcon.classList.add("subway-line2", `lineNum_${resurt_tag}`);
                resultSubway.classList.remove("resultSubway");
                //-----------------------------------
                const result = data.body;
                let subwayId = document.getElementById("subwayId");
                let stationNm = document.getElementById("stationNm");
                stationNm.innerHTML = a_response;
                subwayId.innerHTML = a_subwayLine;

                const subway_group = document.getElementsByClassName("subway_text_group");
                let s_Template = "";
                subway_group[0].innerHTML = "";
                result.forEach((subway) => {
                    let s_trainLineNm = subway.trainLineNm;
                    let s_bstatnNm = subway.bstatnNm;
                    let s_delayinfo = subway.delayInfo;
                    let s_position = subway.Position;
                    let s_arvlMsg2 = subway.arvlMsg2;
                    let s_btrainNo = subway.btrainNo;
                    let s_subwayList = subway.subwayList;

                    s_Template = `
                    <div class="subway-time-info">
                        <p><span id="btrainNo">${s_btrainNo}</span> <span id="bstatnNm">${s_trainLineNm}</span>: <span id="arvlMsg2">${s_arvlMsg2}</span></p>
                        <p>위치: <span id="position">${s_position}</span></p>
                        <p>지연정보 :<span id="delayinfo">${s_delayinfo}</span></p>
                        <p>환승정보: <span id="subwayinfo">${s_subwayList}</span></p>

                    </div>`;

                    subway_group[0].insertAdjacentHTML("beforeend", s_Template);
                });
            } else if (data == 400) {
                alert(`${a_subwayLine}에 ${a_response}은 없습니다. 다시 검색해주세요.`);
            } else if (data == 500) {
                alert(`${a_response}역의 운행이 종료되었습니다.`);
            }

            {
                /* <div class="subway-line-con lineNum_1">
            <div id=subwayId class="line-info">호선 정보</div>
            <div id="stationNm" class="station-info">현재 역</div>
            <div id="btrainNo class="subway-num">열차 번호</div>
        </div>

        <div id="trainLineNm" class="subway-line2 lineNum_1">행선지</div><br>
    <div class="subway-time-info">
        <div>위치 :<span id="position"></span></div>
        <div>도착예정: <span id="arvlMsg2"></span></div>
        <div>지연정보 :<span id="delayinfo"></span></div>
    </div> */
            }
        })
        .catch((error) => {
            // 오류 처리
            console.error("Error:"+error);
        });
});
