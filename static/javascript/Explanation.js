const ex_help_btn = document.getElementById("helpBtn");
const ex_help_panel = document.querySelector(".bg_panel");
const ex_help_Xbtn = document.querySelector(".ex_X-btn");

ex_help_btn.addEventListener("click", () => {
    const map_zidx = document.getElementById("map");
    const menu_zidx = document.querySelector(".menu");
    console.log(map_zidx);
    ex_help_panel.classList.remove("set_opacity");
    map_zidx.style.zIndex = -10;
    menu_zidx.style.zIndex = "";
});

ex_help_Xbtn.addEventListener("click", () => {
    const map_zidx = document.getElementById("map");
    const menu_zidx = document.querySelector(".menu");
    ex_help_panel.classList.add("set_opacity");
    map_zidx.style.zIndex = 0;
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
    Chapter_text(++chapter) ? (chapter = -1) : null;
});

back_btn.addEventListener("click", () => {
    Chapter_text(--chapter) ? (chapter = 0) : null;
});

function Chapter_text(chapter) {
    switch (chapter) {
        case 0:
            document.querySelector(".con-search").classList.remove("help_select");
            document.querySelector(".search-btn").classList.remove("help_select");
            ex_title.innerHTML = "길찾기 서비스";
            ex_maintext.innerHTML = "반갑습니다.";
            break;

        case 1:
            document.querySelector(".search-btn").classList.remove("help_select");
            document.querySelector(".con-search").classList.add("help_select");
            ex_title.innerHTML = "1단계";
            ex_maintext.innerHTML = "설명";
            break;

        case 2:
            document.querySelector(".con-search").classList.remove("help_select");
            document.querySelector(".search-btn").classList.add("help_select");
            ex_title.innerHTML = "2단계";
            ex_maintext.innerHTML = "설명";
            break;

        case 3:
            document.querySelector(".con-search").classList.remove("help_select");
            document.querySelector(".search-btn").classList.remove("help_select");
            ex_title.innerHTML = "3단계";
            ex_maintext.innerHTML = "설명";
            break;

        default:
            return true;
            break;
    }
    return false;
}
