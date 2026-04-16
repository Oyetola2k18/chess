// this is a stockfish api. It reads the current position through a fen string and sends 
// the best move for stockfish to play
class Stockfish {
    constructor() { }

    async getBestMove(fen) {
        return new Promise(async (resolve) => {
            try {
                const response = await fetch("https://chess-api.com/v1", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fen: fen, depth: 5 })
                });

                const data = await response.json();

                // Handle mate detection
                if (data.mate === -1 || (data.mate !== null && data.mate < 0)) {
                    playerLost = true;
                    playerWon = false;
                } else if (data.mate === 1 || (data.mate !== null && data.mate > 0)) {
                    playerWon = true;
                    playerLost = false;
                } else if (data.mate === 0) {
                    playerLost = false;
                    playerWon = false;
                    draw = true;
                }

                if (data.move) {
                    resolve(data.move); // e.g. "e2e4"
                } else {
                    console.error("No move in response:", data);
                    resolve(null);
                }
            } catch (err) {
                console.error("Error fetching from chess-api:", err);
                resolve(null);
            }
        });
    }

    // No longer needed (new API returns move directly), but kept for safety
    extractBestMove(moveString) {
        return moveString; // chess-api.com already returns just the move string e.g. "e2e4"
    }

    async playStockfishMove() {
        const fen = board.convertBoardToFEN();
        const bestMove = await this.getBestMove(fen);
        if (bestMove) {
            if (`${bestMove[0]}${bestMove[1]}` == `${bestMove[2]}${bestMove[3]}`) {
                this.playStockfishMove();
                return;
            }
            board.applyMove(bestMove);
            setTimeout(() => {
                update();
                if (playerLost) {
                    promptUser("Stockfish: You suck at chess lol... wanna play again?");
                } else if (playerWon) {
                    promptUser("Stockfish: There's no way in hell you just beat me!!");
                } else if (draw) {
                    promptUser("Drawing with Stockfish is just wild!!");
                }
            }, 300);
        } else {
            console.error("No valid move received from Stockfish.");
            promptUser("Something went wrong :( Please check your connection");
        }
    }
}