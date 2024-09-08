// let tg = window.Telegram.WebApp;

// tg.expand();
// tg.ready();

const chessboard = document.getElementById('chessboard');
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranksWhite = [8, 7, 6, 5, 4, 3, 2, 1];  
const ranksBlack = [1, 2, 3, 4, 5, 6, 7, 8]; 

function createChessboard(playerColor) {
    const ranks = playerColor === 'white' ? ranksWhite : ranksBlack;

    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        chessboard.appendChild(square);

        const row = Math.floor(i / 8);
        const col = i % 8;

        if (row % 2 === 0) {
            square.classList.add(col % 2 === 0 ? 'dark' : 'light');
        } else {
            square.classList.add(col % 2 === 0 ? 'light' : 'dark');
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

        addPieces(square, row, col, playerColor);
    }
}

function addPieces(square, row, col, playerColor) {
    let piece = null;
    const isBlack = playerColor === 'black';

    if (isBlack) {
        if (row === 1) {
            piece = 'p'; 
        } else if (row === 0) {
            const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
            piece = backRank[col];
        }
        if (row === 6) {
            piece = 'p'; 
        } else if (row === 7) {
            const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']; 
            piece = backRank[col];
        }
    } else {
        if (row === 0) {
            const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']; 
            piece = backRank[col];
        } else if (row === 1) {
            piece = 'p'; 
        }

        if (row === 6) {
            piece = 'p'; 
        } else if (row === 7) {
            const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']; 
            piece = backRank[col];
        }
    }
    if (piece) {
        const img = document.createElement('img');
        const color = (isBlack && row <= 1) || (!isBlack && row >= 6) ? 'white' : 'black';
        img.src = `reqs/${color}_${piece}.svg`;
        img.classList.add('chess-piece');
        square.appendChild(img);
    }
}

createChessboard('white');  