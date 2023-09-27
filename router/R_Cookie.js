const express = require("express"); // express 프레임워크
const router = express.Router();
const request = require("request"); // request 모듈
const fs = require("fs"); // fs 모듈

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

    res.render("Subway", {
        result_Data: "",
        before_Data: before,
    });
});

router.post("/", (req, res) => {
    var s_response = req.body.station.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, ""); // XSS 공격 방어
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
    try{
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
}catch(e){
    console.error(error);
                if (req.cookies.My_Station == undefined) {
                    var before = []; // 쿠키가 없으면 빈 배열을 반환
                } else {
                    var before = req.cookies.My_Station; // 쿠키가 있다면 쿠키값을 반환
                    Array.isArray(before) ? null : (before = [before]); // 값이 1개면 문자열을 배열로 변경
                }

                res.render("subway", {
                    result_Data: `<br><p style="color:red">"${s_response}"에 대한 검색 결과가 존재하지 않거나 데이터를 가져오는 중에 오류가 발생했습니다.</p>`,
                    before_Data: before,
                });
}
})