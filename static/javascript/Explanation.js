const ex_help_btn = document.getElementById("helpBtn");
const ex_help_panel = document.querySelector(".bg_panel");
const ex_help_Xbtn = document.querySelector(".ex_X-btn");
const ex_close_panel = document.querySelector(".close_panel");

let nav_opt_on = document.querySelector(".nav-opt.on");

// help 버튼을 눌렀을 때 설명창 오픈
ex_help_btn.addEventListener("click", () => {
    const map_zidx = document.getElementById("map");
    const imgmap_zidx = document.getElementById("imageContainer");
    const menu_zidx = document.querySelector(".menu");

    nav_opt_on = document.querySelector(".nav-opt.on").getAttribute("id");

    ex_help_panel.classList.remove("set_opacity");
    console.log(map_zidx);
    nav_opt_on == "gotoSubwayBtn" ? (imgmap_zidx.style.zIndex = -10) : (map_zidx.style.zIndex = -10);
    menu_zidx.style.zIndex = "";
    Chapter_text(chapter, nav_opt_on);
});

// 오른쪽 상단 X버튼을 클릭했을 때 화면 종료
ex_help_Xbtn.addEventListener("click", () => {
    const map_zidx = document.getElementById("map");
    const imgmap_zidx = document.getElementById("imageContainer");
    const menu_zidx = document.querySelector(".menu");

    ex_help_panel.classList.add("set_opacity");
    nav_opt_on == "gotoSubwayBtn" ? (imgmap_zidx.style.zIndex = 0) : (map_zidx.style.zIndex = 0);
    menu_zidx.style.zIndex = 1;
    chapter = 0;
});

// 바깥 화면을 클릭했을 때 화면 종료
ex_close_panel.addEventListener("click", () => {
    const map_zidx = document.getElementById("map");
    const imgmap_zidx = document.getElementById("imageContainer");
    const menu_zidx = document.querySelector(".menu");

    ex_help_panel.classList.add("set_opacity");
    nav_opt_on == "gotoSubwayBtn" ? (imgmap_zidx.style.zIndex = 0) : (map_zidx.style.zIndex = 0);
    menu_zidx.style.zIndex = 1;
    chapter = 0;
});

//---------------------------------------------
let chapter = 0;
const next_btn = document.getElementById("ex_next_btn");
const back_btn = document.getElementById("ex_back_btn");
const ex_title = document.getElementById("ex_title");
const ex_maintext = document.getElementById("ex_maintext");

next_btn.addEventListener("click", () => {
    Chapter_text(++chapter, nav_opt_on) ? Chapter_text((chapter = 0), nav_opt_on) : null;
});

back_btn.addEventListener("click", () => {
    Chapter_text(--chapter, nav_opt_on) ? (chapter = 0) : null;
});

function Chapter_text(chapter, result_id) {
    let title = "";
    let maintext = "";

    if (result_id == "gotoMappingBtn") {
        // 길찾기 서비스의 설명입니다.
        switch (chapter) {
            case 0:
                remove_select();
                title = "길찾기 서비스";
                maintext = "검색한 장소로 이동할 수 있는 수단을 보여줍니다." + "<br>" + "사용 방법을 알고 싶으시면 next부분을 클릭 후 빛이 나는 부분과 상호작용 해 주세요.";
                break;

            case 1:
                remove_select();
                add_select("con-search");
                title = "Step 1.";
                maintext = "목적지를 검색합니다. <br> (주소 자동완성 기능 제공)";
                break;

            case 2:
                remove_select();
                add_select("search-btn");
                title = "Step 2.";
                maintext = "검색 버튼을 눌러 위치를 검색합니다.";
                break;

            case 3:
                remove_select();
                title = "Step 3.";
                maintext = `오른쪽 지도에서 검색 <br>결과를 확인합니다. <br><br> <span><img src="mid_icon.png" width="20px" alt="" /> 무지개 마커: 목적지 <br />
                <img src="start_icon.png" width="20px" alt="" /> 빨간색 마커: 출발지</span>`;
                break;

            default:
                return true;
        }
    } else if (result_id == "gotoHalfWayBtn") {
        // 중간지점 찾기 서비스 설명입니다.
        switch (chapter) {
            case 0:
                remove_select();
                title = "중간지점 찾기!";
                maintext = "검색한 두 장소의 중간지점을 찾아줍니다." + "<br>" + "사용 방법을 알고 싶으시면 next부분을 클릭 후 빛이 나는 부분과 상호작용 해 주세요.";
                break;

            case 1:
                remove_select();
                add_select("add-address");
                title = "Step 1.";
                maintext = "입력할 사용자의 인원수 만큼 출발지의 갯수를 설정합니다.";
                break;

            case 2:
                remove_select();
                add_select("remove-address");
                title = "Step 2.";
                maintext = "필요없는 출발지를 <br>삭제합니다.";
                break;

            case 3:
                remove_select();
                add_select("con-search");
                title = "Step 3.";
                maintext = "각 사용자별 출발지를 <br>입력합니다.";
                break;

            case 4:
                remove_select();
                add_select("search-btn");
                title = "Step 4.";
                maintext = "검색 버튼을 눌러 검색 결과를 <br>확인합니다.";
                break;

            case 5:
                remove_select();
                add_select("radio-label");
                title = "Step 5.";
                maintext = "중간지점 근처 편의점, 카페 등을 확인하고 사진, 평점등을 <br>볼 수 있습니다.";
                break;

            case 6:
                remove_select();
                title = "Step 6.";
                maintext = `오른쪽 지도에서 검색 <br>결과를 확인합니다. <br><br> <span><img src="mid_icon.png" width="20px" alt="" /> 무지개 마커: 목적지 <br />
                <img src="start_icon.png" width="20px" alt="" /> 빨간색 마커: 출발지</span>`;
                break;

            default:
                return true;
        }
    } else {
        // 지하철 지연정보 설명입니다.
        switch (chapter) {
            case 0:
                remove_select();
                title = "지하철 지연정보";
                maintext = "지하철 역의 지연시간을 알려줍니다." + "<br>" + "사용 방법을 알고 싶으시면 next부분을 클릭 후빛이 나는 부분과 상호작용 해 주세요.";
                break;

            case 1:
                remove_select();
                add_select("Line_no");
                title = "Step 1.";
                maintext = "지연정보를 검색할 역의 몇호선의 정보를 확인할지 입력합니다.";
                break;

            case 2:
                remove_select();
                add_select("updnLine_no");
                title = "Step 2.";
                maintext = "지연정보를 검색할 역의 상행, 하행 정보를 확인할지 입력합니다.";
                break;

            case 3:
                remove_select();
                add_select("con-search");
                title = "Step 3.";
                maintext = "오른쪽 역 노선도를 보고 필요한 역을 입력합니다.";
                break;

            case 4:
                remove_select();
                add_select("search-btn");
                title = "Step 4.";
                maintext = "검색버튼을 눌러 검색결과를 확인합니다.";
                break;

            case 5:
                remove_select();
                title = "Step 5.";
                maintext = "왼쪽 패널에서 지연정보를 확인합니다.";
                break;

            default:
                return true;
        }
    }
    ex_title.innerHTML = title;
    ex_maintext.innerHTML = maintext;
    return false;
}

// 현제 빛나고 있는 요소의 클래스를 삭제합니다.
function remove_select() {
    let tags = document.querySelectorAll(".help_select");
    tags.forEach((tag) => {
        tag.classList.remove("help_select");
    });
}

// 선택한 클래스에 발광 효과를 추가합니다.
function add_select(class_name) {
    let tags = document.querySelectorAll(`.${class_name}`);
    tags.forEach((tag) => {
        tag.classList.add("help_select");
    });
}
