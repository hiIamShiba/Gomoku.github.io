function init() {
	boardDraw();
	playGame(player1Turn = true);}

function boardDraw() { // Hàm vẽ bảng qua HTML
	var table = "";
	for (let i = 0; i < 19; i++) {
		table += "<tr>";
		for (let j = 0; j < 19; j++) {
			table += "<td id='but_"+i+"_"+j+"' class='cell'></td>";}
		table += "</tr>";}
	var gameBoard = document.getElementById("gameBoard");
	gameBoard.innerHTML = table;}

function isEqual(a, b) { // Hàm so sánh giá trị hai mảng
	return JSON.stringify(a) === JSON.stringify(b);}

function isContains(a, b) { // Hàm kiểm tra liệu một phần tử nào đó có nằm trong mảng không
	return JSON.stringify(a).includes(JSON.stringify(b));}

function copy(object) { // Hàm copy giá trị của đối tượng hoặc mảng
	return JSON.parse(JSON.stringify(object));}

function isInBoard(i, j) { // Hàm kiểm tra xem một ô có nằm trong bảng hay không
	if (0 <= i && i < 19 && 0 <= j && j < 19)
		return true;
	return false;}

class Board {
	constructor() {
		this.main = [];					// Bàn cờ chính
		this.button = [];				// Bảng chứa các element lấy từ id các phím (trên bàn cờ)
		this.rememberedCells = [];		// Bảng chứa những ô quanh khu vực đã đánh

		for (let i = 0; i < 19; i++) {
			this.main.push([]);
			this.button.push([]);
			for (let j = 0; j < 19; j++) {
				this.button[i].push(document.getElementById("but_"+i+"_"+j));
				this.main[i].push(0);}}}}

function reorder(board, i, j, numOfCells) { // Hàm sắp thứ tự ưu tiên xem xét cho các ô còn lại sau khi ai đó đánh vào ô [i, j], trong đó numOfCells là số ô tối đa sẽ được xem xét
	var directions = [[-1, -1], [1, 1], [1, -1], [-1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]];
	var aroundIJ = [];

	for (let direc of directions)
		for (let k = 0; k < 5; k++)
			if (isInBoard(i + k*direc[0], j + k*direc[1])) {
				if (board.main[i + k*direc[0]][j + k*direc[1]] === board.main[i][j])
					continue;
				if (board.main[i + k*direc[0]][j + k*direc[1]] === 0) {
					aroundIJ.push([i + k*direc[0], j + k*direc[1]]);
					break;}
				if (board.main[i + k*direc[0]][j + k*direc[1]] === 3 - board.main[i][j])
					break;}

	numOfCells -= aroundIJ.length;
	let m = 0, n = 0, len = board.rememberedCells.length;
	while (m < numOfCells && n < len) {
		if (!(isContains(aroundIJ, board.rememberedCells[n]) || isEqual(board.rememberedCells[n], [i, j]))) {
			aroundIJ.push(board.rememberedCells[n]);
			m++;}
		n++;}

	board.rememberedCells = copy(aroundIJ);}

function isWin(mainBoard, i, j) { // Hàm kiểm tra xem người đánh vào ô [i, j] có thể thắng nhờ nước đi đó không
	var directions = [[0, 1], [1, 0], [1, -1], [1, 1]];
	var count;		// Dùng để đếm số quân cờ trên một đường

	for (let direc of directions) {
		count = 1;
		for (let k = 1; k < 5; k++) {
			if (!isInBoard(i + k*direc[0], j + k*direc[1]) || mainBoard[i + k*direc[0]][j + k*direc[1]] !== mainBoard[i][j])
				break;
			else
				count++;}
		if (count === 5)
			return true;

		for (let k = 1; k < 5; k++)
			if (!isInBoard(i - k*direc[0], j - k*direc[1]) || mainBoard[i - k*direc[0]][j - k*direc[1]] !== mainBoard[i][j])
				break;
			else {
				count++;
				if (count === 5)
					return true;}}
	return false;}

function hashValue(mainBoard) {
	var top, bottom, left, right;

	loop1: for (let i = 0; i < 19; i++)
		loop2: for (let j = 0; j < 19; j++)
			if (mainBoard[i][j] !== 0) {
				top = i;
				break loop1;}

	loop1: for (let i = 18; i > -1; i--)
		loop2: for (let j = 0; j < 19; j++)
			if (mainBoard[i][j] !== 0) {
				bottom = i;
				break loop1;}

	loop1: for (let j = 0; j < 19; j++)
		loop2: for (let i = top; i <= bottom; i++)
			if (mainBoard[i][j] !== 0) {
				left = j;
				break loop1;}

	loop1: for (let j = 18; j > -1; j--)
		loop2: for (let i = top; i <= bottom; i++)
			if (mainBoard[i][j] !== 0) {
				right = j;
				break loop1;}

	var hash = "";
	hash += right - left + 1
	for (let i = top; i <= bottom; i++)
		for (let j = left; j <= right; j++)
			hash += mainBoard[i][j];
	return hash;}

function getPoints(mainBoard) { // Hàm heuristic đánh giá điểm của một trạng thái bàn cờ (điểm của Jasi)
	var directions = [[0, 1], [1, 0], [1, -1], [1, 1]];
	var count;		// Dùng để đếm số quân cờ trên một đường
	var blocked;	// Dùng để đếm xem một đường bị chặn ở mấy đầu
	var pointsBoard = [[10, 100, 5000, 10000000, 10000000000],	// Đường 1, 2, 3, 4, 5 và thoáng 2 đầu
                       [5,  50,  250,  10000,    10000000000], 	// Đường 1, 2, 3, 4, 5 và bị chặn 1 đầu
                       [0,  0,   0,    0,        10000000000]];	// Đường 1, 2, 3, 4, 5 và bị chặn 2 đầu
					// Cột thứ 5 chỉ mang tính hình thức vì trong hàm minimax đã có tham số someoneWin
	var points = 0;

	for (let i = 0; i < 19; i++)
		for (let j = 0; j < 19; j++)
			if (mainBoard[i][j] !== 0)
				for (let direc of directions) {
					count = 1;
					blocked = 0;

					// Kiểm tra nếu đã duyệt qua ô phía trước theo hướng đang xét thì không cần duyệt lại từ ô hiện tại nữa
					if (isInBoard(i - direc[0], j - direc[1]) && mainBoard[i - direc[0]][j - direc[1]] === mainBoard[i][j])
						continue;

					for (let k = 1; k < 5; k++)
						if (isInBoard(i + k*direc[0], j + k*direc[1]) && mainBoard[i + k*direc[0]][j + k*direc[1]] === mainBoard[i][j])
							count++;
						else break;

					if (!isInBoard(i + count*direc[0], j + count*direc[1]) || mainBoard[i + count*direc[0]][j + count*direc[1]] === 3 - mainBoard[i][j])
						blocked++;
					if (!isInBoard(i - direc[0], j - direc[1]) || mainBoard[i - direc[0]][j - direc[1]] === 3 - mainBoard[i][j])
						blocked++;

					if (mainBoard[i][j] === 1)
						points -= pointsBoard[blocked][count-1];
					else
						points += pointsBoard[blocked][count-1];}
	return points;}

function minimax(board, depth, alpha = -1.0/0.0, beta = 1.0/0.0, jasiTurn = true, someoneWin = false) { // Hàm tìm ra nước đi tốt nhất
	if (someoneWin)
		if (jasiTurn)
			return [0, 0, -10000000000 - 1000*depth];
		else
			return [0, 0, 10000000000 + 1000*depth];

	var len = board.rememberedCells.length;

	if (depth === 0 || len === 0) {
		let hash = hashValue(board.main);
		if (transTable[hash] === undefined)
			transTable[hash] = getPoints(board.main);
		return [0, 0, transTable[hash]];}

	if (jasiTurn) {
		var maxPoints = -1.0/0.0;
		var maxMove;

		for (let k = 0; k < len; k++) {
			var copiedBoard = copy(board);
			var move = board.rememberedCells[k];

			copiedBoard.main[move[0]][move[1]] = 2;
			reorder(copiedBoard, move[0], move[1], 24);

			someoneWin = isWin(copiedBoard.main, move[0], move[1]);
			var result = minimax(copiedBoard, depth-1, alpha, beta, false, someoneWin);
			someoneWin = false;

			var points = result[2];
			if (points > maxPoints) {
				maxPoints = points;
				maxMove = move;}

			if (maxPoints > alpha)
				alpha = maxPoints;
			if (alpha > beta)
				break;}
		return [maxMove[0], maxMove[1], maxPoints];}

	else {
		var minPoints = 1.0/0.0;
		var minMove;

		for (let k = 0; k < len; k++) {
			var copiedBoard = copy(board);
			var move = board.rememberedCells[k];

			copiedBoard.main[move[0]][move[1]] = 1;
			reorder(copiedBoard, move[0], move[1], 24);

			someoneWin = isWin(copiedBoard.main, move[0], move[1]);
			var result = minimax(copiedBoard, depth-1, alpha, beta, true, someoneWin);
			someoneWin = false;

			var points = result[2];
			if (points < minPoints) {
				minPoints = points;
				minMove = move;}

			if (minPoints < beta)
				beta = minPoints;
			if (alpha > beta)
				break;}
		return [minMove[0], minMove[1], minPoints];}}

function playGame(player1Turn = true, playerScores = 0, jasiScores = 0) { // Hàm chơi game
	const backToHome = document.getElementById("home");
	const undo = document.getElementById("undo");
	const announcement = document.getElementById("announcement");
	const playerX = document.getElementById("player-x");
	const playerO = document.getElementById("player-o");
	const closePopupBtn = document.getElementById("closePopupBtn");
    const popupContainer = document.getElementById("popupContainer");

    backToHome.onclick = function() {window.location.href = "index.html";};
	undo.onclick = function() {
		alert("Feature coming Soon...");}

	playerX.innerText = playerScores;
	playerO.innerText = jasiScores;

	var playerIcon = "X";
	var jasiIcon = "O";

	window.transTable = {};

	// Khởi tạo bảng
	var board = new Board();
	var jasiMove;

	if (!player1Turn) {
		board.main[9][9] = 2;
		board.button[9][9].innerHTML = jasiIcon;
		reorder(board, 9, 9, 72);}

	// Xử lý nước đi của người chơi
	for (let i = 0; i < 19; i++) {
		for (let j = 0; j < 19; j++) {
			board.button[i][j].onclick = function() {
				if (board.main[i][j] === 0) {
					board.button[i][j].innerHTML = playerIcon;
					board.button[i][j].classList.add("x-cell");
					board.main[i][j] = 1;

					reorder(board, i, j, numOfCells = 72);
					transTable = {};

					setTimeout(() => {
						if (isWin(board.main, i, j)) {
							announcement.innerText = `You win!`;
        					popupContainer.style.display = "flex";

							// Đóng popup khi ấn vào dấu x
							closePopupBtn.addEventListener("click", function () {
								popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
								setTimeout(function (){
									popupContainer.style.display = "none";
									popupContainer.style.animation = "";
								}, 100);
								setTimeout(() => {
									boardDraw();
									playGame(playerTurn = false, playerScores+1, jasiScores);
								}, 1500);});
						
							// Đóng popup khi nhấn bên ngoài nó
							window.addEventListener("click", function (event) {
								if (event.target === popupContainer) {
									popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
									setTimeout(() => {
										popupContainer.style.display = "none";
										popupContainer.style.animation = "";
									}, 100);
									setTimeout(() => {
										boardDraw();
										playGame(playerTurn = false, playerScores+1, jasiScores);
									}, 1500);}});}
						else {
							jasiMove = minimax(board, depth = 4);
							board.button[jasiMove[0]][jasiMove[1]].innerHTML = jasiIcon;
							board.button[jasiMove[0]][jasiMove[1]].classList.add("o-cell");
							board.main[jasiMove[0]][jasiMove[1]] = 2;

							reorder(board, jasiMove[0], jasiMove[1], numOfCells = 72);

							setTimeout(() => {
								if (isWin(board.main, jasiMove[0], jasiMove[1])) {
									announcement.innerText = `Jasi wins!`;
		        					popupContainer.style.display = "flex";

									// Đóng popup khi ấn vào dấu x
									closePopupBtn.addEventListener("click", function () {
										popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
										setTimeout(() => {
											popupContainer.style.display = "none";
											popupContainer.style.animation = "";
										}, 100);
										setTimeout(() => {
											boardDraw();
											playGame(playerTurn = true, playerScores, jasiScores+1);
										}, 1500);});
								
									// Đóng popup khi nhấn bên ngoài nó
									window.addEventListener("click", function (event) {
										if (event.target === popupContainer) {
											popupContainer.style.animation = "fadeOut 0.25s ease-in-out";
											setTimeout(() => {
												popupContainer.style.display = "none";
												popupContainer.style.animation = "";
											}, 100);
											setTimeout(() => {
												boardDraw();
												playGame(playerTurn = true, playerScores, jasiScores+1);
											}, 1500);}});}
							}, 50);
						}
					}, 50);
				}
			};
		}
	}
}

window.onload = init;
