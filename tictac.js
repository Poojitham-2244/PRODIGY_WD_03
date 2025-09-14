// Game state variables
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'pvp'; // 'pvp' for Player vs Player, 'pvc' for Player vs Computer
let scores = { X: 0, O: 0, draw: 0 };

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// DOM elements
const cells = document.querySelectorAll('.cell');
const gameStatus = document.getElementById('gameStatus');
const pvpBtn = document.getElementById('pvpBtn');
const pvcBtn = document.getElementById('pvcBtn');
const resetBtn = document.getElementById('resetBtn');
const newGameBtn = document.getElementById('newGameBtn');
const winOverlay = document.getElementById('winOverlay');
const winMessage = document.getElementById('winMessage');
const winIcon = document.getElementById('winIcon');
const playAgainBtn = document.getElementById('playAgainBtn');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreDraw = document.getElementById('scoreDraw');
const playerXName = document.getElementById('playerXName');
const playerOName = document.getElementById('playerOName');

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
pvpBtn.addEventListener('click', () => setGameMode('pvp'));
pvcBtn.addEventListener('click', () => setGameMode('pvc'));
resetBtn.addEventListener('click', resetGame);
newGameBtn.addEventListener('click', newGame);
playAgainBtn.addEventListener('click', closeOverlayAndReset);

// Initialize game
updateDisplay();
updateScoreDisplay();

function handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);
    
    if (board[index] !== '' || !gameActive) return;
    
    makeMove(index, currentPlayer);
    
    if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    
    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'taken', 'cell-click');
    
    setTimeout(() => cell.classList.remove('cell-click'), 300);
    
    if (checkWinner()) {
        endGame(player);
    } else if (board.every(cell => cell !== '')) {
        endGame('draw');
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateGameStatus();
    }
}

function makeAIMove() {
    if (!gameActive) return;
    
    let move = getBestMove();
    if (move !== -1) {
        makeMove(move, 'O');
    }
}

function getBestMove() {
    // AI Strategy: Easy to Medium difficulty
    
    // 1. Try to win
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (checkWinner() && getWinningCombination().includes(i)) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
    // 2. Block player from winning
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            if (checkWinner() && getWinningCombination().includes(i)) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
    // 3. Take center if available
    if (board[4] === '') return 4;
    
    // 4. Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => board[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // 5. Take any available space
    const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
}

function checkWinner() {
    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

function getWinningCombination() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return combination;
        }
    }
    return [];
}

function endGame(winner) {
    gameActive = false;
    
    if (winner === 'draw') {
        scores.draw++;
        showWinOverlay('It\'s a Draw!', '🤝');
        updateGameStatus('It\'s a Draw!');
    } else {
        scores[winner]++;
        const winnerName = winner === 'X' ? playerXName.textContent : playerOName.textContent;
        showWinOverlay(`${winnerName} Wins!`, winner === 'X' ? '🔥' : '⭐');
        updateGameStatus(`${winnerName} Wins!`);
        highlightWinningCells();
    }
    
    updateScoreDisplay();
}

function highlightWinningCells() {
    const winningCombo = getWinningCombination();
    winningCombo.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function showWinOverlay(message, icon) {
    winMessage.textContent = message;
    winIcon.textContent = icon;
    winOverlay.classList.remove('hidden');
}

function closeOverlayAndReset() {
    winOverlay.classList.add('hidden');
    resetGame();
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'taken', 'winning');
    });
    
    updateGameStatus();
    winOverlay.classList.add('hidden');
}

function newGame() {
    resetGame();
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreDisplay();
}

function setGameMode(mode) {
    gameMode = mode;
    
    if (mode === 'pvp') {
        pvpBtn.classList.add('active');
        pvcBtn.classList.remove('active');
        playerOName.textContent = 'Player 2';
    } else {
        pvcBtn.classList.add('active');
        pvpBtn.classList.remove('active');
        playerOName.textContent = 'AI';
    }
    
    resetGame();
}

function updateGameStatus() {
    if (!gameActive) return;
    
    const currentPlayerName = currentPlayer === 'X' ? playerXName.textContent : playerOName.textContent;
    gameStatus.textContent = `${currentPlayerName}'s Turn`;
}

function updateDisplay() {
    updateGameStatus();
}

function updateScoreDisplay() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}