const express = require("express"); // express 프레임워크
const router = express.Router();

//http://localhost:8080/suggestion 경로로 요청 시 Suggestion.html파일 반환
router.get("/", (req, res) => {
    res.render("Suggestion");
});

module.exports = router;
