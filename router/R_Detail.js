const express = require("express"); // express 프레임워크
const router = express.Router();

//http://localhost:8080/detail 경로로 요청 시 Detail.html파일 반환
router.get("/", (req, res) => {
    res.render("Detail");
});

module.exports = router;
