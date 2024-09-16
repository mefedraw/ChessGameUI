document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', function () {
        if (this.alt === 'surrender') {
            console.log('Surrender button clicked');
        } else if (this.alt === 'draw-offer') {
            console.log('Draw offer button clicked');
        }
    });
});

const chessboard = document.getElementById('chessboard');
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranksWhite = [8, 7, 6, 5, 4, 3, 2, 1];
const ranksBlack = [1, 2, 3, 4, 5, 6, 7, 8];
let selectedSquare = null;
let highlightedSquare = null; // Для подсветки выбранной клетки
let matchId = 1; // Пример ID матча

// Таймеры
let whiteTime = 600; // 10 минут в секундах для белых
let blackTime = 600; // 10 минут в секундах для черных
let isWhiteTurn = true;
let timerInterval = null;

function startTimer() {
    if (timerInterval) return; // Таймер уже запущен

    timerInterval = setInterval(() => {
        if (isWhiteTurn) {
            whiteTime--;
            updateTimerDisplay('white', whiteTime);
        } else {
            blackTime--;
            updateTimerDisplay('black', blackTime);
        }

        if (whiteTime <= 0 || blackTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('Время вышло!');
        }
    }, 1000);
}

function updateTimerDisplay(player, time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.querySelector(`.${player}-time`).textContent = timeString;
}

function switchTurn() {
    isWhiteTurn = !isWhiteTurn;
    if (!timerInterval) startTimer(); // Запуск таймера после первого хода белого
}

function createChessboardFromFEN(fen, playerColor) {
    chessboard.innerHTML = ''; // Очистка доски
    const ranks = playerColor === 'w' ? ranksWhite : ranksBlack;
    const files = playerColor === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    let position = fen.split(' ')[0];
    let rows = position.split('/');

    // Если игрок черный, мы изменим расстановку короля и ферзя для нижней и верхней части доски
    if (playerColor === 'b') {
        rows = rows.reverse();

        // Меняем местами короля и ферзя как для верхней, так и для нижней линии
        rows[0] = swapKingAndQueen(rows[0]);
        rows[7] = swapKingAndQueen(rows[7]);
    }

    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        chessboard.appendChild(square);

        const row = Math.floor(i / 8);
        const col = i % 8;

        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }

        if (col === 0) {
            const rankLabel = document.createElement('span');
            rankLabel.textContent = ranks[row];
            rankLabel.classList.add('rank-label');
            square.appendChild(rankLabel);
        }

        if (row === 7) {
            const fileLabel = document.createElement('span');
            fileLabel.textContent = files[col];
            fileLabel.classList.add('file-label');
            square.appendChild(fileLabel);
        }

        addPieceFromFEN(square, row, col, rows);

        // Передаем playerColor в handleSquareClick
        square.addEventListener('click', () => handleSquareClick(row, col, files, ranks, playerColor));
    }
}

function swapKingAndQueen(row) {
    // Заменяем порядок короля и ферзя: меняем 'qk' на 'kq' и 'QK' на 'KQ'
    return row.replace('qk', 'kq').replace('QK', 'KQ');
}

function addPieceFromFEN(square, row, col, rows) {
    const fenRow = rows[row];
    let colIndex = 0;

    for (let char of fenRow) {
        if (!isNaN(char)) {
            colIndex += parseInt(char); // пропускаем пустые клетки
        } else {
            const color = char === char.toUpperCase() ? 'white' : 'black';
            const piece = char.toLowerCase();
            if (colIndex === col) {
                const img = document.createElement('img');
                img.src = `reqs/${color}_${piece}.svg`; // Путь к изображению фигуры
                img.classList.add('chess-piece');
                square.appendChild(img);
            }
            colIndex++;
        }
    }
}

function handleSquareClick(row, col, files, ranks, playerColor) {
    const clickedSquare = files[col] + ranks[row]; // Получаем обозначение клетки, например "e2"

    // Найдем все клетки, которые имеют класс highlight, и уберем его
    if (highlightedSquare) {
        // Возвращаем исходный цвет клетки в зависимости от ее класса
        if (highlightedSquare.classList.contains('light')) {
            highlightedSquare.style.backgroundColor = '#efe6d5';
        } else if (highlightedSquare.classList.contains('dark')) {
            highlightedSquare.style.backgroundColor = 'rgba(60, 111, 111, 0.8)';
        }
        highlightedSquare.classList.remove('highlight');
    }

    const square = chessboard.querySelector(`.square:nth-child(${(row * 8) + col + 1})`);

    if (selectedSquare === null) {
        // Если не выбрана клетка, мы выбираем ее
        selectedSquare = clickedSquare;
        highlightedSquare = square;

        if (square.classList.contains('light')) {
            square.style.backgroundColor = '#d4c7b4';
        } else if (square.classList.contains('dark')) {
            square.style.backgroundColor = 'rgba(100, 151, 151, 1)';
        }

        square.classList.add('highlight');
        console.log('Selected square: ' + selectedSquare);
    } else {
        // Если уже была выбрана клетка, то делаем ход
        let move = `${selectedSquare}${clickedSquare}`; // Формат хода, например "e2e4"

        if (playerColor === 'b') {
            // Если игрок чёрный, нужно перевернуть файлы (столбцы)
            const flippedFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const flipCoord = (coord) => {
                const file = coord[0];
                const rank = coord[1];
                const flippedFile = flippedFiles[7 - flippedFiles.indexOf(file)]; // зеркально переворачиваем
                return flippedFile + rank;
            };

            // Переворачиваем ходы
            move = flipCoord(selectedSquare) + flipCoord(clickedSquare);
        }

        console.log('Move: ' + move);
        socket.send(`${matchId}:${move}`);

        // Снимаем выделение после хода
        selectedSquare = null;
        highlightedSquare = null;
        switchTurn(); // Переключаем ход
    }
}

const commandInput = document.getElementById('commandInput');
const sendCommandButton = document.getElementById('sendCommand');
const logsField = document.getElementById('server_logs_field');

const socket = new WebSocket('ws://localhost:8181');

sendCommandButton.addEventListener('click', () => {
    const command = commandInput.value;
    if (command) {
        socket.send(command);
        commandInput.value = '';
    }
});

socket.onmessage = function (event) {
    const data = event.data;

    if (data.includes("FEN:")) {
        const parts = data.slice(4).split(":");
        const newFEN = parts[0];
        const playerColor = parts[1];
        createChessboardFromFEN(newFEN, playerColor);
    } else if (data.includes("LOGS:")) {
        const logs = data.slice(5);
        logsField.innerHTML = logs.replace(/\n/g, '<br>');
    }
};

socket.onopen = function () {
    console.log('Соединение установлено');
};

socket.onerror = function (error) {
    console.error('Ошибка WebSocket:', error);
};

const defaultFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

createChessboardFromFEN(defaultFen, 'w');