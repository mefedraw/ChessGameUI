// let tg = window.Telegram.WebApp;

// tg.expand();
// tg.ready();

const chessboard = document.getElementById('chessboard');
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranksWhite = [8, 7, 6, 5, 4, 3, 2, 1];  
const ranksBlack = [1, 2, 3, 4, 5, 6, 7, 8];

function createChessboardFromFEN(fen, playerColor) {
    chessboard.innerHTML = ''; // Очистка доски
    const ranks = playerColor === 'w' ? ranksWhite : ranksBlack;
    const files = playerColor === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

    // Обрабатываем только первую часть FEN, которая содержит состояние доски
    const position = fen.split(' ')[0];
    let rows = position.split('/');

    // Если игрок черный, ряды доски должны быть инвертированы
    if (playerColor === 'b') {
        rows = rows.reverse();
    }

    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        chessboard.appendChild(square);

        const row = Math.floor(i / 8);
        const col = i % 8;

        // Устанавливаем светлые и темные клетки
        if ((row + col) % 2 === 0) {
            square.classList.add('light');
        } else {
            square.classList.add('dark');
        }

        // Добавляем метки для рядов (ranks) и столбцов (files)
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

        // Добавляем фигуры, если они есть
        addPieceFromFEN(square, row, col, rows);
    }
}


function addPieceFromFEN(square, row, col, rows) {
    const fenRow = rows[row];
    let colIndex = 0;

    // Проходим по строке FEN для данной строки доски
    for (let char of fenRow) {
        if (!isNaN(char)) {
            colIndex += parseInt(char); // пропускаем пустые клетки
        } else {
            const color = char === char.toUpperCase() ? 'white' : 'black'; // Цвет фигуры
            const piece = char.toLowerCase(); // Фигура
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


const commandInput = document.getElementById('commandInput');
const sendCommandButton = document.getElementById('sendCommand');
const logsField = document.getElementById('server_logs_field');

// Подключаемся к WebSocket серверу
const socket = new WebSocket('ws://localhost:8181');

// Отправка команды при нажатии кнопки
sendCommandButton.addEventListener('click', () => {
    const command = commandInput.value;
    if (command) {
        socket.send(command); // Отправляем команду на сервер
        commandInput.value = ''; // Очищаем поле ввода
    }
});

// При получении сообщения от сервера
socket.onmessage = function (event) {
    const data = event.data;

    if (data.includes("FEN:")) {
        // Убираем "FEN:" и разбиваем строку на FEN и цвет игрока
        const parts = data.slice(4).split(":");
        const newFEN = parts[0];    // FEN строка
        const playerColor = parts[1]; // Цвет игрока (например, 'white' или 'black')

        // Обновляем доску, передавая FEN и цвет игрока
        createChessboardFromFEN(newFEN, playerColor);
    } else if (data.includes("LOGS:")) {
        const logs = data.slice(5); // Получаем логи, убираем "LOGS:"
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

/*
const fen = "r1bqkb1r/ppp2ppp/2n5/3pp3/2B1N3/5N2/PPPP1PPP/R1BQK2R";
 */