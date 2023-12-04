document.addEventListener("DOMContentLoaded", function () {
    var openPopupBtn = document.getElementById("start");
    var closePopupBtn = document.getElementById("closePopupBtn");
    var popupContainer = document.getElementById("popupContainer");
    var play2Players = document.getElementById("vsplayer");
    var playComputer = document.getElementById("vscomputer");

    play2Players.addEventListener("click", function (){
        window.location.href = "board.html";
    });
    playComputer.addEventListener("click", function (){
        window.location.href = "computer.html";
    });

    openPopupBtn.addEventListener("click", function () {
        popupContainer.style.display = "flex";
    });

    closePopupBtn.addEventListener("click", function () {
        popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
        setTimeout(function (){
            popupContainer.style.display = "none";
            popupContainer.style.animation = "";
        }, 100);
    });

    // Đóng popup khi nhấn bên ngoài nó
    window.addEventListener("click", function (event) {
        if (event.target === popupContainer) {
            popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
            setTimeout(function (){
                popupContainer.style.display = "none";
                popupContainer.style.animation = "";
            }, 100);
            }
        });
});