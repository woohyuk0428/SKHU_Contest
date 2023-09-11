const nodeGeocoder = require("node-geocoder");
const axios = require("axios");
const express = require("express");

const router = express.Router();
const apiKey = "AIzaSyDsmoFLqupsLIZtJGrerrEuNkrnW_8NnCI";
const geocoder = nodeGeocoder({
    provider: "google",
    apiKey: apiKey,
});

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

// 중간지점 찾기 버튼 누를 시 주소값 받아 데이터 가공
router.post("/data", async (req, res) => {
    const data = req.body;
    console.log("받은 데이터:", data);

    // 클라이언트로 보낼 json데이터 구조
    let jsonData = {
        startpoint: [],
        endpoint: [],
        places: { cafe: [], convenience_store: [], library: [], bus_station: [], subway_station: [], restaurant: [] },
    };

    jsonData = await FindEndPoint(data, jsonData); // 받은 주소를 위도, 경도로 변환

    // 오류처리
    if (!jsonData) {
        res.json(null);
        return;
    }

    const startname = await geocoder.reverse({ lat: data.startpoint.lat, lon: data.startpoint.lng }); // 중간지점의 위도 경도를 실제 주소로 변환
    jsonData.startpoint = {
        name: startname[0].formattedAddress,
        address: data.startpoint,
    };

    jsonData = await PlaceSearch(jsonData, data.range, jsonData.endpoint[0]); // 중간지점의 근처 장소를 찾아 jsonData에 저장

    res.json(jsonData);
});

// 도착 지점의 위도 경도를 계산하는 함수
async function FindEndPoint(data, jsonData) {
    try {
        console.log(data.addresses);
        const regionLatLongResult = await geocoder.geocode(data.addresses); // 위도 경도값 저장
        console.log(regionLatLongResult);
        // 위도 경도를 찾을 수 없을 경우
        if (regionLatLongResult.length === 0) {
            return false;
        }

        const { latitude: lat, longitude: lng } = regionLatLongResult[0]; // 받아온 데이터 가공

        jsonData.endpoint.push({
            index: jsonData.endpoint.length,
            name: data.addresses,
            address: { lat, lng },
        });
    } catch (error) {
        console.error(`도착 지점 지오코딩 중 오류 발생: ${error.message}`);
        return false;
    }

    return jsonData;
}

// 중간지점 근처의 장소를 찾는 함수
async function PlaceSearch(jsonData, radius, endpoint) {
    const placetypes = ["cafe", "convenience_store", "library", "bus_station", "subway_station", "restaurant"]; // 근처 장소 타입

    // 근처 장소별로 구글맵 api 검색
    const promises = placetypes.map(async (placeType) => {
        // Place API 요청을 보낼 URL
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${endpoint.address.lat},${endpoint.address.lng}&radius=${radius}&type=${placeType}&key=${apiKey}`;

        try {
            const response = await axios.get(apiUrl); // api 호출
            const results = response.data.results; // 필요한 데이터 가공

            if (results && results.length > 0) {
                results.forEach((place, idx) => {
                    jsonData.places[placeType].push({
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

    await Promise.all(promises); // 모든 비동기 작업이 끝난 후 다음 작업으로 넘김
    return jsonData;
}

router.get("/PlacePhoto", async (req, res) => {
    const placeId = req.query.placeId;

    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(placeId)}`;

    try {
        const response = await fetch(url);
        const html = await response.text();
        res.json({ Html: html });
    } catch (error) {
        console.error("html을 가져올 수 없습니다. :", error);
    }
});

module.exports = router;
