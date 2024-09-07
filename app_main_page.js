// let tg = window.Telegram.WebApp;

// tg.expand();
// tg.ready();

const chessboard = document.getElementById('chessboard');

function createChessboard() {
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        

        square.classList.add('square');
        chessboard.appendChild(square);

        if (Math.floor(i / 8) % 2 === 0) {
            square.classList.add(i % 2 === 0 ? 'dark' : 'light');
        } else {
            square.classList.add(i % 2 === 0 ? 'light' : 'dark');
        }
        // console.log("Added square " + i);

        square.addEventListener('click', function () {
            console.log("Clicked square " + i)
        });
    }
}

createChessboard();