const nodeGeocoder = require("node-geocoder");
const axios = require("axios");
const express = require("express");
const requestIp = require("request-ip");
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
    console.log(`접속한 클라이언트 IP: ${requestIp.getClientIp(req).substring(7)}`);
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

    let mid_point_lat = 0;
    let mid_point_lng = 0;
    let count = 0;
    let plc_len = 0;
    do {
        console.log(count);
        const plc = jsonData.midplaces;

        if ((count - 1) % 5 == 0 && count != 1) {
            // console.log("중간지점 초기화 진행");
            jsonData.midpoint.address.lat = mid_point_lat;
            jsonData.midpoint.address.lng = mid_point_lng;
        }

        if (count <= 2 && count != 0) {
            jsonData.midpoint.address.lat += 0.025;
            jsonData.midpoint.address.lng += 0.025;
            // console.log("1.", jsonData.midpoint.address.lat, jsonData.midpoint.address.lng);
        } else if (count <= 4 && count > 2) {
            jsonData.midpoint.address.lat += 0.025;
            jsonData.midpoint.address.lng -= 0.025;
            // console.log("2.", jsonData.midpoint.address.lat, jsonData.midpoint.address.lng);
        } else if (count <= 6 && count > 4) {
            jsonData.midpoint.address.lat -= 0.025;
            jsonData.midpoint.address.lng -= 0.025;
            // console.log("3.", jsonData.midpoint.address.lat, jsonData.midpoint.address.lng);
        } else if (count <= 8 && count > 6) {
            jsonData.midpoint.address.lat -= 0.025;
            jsonData.midpoint.address.lng += 0.025;
            // console.log("4.", jsonData.midpoint.address.lat, jsonData.midpoint.address.lng);
        }

        if (count > 8) {
            // console.log("중간지점 못찾음");
            break;
        }

        const midname = await geocoder.reverse({ lat: midpoint.lat, lon: midpoint.lng }); // 중간지점의 위도 경도를 실제 주소로 변환
        jsonData.midpoint = {
            name: midname[0].formattedAddress,
            address: midpoint,
        };

        if (count == 0) {
            // console.log("중간지점 저장");
            mid_point_lat = jsonData.midpoint.address.lat;
            mid_point_lng = jsonData.midpoint.address.lng;
        }

        jsonData = await PlaceSearch(jsonData, data.range, midpoint); // 중간지점의 근처 장소를 찾아 jsonData에 저장
        for (const key in plc) {
            plc_len += plc[key].length;
        }

        count++;
    } while (plc_len == 0);

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
    console.log("실행");
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
