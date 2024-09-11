let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let player1 = null;
let player2 = null;
let matchId = null;

tg.onEvent('mainButtonClicked', () => {
    // Получаем данные первого пользователя
    if (!player1) {
        player1 = tg.initDataUnsafe.user;
        document.querySelector('.user-info1 .username').textContent = `@${player1.username}`;
        document.querySelector('.user-info1 .user-image').src = player1.photo_url || 'reqs/default-avatar.png';
        console.log(`Player 1: @${player1.username}, ID: ${player1.id}`);
    } 
    // Получаем данные второго пользователя и начинаем матч
    else if (!player2) {
        player2 = tg.initDataUnsafe.user;
        document.querySelector('.user-info2 .username').textContent = `@${player2.username}`;
        document.querySelector('.user-info2 .user-image').src = player2.photo_url || 'reqs/default-avatar.png';
        console.log(`Player 2: @${player2.username}, ID: ${player2.id}`);

        // Генерируем ID матча как сумму ID двух игроков
        matchId = player1.id + player2.id;
        console.log('ID матча:', matchId);

        startMatch();
    }
});

function startMatch() {
    if (matchId && player1 && player2) {
        console.log('Матч начался с ID:', matchId);
        // Отправляем на сервер команду для начала матча
        socket.send(`MATCH_START:${matchId}`);
        startTimer();
    }
}

// Таймеры
let whiteTime = 600; // 10 минут в секундах для белых
let blackTime = 600; // 10 минут в секундах для черных
let isWhiteTurn = true;
let timerInterval = null;

function startTimer() {
    if (timerInterval) return;

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
    if (!timerInterval) startTimer(); // Запуск таймера после первого хода
}

// Отправка хода на сервер
function handleSquareClick(row, col, files, ranks) {
    const clickedSquare = files[col] + ranks[row]; 

    if (selectedSquare === null) {
        selectedSquare = clickedSquare;
        console.log('Выбрана клетка: ' + selectedSquare);
    } else {
        const move = `${selectedSquare}${clickedSquare}`; 
        console.log('Ход: ' + move);

        // Отправляем ход на сервер
        socket.send(`${matchId}:${move}`);

        selectedSquare = null;
        switchTurn();
    }
}

// WebSocket настройки
const socket = new WebSocket('ws://localhost:8181');

socket.onmessage = function (event) {
    const data = event.data;

    if (data.includes("FEN:")) {
        const [newFEN, playerColor] = data.slice(4).split(":");
        createChessboardFromFEN(newFEN, playerColor);
    } else if (data.includes("LOGS:")) {
        const logs = data.slice(5);
        document.getElementById('server_logs_field').innerHTML = logs.replace(/\n/g, '<br>');
    }
};

socket.onopen = function () {
    console.log('Соединение установлено');
};

socket.onerror = function (error) {
    console.error('Ошибка WebSocket:', error);
};

// Генерация доски
const defaultFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
createChessboardFromFEN(defaultFEN, 'w');

function createChessboardFromFEN(fen, playerColor) {
    chessboard.innerHTML = ''; 
    const ranks = playerColor === 'w' ? ranksWhite : ranksBlack;
    const files = playerColor === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    const position = fen.split(' ')[0];
    let rows = position.split('/');

    if (playerColor === 'b') {
        rows = rows.reverse();
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
        square.addEventListener('click', () => handleSquareClick(row, col, files, ranks));
    }
}

function addPieceFromFEN(square, row, col, rows) {
    const fenRow = rows[row];
    let colIndex = 0;

    for (let char of fenRow) {
        if (!isNaN(char)) {
            colIndex += parseInt(char);
        } else {
            const color = char === char.toUpperCase() ? 'white' : 'black';
            const piece = char.toLowerCase();
            if (colIndex === col) {
                const img = document.createElement('img');
                img.src = `reqs/${color}_${piece}.svg`;
                img.classList.add('chess-piece');
                square.appendChild(img);
            }
            colIndex++;
        }
    }
}
