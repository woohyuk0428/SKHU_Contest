const nodeGeocoder = require("node-geocoder");
const axios = require("axios");
const express = require("express");
const router = express.Router();

const apiKey = "AIzaSyDsmoFLqupsLIZtJGrerrEuNkrnW_8NnCI";
const options = {
    provider: "google",
    apiKey: apiKey,
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

    var jsonData = {
        startpoint: [],
        midpoint: {},
        midplaces: { cafe: [], convenience_store: [], library: [], bus_station: [], subway_station: [], restaurant: [] },
    };

    var data_count = 0;
    var findMid_startaddress = [];
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

        jsonData.startpoint.push({
            index: data_count++,
            name: locationName,
            address: {
                lat: isLat,
                lng: isLng,
            },
        });
        findMid_startaddress.push({ lat: isLat, lng: isLng });
    }

    // 출발지점들의 위도와 경도를 findMidpoint 함수에 전달하여 중간지점 계산
    const midpoint = await findMidpoint(findMid_startaddress);
    const midname = await geocoder.reverse({ lat: midpoint.lat, lon: midpoint.lng });
    jsonData.midpoint = {
        name: midname[0].formattedAddress,
        address: midpoint,
    };

    const placetypes = ["cafe", "convenience_store", "library", "bus_station", "subway_station", "restaurant"];
    jsonData = await PlaceSearch(jsonData, placetypes, data.range, midpoint, apiKey);

    // console.log(jsonData);
    res.json(jsonData);
});

// 위도, 경도를 사용해 중간지점을 찾는 함수
async function findMidpoint(locations) {
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

// 중간지점 근처의 장소를 찾는 함수
async function PlaceSearch(jsonData, placetypes, radius, midpoint, apiKey) {
    const promises = placetypes.map(async (placeType) => {
        // Place API 요청을 보낼 URL
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${midpoint.lat},${midpoint.lng}&radius=${radius}&type=${placeType}&key=${apiKey}`;
        console.log(apiUrl);

        try {
            const response = await axios.get(apiUrl);
            const results = response.data.results;

            if (results && results.length > 0) {
                results.forEach((place, idx) => {
                    jsonData.midplaces[placeType].push({
                        index: idx,
                        id: place.place_id,
                        name: place.name,
                        address: {
                            lat: place.geometry.location.lat,
                            lng: place.geometry.location.lng,
                        },
                        opening: place.opening_hours?.open_now,
                        types: place.types,
                        rating: place.rating,
                        vicinity: place.vicinity,
                    });
                });
            } else {
                console.log(`${placeType} 검색 결과 없음`);
            }
        } catch (error) {
            console.error("오류 발생: ", error);
        }
    });

    await Promise.all(promises);
    return jsonData;
}

router.get("/PlacePhoto", async (req, res) => {
    const placeId = req.query.placeId;

    const photoUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
    console.log(photoUrl);
    try {
        const response = await fetch(photoUrl);
        const data = await response.json();

        if (data.status === "OK" && data.result.photos && data.result.photos.length > 0) {
            const photoReference = data.result.photos[0].photo_reference;
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photoreference=${photoReference}&key=${apiKey}`;
            res.json({ photoUrl });
        } else {
            res.status(404).json({ error: "사진 정보를 찾을 수 없습니다." });
        }
    } catch (error) {
        res.status(500).json({ error: "에러 발생" });
    }
});

module.exports = router;
