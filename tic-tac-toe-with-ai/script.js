class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.playerScore = 0;
        this.aiScore = 0;
        this.difficulty = 'hard';
        
        this.initGame();
    }

    initGame() {
        this.createBoard();
        this.setupEventListeners();
        this.updateScore();
    }

    createBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            board.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.getElementById('board').addEventListener('click', (e) => {
            if (!e.target.classList.contains('cell') || !this.gameActive) return;
            const index = e.target.dataset.index;
            if (this.board[index]) return;
            this.makeMove(index, 'X');
        });

        document.getElementById('reset').addEventListener('click', () => this.resetGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.resetGame();
        });
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.classList.add(player.toLowerCase());
        cell.textContent = player;

        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
            return;
        }
        if (!this.board.includes(null)) {
            this.endGame('draw');
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus();

        if (this.currentPlayer === 'O') {
            this.aiMove();
        }
    }

    aiMove() {
        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() > 0.5 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        setTimeout(() => this.makeMove(move, 'O'), 500);
    }

    getRandomMove() {
        const available = this.board.reduce((acc, val, idx) => 
            val === null ? [...acc, idx] : acc, []);
        return available[Math.floor(Math.random() * available.length)];
    }

    getBestMove() {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                const score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinner();
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return -10 + depth;
        if (!board.includes(null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    const score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    const score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        const wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of wins) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }

    endGame(result) {
        this.gameActive = false;
        if (result === 'X') {
            this.playerScore++;
            this.updateStatus('You win!');
        } else if (result === 'O') {
            this.aiScore++;
            this.updateStatus('AI wins!');
        } else {
            this.updateStatus('Draw!');
        }
        this.updateScore();
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.createBoard();
        this.updateStatus();
    }

    updateStatus(text) {
        document.getElementById('status').textContent = text || 
            `${this.currentPlayer === 'X' ? 'Your' : 'AI'} turn (${this.currentPlayer})`;
    }

    updateScore() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('ai-score').textContent = this.aiScore;
    }
}

document.addEventListener('DOMContentLoaded', () => new TicTacToe());