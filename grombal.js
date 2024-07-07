const pieces = {
    'B': '<img src="pieces/bearb.png" width="50">', 'b': '<img src="pieces/bear.png" width="50">',
    'J': '<img src="pieces/jarlb.png" width="50">', 'j': '<img src="pieces/jarl.png" width="50">',
    'A': '<img src="pieces/archertowerb.png" width="50">', 'a': '<img src="pieces/archertower.png" width="50">',
    'S': '<img src="pieces/stashb.png" width="50">', 's': '<img src="pieces/stash.png" width="50">',
    'W': '<img src="pieces/warriorb.png" width="50">', 'w': '<img src="pieces/warrior.png" width="50">',
};

const moves = [];
let crp = 'w';
let gended = false;
const bstate = [
    ['A', 'B', 'S', 'A', 'B'],
    ['W', 'W', 'J', 'W', 'W'],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['w', 'w', 'j', 'w', 'w'],
    ['b', 'a', 's', 'b', 'a']
];

let smartness = 1;
let chat = [
    'Meow!', 'Meow, meow, meow!', 'Gib fish! meow!', 'KSSSSSSSSSSSSSSSSS MEOOOOOW'
]

const jpi = 150
let awrd = 0
if (jpi >= localStorage.getItem('JPI')) {
    awrd = Math.abs(jpi - localStorage.getItem('JPI'))
}

document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("chessboard");

    function boardc() {
        board.innerHTML = '';
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 5; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = row;
                square.dataset.col = col;
                if (bstate[row][col]) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece');
                    piece.innerHTML = pieces[bstate[row][col]];
                    piece.dataset.piece = bstate[row][col];
                    piece.dataset.color = bstate[row][col] === bstate[row][col].toUpperCase() ? 'b' : 'w';
                    square.appendChild(piece);
                }
                board.appendChild(square);
            }
        }
    }

    function ilm(frw, fcl, trw, tcl, piece) {
        const rd = trw - frw;
        const cd = tcl - fcl;
        const targetPiece = bstate[trw][tcl];
        if (trw < 0 || trw >= 9 || tcl < 0 || tcl >= 5) {
            return false;
        }
        if (targetPiece && ((targetPiece === targetPiece.toUpperCase() && piece === piece.toUpperCase()) || (targetPiece === targetPiece.toLowerCase() && piece === piece.toLowerCase()))) {
            return false;
        }

        switch (piece.toLowerCase()) {
            case 'b':
                return (Math.abs(rd) === 2 && Math.abs(cd) === 1) || (Math.abs(rd) === 1 && Math.abs(cd) === 2);
            case 'w':
                if (crp === 'w' && rd === -1 && cd === 0 && !targetPiece) {
                    return true;
                }
                if (crp === 'b' && rd === 1 && cd === 0 && !targetPiece) {
                    return true;
                }
                if ((crp === 'w' && rd === -1 && (Math.abs(cd) === 1 || Math.abs(cd) === 0) && targetPiece) ||
                    (crp === 'b' && rd === 1 && (Math.abs(cd) === 1 || Math.abs(cd) === 0) && targetPiece)) {
                    return true;
                }
                return false;
            case 'a':
                if (Math.abs(rd) !== Math.abs(cd)) {
                    return false;
                }
                const rs = rd > 0 ? 1 : -1;
                const cs = cd > 0 ? 1 : -1;
                let r = frw + rs;
                let c = fcl + cs;
                while (r !== trw && c !== tcl) {
                    if (bstate[r][c]) {
                        return false;
                    }
                    r += rs;
                    c += cs;
                }
                return true;
            case 'j':
                if ((Math.abs(rd) === 1 && cd === 0) || (Math.abs(cd) === 1 && rd === 0) || (Math.abs(rd) === 2 && cd === 0)) {
                    return true;
                }
                return false;
            case 's':
                if (Math.abs(rd) === 1 && Math.abs(cd) === 1) {
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    function evaluateBoard() {
        let score = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 5; col++) {
                const piece = bstate[row][col];
                if (piece) {
                    const value = pieceValue(piece);
                    score += piece === piece.toUpperCase() ? value : -value;
                }
            }
        }
        return score;
    }

    function pieceValue(piece) {
        switch (piece.toLowerCase()) {
            case 'b':
                return 4;
            case 'w':
                return 1;
            case 'a':
                return 5;
            case 'j':
                return 9;
            case 's':
                return 10;
            default:
                return 0;
        }
    }

    function minimax(depth, alpha, beta, maximizingPlayer) {
        if (depth === 0) {
            return evaluateBoard();
        }

        let bestMove;
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            const possibleMoves = generateMoves('b');
            for (const move of possibleMoves) {
                const capturedPiece = makeMove(move);
                const eval = minimax(depth - 1, alpha, beta, false);
                undoMove(move, capturedPiece);
                if (eval > maxEval) {
                    maxEval = eval;
                    bestMove = move;
                }
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            if (depth === smartness) return bestMove;
            return maxEval;
        } else {
            let minEval = Infinity;
            const possibleMoves = generateMoves('w');
            for (const move of possibleMoves) {
                const capturedPiece = makeMove(move);
                const eval = minimax(depth - 1, alpha, beta, true);
                undoMove(move, capturedPiece);
                if (eval < minEval) {
                    minEval = eval;
                    bestMove = move;
                }
                beta = Math.min(beta, eval);
                if (beta <= alpha) {
                    break;
                }
            }
            return minEval;
        }
    }

    function generateMoves(playerColor) {
        const moves = [];
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 5; col++) {
                if (bstate[row][col] && ((playerColor === 'b' && bstate[row][col].toUpperCase() === bstate[row][col]) ||
                    (playerColor === 'w' && bstate[row][col].toLowerCase() === bstate[row][col]))) {
                    for (let trw = 0; trw < 9; trw++) {
                        for (let tcl = 0; tcl < 5; tcl++) {
                            if (ilm(row, col, trw, tcl, bstate[row][col])) {
                                moves.push({ frw: row, fcl: col, trw: trw, tcl: tcl });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }

    function makeMove(move) {
        const capturedPiece = bstate[move.trw][move.tcl];
        bstate[move.trw][move.tcl] = bstate[move.frw][move.fcl];
        bstate[move.frw][move.fcl] = '';
        return capturedPiece;
    }

    function undoMove(move, capturedPiece) {
        bstate[move.frw][move.fcl] = bstate[move.trw][move.tcl];
        bstate[move.trw][move.tcl] = capturedPiece;
    }

    function isCaptureMove(move, playerColor) {
        const targetPiece = bstate[move.trw][move.tcl];
        if (targetPiece && ((playerColor === 'b' && targetPiece.toLowerCase() === targetPiece) ||
            (playerColor === 'w' && targetPiece.toUpperCase() === targetPiece))) {
            return true;
        }
        return false;
    }

    function aim() {
        if (gended) return;

        const bestMove = minimax(smartness, -Infinity, Infinity, true);
        console.log('Best move:', bestMove);

        if (bestMove) {
            const capturedPiece = makeMove(bestMove);
            console.log('Board state after move:', bstate);
            console.log('Piece at destination:', capturedPiece);

            if (capturedPiece && capturedPiece === 's') {
                gended = true;
                alert('Game Over! AI captured the Stash.');
                subjpi(awrd)
                return;
            }

            moves.push(`${bstate[bestMove.trw][bestMove.tcl]}${bestMove.trw}${bestMove.tcl}`);
            const msg = chat[Math.floor(Math.random() * chat.length)]
            document.getElementById('chat').textContent = msg
            boardc();
            crp = crp === 'w' ? 'b' : 'w';
        }
    }


    let slp = null;
    board.addEventListener('click', (event) => {
        if (gended) return;
        const target = event.target.closest('.piece, .square');
        if (!target) return;

        if (target.classList.contains('piece')) {
            if (slp) {
                const pieceColor = target.dataset.piece === target.dataset.piece.toUpperCase() ? 'b' : 'w';
                if (pieceColor !== crp) {
                    const [frw, fcl] = [slp.parentNode.dataset.row, slp.parentNode.dataset.col];
                    const [trw, tcl] = [target.parentNode.dataset.row, target.parentNode.dataset.col];
                    if (ilm(Number(frw), Number(fcl), Number(trw), Number(tcl), slp.dataset.piece)) {
                        const capturedPiece = makeMove({ frw: Number(frw), fcl: Number(fcl), trw: Number(trw), tcl: Number(tcl) });
                        moves.push(`${bstate[trw][tcl]}${trw}${tcl}`);
                        boardc();
                        if (capturedPiece && (capturedPiece.toLowerCase() === 's')) {
                            gended = true;
                            alert('Game Over! You captured the Stash.');
                            addjpi(awrd)
                            return;
                        }
                        slp.classList.remove('selected');
                        slp = null;
                        crp = crp === 'w' ? 'b' : 'w';
                        setTimeout(aim, 500);
                        return;
                    }
                }
                slp.classList.remove('selected');
                slp = null;
            }
            const pieceColor = target.dataset.piece === target.dataset.piece.toUpperCase() ? 'b' : 'w';
            if (pieceColor === crp) {
                slp = target;
                slp.classList.add('selected');
            }
        } else if (slp && target.classList.contains('square')) {
            let [frw, fcl] = [slp.parentNode.dataset.row, slp.parentNode.dataset.col];
            let [trw, tcl] = [target.dataset.row, target.dataset.col];
            if (ilm(Number(frw), Number(fcl), Number(trw), Number(tcl), slp.dataset.piece)) {
                const capturedPiece = makeMove({ frw: Number(frw), fcl: Number(fcl), trw: Number(trw), tcl: Number(tcl) });
                moves.push(`${bstate[trw][tcl]}${trw}${tcl}`);
                boardc();
                if (capturedPiece && (capturedPiece.toLowerCase() === 's')) {
                    gended = true;
                    alert('Game Over! You captured the Stash.');
                    addjpi(awrd)
                    return;
                }
                slp.classList.remove('selected');
                slp = null;
                crp = crp === 'w' ? 'b' : 'w';
                setTimeout(aim, 500);
            } else {
                slp.classList.remove('selected');
                slp = null;
            }
        }
    });

    boardc();
});

let savemenu = false

function save() {
    if (savemenu == false) {
        savemenu = true
        const div = document.createElement('div')
        div.id = 'savemenu'
        const c = document.createElement('div')
        let text = ''
        moves.forEach(move => {
            text += ' ' + move
        })
        c.textContent = text
        c.style = 'border: 2px solid black; overflow-y: scroll; padding: 10px; width: 100px; height: 150px; background-color: #f0f0f0;'
        div.style = 'padding: 10px; position: fixed;'
        div.appendChild(c)
        document.body.appendChild(div)
    } else {
        savemenu = false
        document.getElementById('savemenu').remove()
    }
}
