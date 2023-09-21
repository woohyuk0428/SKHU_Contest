const help_btn = document.querySelector(".nav-opt-other");
const help_panel = document.querySelector(".bg-blur");
help_btn.addEventListener("click", () => {
    help_panel.classList.add("posdown");
});

const help_Xbtn = document.querySelector(".X-btn");
help_Xbtn.addEventListener("click", () => {
    help_panel.classList.remove("posdown");
});
