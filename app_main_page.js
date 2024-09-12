window.onload = function() {
    const chessboard = document.getElementById('chessboard');
    let selectedSquare = null; // Переменная для выбранной клетки

    // Функция для создания доски из FEN
    function createChessboardFromFEN(fen, playerColor) {
        chessboard.innerHTML = ''; // Очистка доски
        const ranksWhite = [8, 7, 6, 5, 4, 3, 2, 1];
        const ranksBlack = [1, 2, 3, 4, 5, 6, 7, 8];
        const ranks = playerColor === 'w' ? ranksWhite : ranksBlack;
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        const position = fen.split(' ')[0];
        const rows = position.split('/');

        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.classList.add('square');
            const row = Math.floor(i / 8);
            const col = i % 8;

            square.dataset.position = `${files[col]}${ranks[row]}`; // Добавляем позицию клетки

            // Устанавливаем светлые и тёмные клетки
            if (row % 2 === 0) {
                square.classList.add(col % 2 === 0 ? 'dark' : 'light');
            } else {
                square.classList.add(col % 2 === 0 ? 'light' : 'dark');
            }

            // Добавляем событие клика на клетку
            square.addEventListener('click', () => handleSquareClick(square));

            chessboard.appendChild(square);
            addPieceFromFEN(square, row, col, rows);
        }
    }

    // Функция для обработки кликов по клеткам
    function handleSquareClick(row, col, files, ranks) {
        const clickedSquare = files[col] + ranks[row]; // Получаем обозначение клетки, например "e2"
        const square = chessboard.querySelector(`.square:nth-child(${(row * 8) + col + 1})`);

        // Проверка, выбрали ли ту же клетку
        if (selectedSquare === clickedSquare) {
            // Если выбрали ту же клетку — отменяем выбор
            if (highlightedSquare.classList.contains('light')) {
                highlightedSquare.style.backgroundColor = '#efe6d5';
            } else if (highlightedSquare.classList.contains('dark')) {
                highlightedSquare.style.backgroundColor = 'rgba(60, 111, 111, 0.8)';
            }
            highlightedSquare.classList.remove('highlight');

            selectedSquare = null;
            highlightedSquare = null;
            console.log('Canceled selection: ' + clickedSquare);
            return;
        }

        // Найдем все клетки, которые имеют класс highlight, и уберем его
        if (highlightedSquare) {
            if (highlightedSquare.classList.contains('light')) {
                highlightedSquare.style.backgroundColor = '#efe6d5';
            } else if (highlightedSquare.classList.contains('dark')) {
                highlightedSquare.style.backgroundColor = 'rgba(60, 111, 111, 0.8)';
            }
            highlightedSquare.classList.remove('highlight');
        }

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
            const move = `${selectedSquare}${clickedSquare}`; // Формат хода, например "e2e4"
            console.log('Move: ' + move);

            socket.send(`${matchId}:${move}`);

            // Снимаем выделение после хода
            selectedSquare = null;
            highlightedSquare = null;
            switchTurn(); // Переключаем ход
        }
    }


    // Функция для перемещения фигуры
    function movePiece(fromSquare, toSquare) {
        const piece = fromSquare.querySelector('img');
        if (piece) {
            fromSquare.removeChild(piece);  // Убираем фигуру с исходной клетки
            toSquare.appendChild(piece);    // Перемещаем фигуру на новую клетку
        }
    }

    // Функция для проверки валидности хода (добавьте свою логику)
    function isValidMove(from, to) {
        // Простая проверка, что ход отличается от исходной клетки
        return from !== to;
    }

    // Функция для добавления фигур на доску
    function addPieceFromFEN(square, row, col, rows) {
        const fenRow = rows[row];
        let colIndex = 0;

        for (let char of fenRow) {
            if (!isNaN(char)) {
                colIndex += parseInt(char); // Пропускаем пустые клетки
            } else {
                const color = char === char.toUpperCase() ? 'white' : 'black'; // Цвет фигуры
                const piece = char.toLowerCase();  // Тип фигуры

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

    // Подключаемся к WebSocket серверу
    const socket = new WebSocket('ws://localhost:8181');

    socket.onopen = function () {
        console.log('Соединение установлено');
    };

    socket.onerror = function (error) {
        console.error('Ошибка WebSocket:', error);
    };

    // При получении сообщения от сервера
    socket.onmessage = function (event) {
        const data = event.data;

        if (data.includes("FEN:")) {
            const parts = data.slice(4).split(":");
            const newFEN = parts[0];    // FEN строка
            const playerColor = parts[1]; // Цвет игрока (например, 'white' или 'black')

            // Обновляем доску
            createChessboardFromFEN(newFEN, playerColor);
        } else if (data.includes("LOGS:")) {
            const logs = data.slice(5); // Получаем логи, убираем "LOGS:"
            logsField.innerHTML = logs.replace(/\n/g, '<br>');
        }
    };

    const defaultFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    createChessboardFromFEN(defaultFen, 'w');
};
