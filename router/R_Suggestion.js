const express = require("express"); // express 프레임워크
const router = express.Router();

//http://localhost:8080/suggestion 경로로 요청 시 Suggestion.html파일 반환
router.get("/", (req, res) => {
    res.render("Suggestion");
});

router.get("/PlacePhoto", async (req, res) => {
    const placeId = req.query.placeId;


    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(placeId)}`;

    async function fetchHtml() {
        try {
            const response = await fetch(url);
            const html = await response.text();
            // console.log({ Html: html }); // 여기서는 콘솔에 출력, 변수에 저장하려면 이 부분 수정
            res.json({ Html: html });
        } catch (error) {
            console.error("Error fetching HTML:", error);
        }
    }

    fetchHtml();
});

module.exports = router;
