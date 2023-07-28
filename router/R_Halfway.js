const nodeGeocoder = require("node-geocoder");
const express = require("express");
const router = express.Router();

const options = {
    provider: "google",
    apiKey: "AIzaSyDsmoFLqupsLIZtJGrerrEuNkrnW_8NnCI",
};
const geocoder = nodeGeocoder(options);

//http://localhost:8080/halfway 경로로 요청 시 Halfway.html파일 반환
router.get("/", (req, res) => {
    res.render("Halfway");
});

// 중간지점 찾기 버튼 누를 시 주소값 받아 데이터 가공
router.post("/", async (req, res) => {
    const data = req.body;
    console.log("받은 데이터:", data);

    const start = {
        name: [],
        address: [],
        midpoint: {},
    };

    // 받은 주소를 위도, 경도로 변환
    for (const locationName of data.addresses) {
        const regionLatLongResult = await geocoder.geocode(locationName);

        // 해당 주소에 대한 정보를 찾을 수 없을 경우 빈 배열을 반환
        if (regionLatLongResult.length == 0) {
            res.json([]);
            return;
        }

        const isLat = regionLatLongResult[0].latitude; // 위도
        const isLng = regionLatLongResult[0].longitude; // 경도

        start.name.push(locationName);
        start.address.push({
            lat: isLat,
            lng: isLng,
        });
    }

    // 위도, 경도를 사용해 중간지점을 찾는 함수
    function findMidpoint(locations) {
        let totalLat = 0;
        let totalLng = 0;

        // 출발지점들의 위도와 경도를 합산
        for (const location of locations) {
            totalLat += location.lat;
            totalLng += location.lng;
        }

        // 합산된 위도와 경도를 출발지점의 개수로 나누어서 중간지점 계산
        const midpointLat = totalLat / locations.length;
        const midpointLng = totalLng / locations.length;

        return { lat: midpointLat, lng: midpointLng };
    }

    // 출발지점들의 위도와 경도를 findMidpoint 함수에 전달하여 중간지점 계산
    const midpoint = findMidpoint(start.address);
    start.midpoint = midpoint;

    console.log(start);
    res.json(start);
});

module.exports = router;
