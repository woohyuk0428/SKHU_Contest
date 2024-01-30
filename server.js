process.setMaxListeners(60); //Listener 확장을 통해 메모리 누수 방지처리(웹 크롤링에 의한 누수방지)

// const puppeteer = require("puppeteer");
// const axios = require("axios");
const express = require("express"); // express 프레임워크
const request = require("request"); // request 모듈
const cookieParser = require("cookie-parser");
const fs = require("fs"); // fs 모듈
const bodyParser = require("body-parser");
const requestIp = require("request-ip");
const XMLHttpRequest = require("xhr2");
const jsonfile = require("jsonfile");
const https = require(`https`);
const options = {
    key: fs.readFileSync('./secure/ssl/www.skhuroad.com_2023102536955.key.pem'),
    cert: fs.readFileSync('./secure/ssl/www.skhuroad.com_2023102536955.crt.pem'),
    ca: fs.readFileSync('./secure/ssl/www.skhuroad.com_2023102536955.unified.crt.pem'),
    minVersion: "TLSv1.2"
};
//해외 ip 차단
const geoip = require('geoip-lite');
const app = express(); //express 객체 생성
const xhr = new XMLHttpRequest();
const today = new Date(); // 서버 오픈 시 기록용 현재 시간 저장


const port = process.env.PORT || 8080; // 포트 번호 지정
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


// #region Get라우팅
app.use("/halfway", require("./router/R_Halfway"));
app.use("/suggestion", require("./router/R_Suggestion"));
app.use("/mapping", require("./router/R_Mapping"));
app.use("/detail", require("./router/R_Detail"));
//app.use("/post", require("./router/R_Post"));
app.use("/Subway", require("./router/R_Subway"));
app.use((req, res, next) => {
    const ip = req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
  
    if (geo && geo.country !== 'KR') { 
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Foridden');
      console.log(`${new Date()}\n해외 ip: ${requestIp.getClientIp(req).substring(7)}차단 성공`);
    } else {
      next();
    }
  });
app.get("/", (req, res) => {
    console.log(`${new Date}\n접속한 클라이언트 IP: ${requestIp.getClientIp(req).substring(7)}`);
    res.render("Main");
});
const server = https.createServer(options, app);
//http://localhost:8080/ 경로로 요청 시 Main.html파일 반환

// #endregion
server.listen(port, () => {
    console.log(`${today} | server reload`);
    console.log(`success open https://www.skhuroad.com`);
});
