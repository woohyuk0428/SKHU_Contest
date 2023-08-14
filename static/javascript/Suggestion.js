document.addEventListener("DOMContentLoaded", function () {
    var sug_btn = document.getElementById("sug_btn"); // 명소제안 버튼

    // 중간지점 찾기 버튼 을 누를 시 실행
    sug_btn.addEventListener("click", function handleClick() {
        var sug_input = document.querySelector(".sug_inputBox").value;

        var sug_input_arr = sug_input.split(" ");
        // 출발지점이 비어있는지 검사
        if (sug_input.trim() === "") {
            alert("원하는 지하철역명이 입력되지 않았습니다.");
            return;
        }

        alert("시작");

        var key_new = "XXsK%2F1XwVTPaVFfkrpoBQapqSlNiziqMMJJRcS549BH3B2gH1ph4mkRwBJgDbI20uZDnt9SiLbsVlFT5%2FAHCBQ%3D%3D";

        var url_alr = "http://apis.data.go.kr/1613000/SubwayInfoService/getKwrdFndSubwaySttnList";
        var queryParams_alr = "?" + encodeURIComponent("serviceKey") + "=" + key_new;
        queryParams_alr += "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1");
        queryParams_alr += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("10");
        queryParams_alr += "&" + encodeURIComponent("_type") + "=" + encodeURIComponent("json");
        queryParams_alr += "&" + encodeURIComponent("subwayStationName") + "=" + encodeURIComponent(sug_input_arr[0]);

        console.log("1번째 api 주소:" + url_alr + queryParams_alr);

        var xhr_alr = new XMLHttpRequest();
        xhr_alr.open('GET', url_alr + queryParams_alr);
        xhr_alr.onreadystatechange = function () {
            if (xhr_alr.readyState === 4) {

                    var result = JSON.parse(xhr_alr.responseText);
                    var sugDataResult = result["response"]["body"]["items"]["item"];
                    console.log("1번째 api 결과값: " + JSON.stringify(sugDataResult));

                    var code = "";
                    for (i = 0; i < sugDataResult.length; i++) {
                        if ((sugDataResult[i]["subwayStationName"] === sug_input_arr[0]) &&
                        (sugDataResult[i]["subwayRouteName"] === sug_input_arr[1])) {
                            code = sugDataResult[i]["subwayStationId"];
                            break;
                        }
                    }

                    console.log("2번째 api에서 검색할 코드: " + code);
                    var xhr_sights = new XMLHttpRequest();
                    var url_sights = "http://apis.data.go.kr/1613000/SubwayInfoService/getSubwaySttnExitAcctoCfrFcltyList";
                    var queryParams_sights = "?" + encodeURIComponent("serviceKey") + "=" + "XXsK%2F1XwVTPaVFfkrpoBQapqSlNiziqMMJJRcS549BH3B2gH1ph4mkRwBJgDbI20uZDnt9SiLbsVlFT5%2FAHCBQ%3D%3D";
                    queryParams_sights += "&" + encodeURIComponent("_type") + "=" + encodeURIComponent("json");
                    queryParams_sights += "&" + encodeURIComponent("subwayStationId") + "=" + encodeURIComponent(`${code}`);

                    console.log("2번째 api 주소: " + JSON.stringify(url_sights + queryParams_sights));


                    xhr_sights.onreadystatechange = function () {
                        if (xhr_sights.readyState === 4) {

                                var result = JSON.parse(this.responseText);
                                console.log("2번째 api 결과값: " + JSON.stringify(result));
                                // var sugDataResult = result["response"]["body"]["items"]["item"];

                                // var ResultArr = [];
                                // for (i = 0; i < sugDataResult.length; i++) {
                                //     ResultArr.push(sugDataResult[i]["dirDesc"]);
                                // }

                                var ResultArr = ["서울역"];

                                var imageContainer = document.getElementById("imageContainer");
                                imageContainer.innerHTML = "";

                                for (j = 0; j < ResultArr.length; j++) {
                                    const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(ResultArr[j])}`;
                                    var xhr_image = new XMLHttpRequest();
                                    xhr_image.onreadystatechange = function () {
                                        if (xhr_image.readyState === 4) {
                                            if (xhr_image.status === 200) {
                                                var parser = new DOMParser();
                                                var doc = parser.parseFromString(xhr_image.responseText, "text/html");
                                                var imageElement = doc.querySelector("img");
                                                if (imageElement) {
                                                    var imageUrl = imageElement.getAttribute("src");
                                                    if (imageUrl) {
                                                        imageContainer.innerHTML += `<img src="${imageUrl}">`;
                                                    } else {
                                                        alert("검색 결과 이미지를 찾을 수 없습니다.");
                                                    }
                                                } else {
                                                    alert("검색 결과를 찾을 수 없습니다.");
                                                }
                                            } else {
                                                alert("이미지 요청에 실패했습니다.");
                                            }
                                        }
                                    };
                                    xhr_image.open("GET", googleSearchUrl);
                                    xhr_image.send();
                                }

                        }
                    };
                    xhr_sights.open("GET", url_sights + queryParams_sights);
                    xhr_sights.send();

            }
        };
        xhr_alr.open("GET", url_alr + queryParams_alr);
        xhr_alr.send();
    });
});
