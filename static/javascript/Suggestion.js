const fs = require("fs");
const key_new = "XXsK%2F1XwVTPaVFfkrpoBQapqSlNiziqMMJJRcS549BH3B2gH1ph4mkRwBJgDbI20uZDnt9SiLbsVlFT5%2FAHCBQ%3D%3D";

document.addEventListener("DOMContentLoaded", function () {
    var sug_btn = document.getElementById("sug_btn"); // 명소제안 버튼

    // 중간지점 찾기 버튼을 누를 시 실행
    sug_btn.addEventListener("click", function handleClick() {
        var sug_input = document.querySelector(".sug_inputBox").value;
        // 출발지점이 비어있는지 검사
        if (sug_input === " ") {
            alert("원하는 지하철역명이 입력되지 않았습니다.");
        }

        alert("시작");

        var url_alr = "http://apis.data.go.kr/1613000/SubwayInfoService/getKwrdFndSubwaySttnList";
        var queryParams_alr = "?" + encodeURIComponent("serviceKey") + "=" + key_new; /* Service Key*/
        queryParams_alr += "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /* */
        queryParams_alr += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("10"); /* */
        queryParams_alr += "&" + encodeURIComponent("_type") + "=" + encodeURIComponent("json"); /* */
        queryParams_alr += "&" + encodeURIComponent("subwayStationName") + "=" + encodeURIComponent(sug_input); /* */

        fetch(url_alr + queryParams_alr, {
            method: "GET",
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((result) => fs.writeFileSync("subwayCode.json", result));

        var subwayCode = fs.readFileSync("subwayCode.json", "utf8");
        const subwayCodeParse = JSON.parse(subwayCode);
        const subwayCodeResult = subwayCodeParse["response"]["body"]["items"]["item"];
        var code = "";
        for (i = 0; i < subwayCodeResult.length(); i++) {
            if (subwayCodeResult[i] == sug_input) {
                code = subwayCodeResult[i].subwayStationId;
            }
        }
        var url = "http://apis.data.go.kr/1613000/SubwayInfoService/getSubwaySttnExitAcctoCfrFcltyList";
        var queryParams_sights = "?" + encodeURIComponent("serviceKey") + "=" + key_new; /* Service Key*/
        queryParams_sights += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("100090"); /* */
        queryParams_sights += "&" + encodeURIComponent("_type") + "=" + encodeURIComponent("json"); /* */
        queryParams_sights += "&" + encodeURIComponent("subwayStationId") + "=" + encodeURIComponent(code); /* */

        fetch(url_alr + queryParams_alr, {
            method: "GET",
            body: JSON.stringify({}),
        })
            .then((response) => response.json())
            .then((result) => fs.writeFileSync("test_suggestion.json", result));
        var sug_data = fs.readFileSync("test_suggestion.json", "utf8");

        var sugDataParse = JSON.parse(sug_data);
        var sugDataResult = sugDataParse["response"]["body"]["items"]["item"];

        var ResultArr = [];
        for (i = 0; i < sugDataResult.length(); i++) {
            ResultArr.push(sugDataResult[i].dirDesc);
        }
        for (j = 0; j < ResultArr.length; j++) {
            const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(ResultArr[j])}`;
            fetch(googleSearchUrl)
                .then((response) => response.text())
                .then((html) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const imageElement = doc.querySelector("img");
                    if (imageElement) {
                        const imageUrl = imageElement.getAttribute("src");
                        if (imageUrl) {
                            const imageContainer = document.getElementById("imageContainer");
                            imageContainer.innerHTML = `<td><img src="${imageUrl}"><td>`;
                        } else {
                            alert("검색 결과 이미지를 찾을 수 없습니다.");
                        }
                    } else {
                        alert("검색 결과를 찾을 수 없습니다.");
                    }
                })
                .catch((error) => {
                    alert("오류가 발생했습니다. 다시 시도해주세요.");
                    console.error(error);
                });
        }
    });
});
