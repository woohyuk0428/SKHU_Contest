process.setMaxListeners(60); //Listener 확장을 통해 메모리 누수 방지처리(웹 크롤링에 의한 누수방지)

// const puppeteer = require("puppeteer");
// const axios = require("axios");
const express = require("express"); // express 프레임워크
const request = require("request"); // request 모듈
const cookieParser = require("cookie-parser");
const fs = require("fs"); // fs 모듈
const bodyParser = require("body-parser");

const XMLHttpRequest = require("xhr2");
const jsonfile = require("jsonfile");

const app = express(); //express 객체 생성
const xhr = new XMLHttpRequest();
const today = new Date(); // 서버 오픈 시 기록용 현재 시간 저장

const port = 8080; // 포트 번호 지정
const key = fs.readFileSync("APIKey.txt", "utf8"); // 지하철 API 키값 저장

// #region 파일 경로 지정, 옵션 설정
app.use(express.static("static/image"));
app.use(express.static("static/image/Marker_icon"));
app.use(express.static("static/image/Detail_img"));
app.use(express.static("static/css"));
app.use(express.static("static/javascript"));
app.use(express.static("static/javascript/Halfway_functions"));

app.use(express.json()); // json형태로 body 파싱
app.use(express.urlencoded({ extended: true })); // 파싱 할 때 querystring모듈 사용

app.set("view engine", "ejs"); // 뷰 엔진을 ejs로 설정
app.set("views", "./views"); // 뷰 파일 경로 지정

app.use(cookieParser("SHKU_Cookie")); // 쿠키 시크릿 키 지정
app.use(bodyParser.json());

// app.use(cors());
// #endregion

//서버 오픈시 실행되는 함수. 현재 시간과 함께 서버가 실행됨(Mon Jul 03 2023 21:23:13 GMT+0900 (대한민국 표준시) | server reload)
app.listen(port, () => {
    console.log(`${today} | server reload`);
    console.log("http://localhost:8080/");
});

// #region Get라우팅
app.use("/halfway", require("./router/R_Halfway"));
app.use("/suggestion", require("./router/R_Suggestion"));
app.use("/mapping", require("./router/R_Mapping"));
app.use("/detail", require("./router/R_Detail"));
app.use("/post", require("./router/R_Post"));
app.use("/subway", require("./router/R_Subway"));

//http://localhost:8080/ 경로로 요청 시 Main.html파일 반환
app.get("/", (req, res) => {
    var data = [];
    
    res.render("Main",{
        Data : data,
    });
});
// #endregion

/* ***************** 여기서부터는 지하철 정보를 가져오기 위한 API를 통해 데이터를 Json 형식으로 파일을 제작하는 과정입니다. ******************* */
const key_new = "XXsK%2F1XwVTPaVFfkrpoBQapqSlNiziqMMJJRcS549BH3B2gH1ph4mkRwBJgDbI20uZDnt9SiLbsVlFT5%2FAHCBQ%3D%3D";

//지하철 역 API(new)에서 가져올 데이터
var url = "http://apis.data.go.kr/1613000/SubwayInfoService/getKwrdFndSubwaySttnList"; /*URL*/
var queryParams = "?" + encodeURIComponent("serviceKey") + "=" + key_new; /*Service Key*/
queryParams += "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /*한 번에 데이터들을 가져오기 위해 1페이지로 지정*/
queryParams += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("1063"); /*모든 데이터들을 조회한 경우 1063개로 집계됨*/
queryParams += "&" + encodeURIComponent("_type") + "=" + encodeURIComponent("json"); /**/

console.log(url + queryParams);
request(
    {
        url: url + queryParams,
        method: "GET",
    },
    function (error, response, body) {
        fs.writeFileSync("test_new.json", body);
        // console.log("Status", response.statusCode);
        // console.log("Headers", JSON.stringify(response.headers));
        // console.log("Reponse received", body);
    }
);

/* ***************** 여기서부터는 지하철 출구 근처의 명소 내역을 가져오기 위한 API를 통해 데이터를 Json 형식으로 파일을 제작하는 과정입니다. ******************* */

/*************** 여기서부터는 명소를 찾은 결과를 통해 Google에서 웹크롤링하여 결과(사진)를 반환하는 코드입니다. *********/
// var sightsData = fs.readFileSync("test_sights.json", "utf8");
// var sightsDataParse = JSON.parse(sightsData);
// var sightsDataResultTmp = sightsDataParse["response"]["body"]["items"]["item"];

// var ResultArr = [];
// for(i=0; i<sightsDataResultTmp.length; i++) {
//     ResultArr.push(sightsDataResultTmp[i].dirDesc);
// }

// for(i=0; i<sightsDataResultTmp.length; i++) {

//     (async () => {
//         const searchTerm = ResultArr[i] + " 건물"; // 검색어
//         const browser = await puppeteer.launch({ headless: true }); // headless 모드를 true로 설정하면 브라우저가 실제로 실행되지 않습니다.
//         const page = await browser.newPage();

//         // Google 이미지 검색 페이지로 이동
//         await page.goto(`https://www.google.com/search?q=${searchTerm}&tbm=isch`);

//         // 이미지 로드를 위해 적절한 시간 대기 (충분한 시간을 주어야 할 수 있습니다.)
//         await page.waitForTimeout(2500);

//         // 첫 번째 이미지 선택
//         const firstImage = await page.evaluate(() => {
//           const imgElement = document.querySelector('.rg_i');
//           return imgElement ? imgElement.src : null;
//         });
//         const response = await axios.get(firstImage, { responseType: 'arraybuffer' });
//         const imageBuffer = Buffer.from(response.data, 'binary');
//         fs.writeFileSync("image/" + searchTerm + ".png", imageBuffer);
//         await browser.close();
//       })();

// }
