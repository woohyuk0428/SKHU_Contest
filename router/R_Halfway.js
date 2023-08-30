const nodeGeocoder = require("node-geocoder");
const axios = require("axios");
const express = require("express");

const router = express.Router();
const apiKey = "AIzaSyDsmoFLqupsLIZtJGrerrEuNkrnW_8NnCI";
const geocoder = nodeGeocoder({
    provider: "google",
    apiKey: apiKey,
});

//http://localhost:8080/halfway 경로로 요청 시 Halfway.html파일 반환
router.get("/", (req, res) => {
    res.render("Halfway");
});

// 중간지점 찾기 버튼 누를 시 주소값 받아 데이터 가공
router.post("/", async (req, res) => {
    let midpoint;
    const data = req.body;
    console.log("받은 데이터:", data);

    // 클라이언트로 보낼 json데이터 구조
    let jsonData = {
        startpoint: [],
        midpoint: {},
        midplaces: { cafe: [], convenience_store: [], library: [], bus_station: [], subway_station: [], restaurant: [] },
    };

    jsonData = await FindStartPoint(data, jsonData); // 받은 주소를 위도, 경도로 변환
    // 오류처리
    if (!jsonData) {
        res.json(null);
        return;
    }

    // 주변 장소를 중간지점으로 선택했는지 여부
    if (data.middata) {
        midpoint = data.middata.address;
    } else {
        midpoint = await FindMidpoint(jsonData.startpoint); // 출발지점들의 위도와 경도를 findMidpoint 함수에 전달하여 중간지점 계산
    }

    const midname = await geocoder.reverse({ lat: midpoint.lat, lon: midpoint.lng }); // 중간지점의 위도 경도를 실제 주소로 변환
    jsonData.midpoint = {
        name: midname[0].formattedAddress,
        address: midpoint,
    };

    jsonData = await PlaceSearch(jsonData, data.range, midpoint); // 중간지점의 근처 장소를 찾아 jsonData에 저장

    res.json(jsonData);
});

// 시작 지점의 위도 경도를 계산하는 함수
async function FindStartPoint(data, jsonData) {
    for (const locationName of data.addresses) {
        try {
            const regionLatLongResult = await geocoder.geocode(locationName); // 위도 경도값 저장

            // 위도 경도를 찾을 수 없을 경우
            if (regionLatLongResult.length === 0) {
                return false;
            }

            const { latitude: lat, longitude: lng } = regionLatLongResult[0]; // 받아온 데이터 가공

            jsonData.startpoint.push({
                index: jsonData.startpoint.length,
                name: locationName,
                address: { lat, lng },
            });
        } catch (error) {
            console.error(`"${locationName}"의 지오코딩 중 오류 발생: ${error.message}`);
            return false;
        }
    }
    return jsonData;
}

// 위도, 경도를 사용해 중간지점을 찾는 함수
async function FindMidpoint(startpoints) {
    // 시작지점의 위도값과 경도값을 각각 더함
    const totalCoordinates = startpoints.reduce((sum, { address: { lat, lng } }) => ({ lat: sum.lat + lat, lng: sum.lng + lng }), { lat: 0, lng: 0 });

    // 중간지점 계산
    const midpoint = {
        lat: totalCoordinates.lat / startpoints.length,
        lng: totalCoordinates.lng / startpoints.length,
    };

    return midpoint;
}

// 중간지점 근처의 장소를 찾는 함수
async function PlaceSearch(jsonData, radius, midpoint) {
    const placetypes = ["cafe", "convenience_store", "library", "bus_station", "subway_station", "restaurant"]; // 근처 장소 타입

    // 근처 장소별로 구글맵 api 검색
    const promises = placetypes.map(async (placeType) => {
        // Place API 요청을 보낼 URL
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${midpoint.lat},${midpoint.lng}&radius=${radius}&type=${placeType}&key=${apiKey}`;

        try {
            const response = await axios.get(apiUrl); // api 호출
            const results = response.data.results; // 필요한 데이터 가공

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

    await Promise.all(promises); // 모든 비동기 작업이 끝난 후 다음 작업으로 넘김
    return jsonData;
}

router.get("/PlacePhoto", async (req, res) => {
    try {
        const placeId = req.query.placeId;
        const photoUrl = await fetchPhotoUrl(placeId);

        if (photoUrl) {
            res.json({ photoUrl });
        } else {
            res.status(404).json({ error: "사진 정보를 찾을 수 없습니다." });
        }
    } catch (error) {
        res.status(500).json({ error: "에러 발생" });
    }
});

// placeId에 맞는 이미지를 가져오는 함수
async function fetchPhotoUrl(placeId) {
    const photoUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`; // 장소의 이미지 리스트 검색

    try {
        const response = await fetch(photoUrl);
        const data = await response.json();

        if (data.status === "OK" && data.result.photos?.length > 0) {
            const photoReference = data.result.photos[0].photo_reference;
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photoreference=${photoReference}&key=${apiKey}`; // 첫번째 이미지 반환
        } else {
            throw new Error("지정된 장소에 대한 사진이 없습니다.");
        }
    } catch (error) {
        console.error("사진 URL을 가져오는 중 오류 발생:", error.message);
        return null;
    }
}

module.exports = router;
