const express = require("express"); // express 프레임워크
const router = express.Router();

//http://localhost:8080/mapping 경로로 요청 시 Mapping.html파일 반환
router.get("/", (req, res) => {
    res.render("Mapping");
});

router.post("/", (req, res) => {
    const { latitude, longitude } = req.body;
    console.log(latitude, longitude);

    res.render("s");
    
});

module.exports = router;
