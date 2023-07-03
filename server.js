const express = require("express");
const app = express();
const port = 8080;
const today = new Date(); //서버 오픈 시 기록용 현재 시간 저장

//서버 오픈시 실행되는 함수. 현재 시간과 함께 서버가 실행됨(Mon Jul 03 2023 21:23:13 GMT+0900 (대한민국 표준시) | server reload)
app.listen(port, () => {
    console.log(`${today} | server reload`);
});

//http://localhost:8080/ 경로로 요청 시 Main.html파일 반환
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/template/Main.html");
});

//http://localhost:8080/halfway 경로로 요청 시 Main.html파일 반환
app.get("/halfway", (req, res) => {
    res.sendFile(__dirname + "/template/Halfway.html");
});

//http://localhost:8080/mapping 경로로 요청 시 Main.html파일 반환
app.get("/mapping", (req, res) => {
    res.sendFile(__dirname + "/template/Mapping.html");
});

//http://localhost:8080/suggestion 경로로 요청 시 Main.html파일 반환
app.get("/suggestion", (req, res) => {
    res.sendFile(__dirname + "/template/Suggestion.html");
});
