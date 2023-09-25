document.getElementById("SubwayForm").addEventListener("submit", function (event) {
    event.preventDefault(); // 폼 제출 기본 동작을 막음

    var a_subwayLine = document.getElementById("SubwayLine").value;
    var a_updnLine = document.getElementById("updnLine").value;
    var a_response = document.getElementById("station").value;

    let url = "http://localhost:8080/Subway";
    var data = { response: a_response, subwayLine: a_subwayLine, updnLine: a_updnLine }; // 보낼 데이터를 객체로 정의

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
            const obj = data.body;
            if (data.Status == 200) {
                let subwayId = document.getElementById("subwayId");
                let stationNm = document.getElementById("stationNm");
                let btrainNo = document.getElementById("btrainNo");
                let position = document.getElementById("position");
                let arvlMsg2 = document.getElementById("arvlMsg2");
                let delayinfo = document.getElementById("delayinfo");
                stationNm.innerHTML = a_response;
                subwayId.innerHTML = a_subwayLine;

                obj.forEach(subway => {
                    let s_delayinfo = subway.delayInfo;
                    let s_position = subway.Position;
                    let s_arvlMsg2 = subway.arvlMsg2;
                    let s_btrainNo = subway.btrainNo;
                    btrainNo.innerHTML = s_btrainNo;
                    delayinfo.innerHTML = s_delayinfo;
                    position.innerHTML = s_position;
                    arvlMsg2.innerHTML = s_arvlMsg2;
                });
            }
            else if (data.Status == 400) {
                alert(`${a_subwayLine}의 ${a_response}역은 없습니다. 다시 검색해주세요.`)
            }
            else if(data.Status == 500){
                alert(`${a_response}역의 운행이 종료되었습니다.`);
            }
            if (data.Status == 200) {
            if (a_subwayLine == "1호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_1"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_1");
                rightcon.classList.add("subway-line2", "lineNum_1");
                let rmresultSubway = document.getElementsByClassName("resultSubway");
                rmresultSubway.classList.remove("resultSubway");
            }
            else if (a_subwayLine == "2호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_2"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_2");
                rightcon.classList.add("subway-line2", "lineNum_2");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "3호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_3"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_3");
                rightcon.classList.add("subway-line2", "lineNum_3");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "4호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_4"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_4");
                rightcon.classList.add("subway-line2", "lineNum_4");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "5호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_5"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_5");
                rightcon.classList.add("subway-line2", "lineNum_5");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "6호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_6"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_6");
                rightcon.classList.add("subway-line2", "lineNum_6");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "7호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_7"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_7");
                rightcon.classList.add("subway-line2", "lineNum_7");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "8호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_8"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_8");
                rightcon.classList.add("subway-line2", "lineNum_8");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "9호선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_9"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_9");
                rightcon.classList.add("subway-line2", "lineNum_9");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "경의중앙선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_gj"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_gj");
                rightcon.classList.add("subway-line2", "lineNum_gj");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "경춘선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_gc"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_gc");
                rightcon.classList.add("subway-line2", "lineNum_gc");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "공항철도") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_ar"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_ar");
                rightcon.classList.add("subway-line2", "lineNum_ar");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "서해선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_sh"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_sh");
                rightcon.classList.add("subway-line2", "lineNum_sh");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "수인분당선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_sb"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_sb");
                rightcon.classList.add("subway-line2", "lineNum_sb");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "신분당선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_ssb"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_ssb");
                rightcon.classList.add("subway-line2", "lineNum_ssb");
                rmresultSubway.classList.remove("resultSubway");

            }
            else if (a_subwayLine == "우이신설선") {
                let leftcon = document.getElementById('leftcon');
                let midcon = document.getElementById('midcon');
                let rightcon = document.getElementById('trainLineNm');
                leftcon.classList.add("subway-line1", "lineNum_ui"); // 여러 클래스를 추가할 때는 ,를 사용합니다
                midcon.classList.add("subway-line-con", "lineNum_ui");
                rightcon.classList.add("subway-line2", "lineNum_ui");
                rmresultSubway.classList.remove("resultSubway");

            }}


            {/* <div class="subway-line-con lineNum_1">
            <div id=subwayId class="line-info">호선 정보</div>
            <div id="stationNm" class="station-info">현재 역</div>
            <div id="btrainNo class="subway-num">열차 번호</div>
        </div>

        <div id="trainLineNm" class="subway-line2 lineNum_1">행선지</div><br>
    <div class="subway-time-info">
        <div>위치 :<span id="position"></span></div>
        <div>도착예정: <span id="arvlMsg2"></span></div>
        <div>지연정보 :<span id="delayinfo"></span></div>
    </div> */}
        })
        .catch((error) => {
            // 오류 처리
            console.error("Error:", error);
        });
});
