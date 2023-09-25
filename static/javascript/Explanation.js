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
    Chapter_text(++chapter) ? Chapter_text((chapter = 0)) : null;
});

back_btn.addEventListener("click", () => {
    Chapter_text(--chapter) ? (chapter = 0) : null;
});

function Chapter_text(chapter) {
    switch (chapter) {
        case 0:
            remove_select();
            ex_title.innerHTML = "길찾기 서비스";
            ex_maintext.innerHTML = "반갑습니다.";
            break;

        case 1:
            remove_select();
            add_select("con-search");
            ex_title.innerHTML = "1단계";
            ex_maintext.innerHTML = "설명";
            break;

        case 2:
            remove_select();
            add_select("search-btn");
            ex_title.innerHTML = "2단계";
            ex_maintext.innerHTML = "설명";
            break;

        case 3:
            remove_select();
            ex_title.innerHTML = "3단계";
            ex_maintext.innerHTML = "설명";
            break;

        default:
            return true;
            break;
    }
    return false;
}

function remove_select() {
    let tags = document.querySelectorAll(".help_select");
    tags.forEach((tag) => {
        tag.classList.remove("help_select");
    });
}

function add_select(class_name) {
    let tags = document.querySelectorAll(`.${class_name}`);
    tags.forEach((tag) => {
        tag.classList.add("help_select");
    });
}
