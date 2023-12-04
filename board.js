var backToHome = document.getElementById("home");

backToHome.addEventListener("click", function (){
    window.location.href = "index.html";
});

document.addEventListener("DOMContentLoaded", function () {
    const boardSize = 19;
    const boardElement = document.getElementById("board");
    const moveHistory = [];
    var closePopupBtn = document.getElementById("closePopupBtn");
    var popupContainer = document.getElementById("popupContainer");

    // Tạo ô cờ trên bảng
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", handleCellClick);
            boardElement.appendChild(cell);
        }
    }

    // Function to check for a win after each move
function checkWin() {
    function updateScore(playerNumber) {
        var scoreElement = document.getElementById(playerNumber);
        var currentScore = parseInt(scoreElement.innerText);
        
        scoreElement.innerText = currentScore + 1;
    }
    const cells = document.querySelectorAll('.cell');

    function checkConsecutive(start, step) {
        const player = cells[start].textContent;
        if (!player) return false;

        for (let i = 1; i < 5; i++) {
            const nextCell = cells[start + i * step];
            if (!nextCell || nextCell.textContent !== player) {
                return false;
            }
        }
        if (player === "X") updateScore("player-x");
        else updateScore("player-o")
        announceWinner(player);
        return true;
    }

    // Check rows
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j <= boardSize - 5; j++) {
            if (checkConsecutive(i * boardSize + j, 1)) {
                return;
            }
        }
    }

    // Check columns
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j <= boardSize - 5; j++) {
            if (checkConsecutive(i + j * boardSize, boardSize)) {
                return;
            }
        }
    }

    // Check diagonals
    for (let i = 0; i <= boardSize - 5; i++) {
        for (let j = 0; j <= boardSize - 5; j++) {
            if (checkConsecutive(i * boardSize + j, boardSize + 1) ||
                checkConsecutive((i + 4) * boardSize + j, boardSize - 1)) {
                return;
            }
        }
    }

    // Check for a tie
    if (moveHistory.length === boardSize * boardSize) {
        announceWinner("Tie");
    }
}

// Thông báo người thắng
function announceWinner(winner) {
    if (winner !== "Tie"){
        var announcement = document.getElementById("announcement");
        announcement.innerText = `Player ${winner} wins!`;
        popupContainer.style.display = "flex";
    } else {
        var announcement = document.getElementById("announcement");
        announcement.innerText = `TIE!`;
        popupContainer.style.display = "flex";
    }
}

// Function to reset the game
function resetGame() {
    const cells = document.querySelectorAll('.cell');

    // Clear the board
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x-cell', 'o-cell');
    });

    // Clear move history
    moveHistory.length = 0;

    // Reset click count in local storage
    localStorage.setItem('clickCount', '0');
}

    // Xử lý sự kiện click trên ô cờ
    function handleCellClick(event) {
        const clickedCell = event.target;
        const row = clickedCell.dataset.row;
        const col = clickedCell.dataset.col;

        // Kiểm tra xem ô cờ đã được đánh chưa
        if (!clickedCell.textContent) {
            // Đặt dấu X hoặc O tùy thuộc vào lượt đánh
            const currentPlayer = isEven(countClicks()) ? "X" : "O";
            clickedCell.textContent = currentPlayer;
            if (currentPlayer === "X") {
                clickedCell.classList.add("x-cell");
            } else {
                clickedCell.classList.add("o-cell");
            }
            setTimeout(() => {
                checkWin();
            }, 50);
            moveHistory.push({
                row: row,
                col: col,
            });
        }
    }

     // Hàm xử lý sự kiện click nút "Undo"
     document.getElementById("undoButton").addEventListener("click", function () {
        // Kiểm tra xem có bước để undo không
        if (moveHistory.length > 0) {
            const lastMove = moveHistory.pop();
            const cellToUndo = document.querySelector(`[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
            
            // Hủy đặt dấu trên ô cờ và loại bỏ lớp CSS
            cellToUndo.textContent = "";
            cellToUndo.classList.remove("x-cell", "o-cell");
            const clickCount = parseInt(localStorage.getItem("clickCount"));
            localStorage.setItem("clickCount", (clickCount - 1).toString());
        }
    });

    // Đếm số lần click
    function countClicks() {
        if (!localStorage.getItem("clickCount")) {
            localStorage.setItem("clickCount", "0");
        }

        const clickCount = parseInt(localStorage.getItem("clickCount"));
        localStorage.setItem("clickCount", (clickCount + 1).toString());

        return clickCount;
    }

    // Kiểm tra số chẵn
    function isEven(num) {
        return num % 2 === 0;
    }

    closePopupBtn.addEventListener("click", function () {
        popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
        setTimeout(function (){
            popupContainer.style.display = "none";
            popupContainer.style.animation = "";
        }, 100);
            setTimeout(() => {
                resetGame();
            }, 500);
    });

    // Đóng popup khi nhấn bên ngoài nó
    window.addEventListener("click", function (event) {
        if (event.target === popupContainer) {
            popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
            setTimeout(function (){
                popupContainer.style.display = "none";
                popupContainer.style.animation = "";
            }, 100);
            setTimeout(() => {
                resetGame();
            }, 1500);
            }
        });
});