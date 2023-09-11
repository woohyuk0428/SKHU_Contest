const express = require("express"); // express 프레임워크
const router = express.Router();

//http://localhost:8080/mapping 경로로 요청 시 Mapping.html파일 반환
router.get("/", (req, res) => {
    res.render("Mapping");
});

router.post("/", (req, res) => {
    console.log(req.body);
    const { latitude, longitude } = req.body;
    console.log(latitude, longitude);

    res.json({ lat: latitude, lng: longitude }); //todo render가 없는 파일을 찾고 있어서 json데이터로 수정했습니다.
});

module.exports = router;