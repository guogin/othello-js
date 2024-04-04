import React from 'react';
import PropTypes from 'prop-types';
import './App.css';

import { useState } from 'react';

// {{{ Constants and common functions
//     these are not React components
const BLACK = 1;
const WHITE = -1;
const EMPTY = 0;
const BLACK_PLAYER = 'B';
const WHITE_PLAYER = 'W';

function coord(x, y) {
  return x + y * 8;
}

function player2Color(player) {
  return (player === BLACK_PLAYER ? BLACK : WHITE);
} 

function delay(func) {
  // a delayed function is executed exactly once
  var result;
  var isEvaluated = false;

  return function () {
    if (!isEvaluated) {
      result = func();
      isEvaluated = true;
    }
    return result;
  };
}

function force(delayed) { // execute the delayed function
  return delayed();
}
// }}}

function BlackStone() {
  return <div className="black"></div>;
}

function WhiteStone() {
  return <div className="white"></div>;
}

function Empty() {
  return <div>{true}</div>;
}

function Square({ row, column, value, isPossibleMove, onSquareClick }) {
  let content;

  if (value === BLACK) {
    content = <BlackStone />;
  } else if (value == WHITE) {
    content = <WhiteStone />;
  } else {
    content = <Empty />;
  }

  if (isPossibleMove) {
    return (
      <div id={`${row}${column}`} className="square possibleMove" onClick={onSquareClick}>
        {content}
      </div>
    );
  } else {
    return (
      <div id={`${row}${column}`} className="square">
        {content}
      </div>
    );
  }
}

Square.propTypes = {
  row: PropTypes.number,
  column: PropTypes.number,
  value: PropTypes.number,
  isPossibleMove: PropTypes.bool,
  onSquareClick: PropTypes.func,
}

function Board({currentPlayer, boardData, possibleMoves, onPlay}) {
  function handleClick(i, possibleMove) {
    console.debug("Player %s clicks cell %d", currentPlayer, i);
    const nextBoardData = force(possibleMove.makeAttackedBoardPromise);
    onPlay(nextBoardData);
  }

  let content = boardData.map((item, index) => {
    const row = Math.floor(index / 8);
    const column = index % 8;
    const possibleMove = possibleMoves.find((move) => move.x === column && move.y === row);
    const isPossibleMove = (possibleMove !== undefined);

    return (
      <div key={`${row}${column}`}>
        <Square row={row} 
          column={column} 
          value={item} 
          isPossibleMove={isPossibleMove}
          onSquareClick={() => handleClick(index, possibleMove)} />
      </div>
    );
  });

  return (
    <section className='board'>
      {content}
    </section>
  );
}

Board.propTypes = {
  currentPlayer: PropTypes.string,
  boardData: PropTypes.array,
  possibleMoves: PropTypes.array,
  onPlay: PropTypes.func,
}

function BoardAreaHeader({ currentPlayerName, nrBlackStones, nrWhiteStones, winningStatus}) {
  return (
    <header>
      <h1>Othello</h1>
      { winningStatus.isGameEnded? (
        <h2 className='whos-turn'>
          {winningStatus.gameResult}
        </h2>
      ) : (
        <h2 className='whos-turn'>
          {currentPlayerName}&apos;s turn
        </h2>
      )}
      
      <h3 className="score-board">
        <span>Blacks: {nrBlackStones}</span>
        <span>Whites: {nrWhiteStones}</span>
      </h3>
    </header>
  );
}

BoardAreaHeader.propTypes = {
  currentPlayerName: PropTypes.string,
  nrBlackStones: PropTypes.number,
  nrWhiteStones: PropTypes.number,
  winningStatus: PropTypes.object,
};

function BoardAreaFooter({noPossibleMoves, onUndo, onPass, onReset}) {
  return (
    <footer>
      <button className="button undo" onClick={onUndo}>Undo</button>
      { noPossibleMoves && ( <button className="button pass" onClick={onPass}>Pass</button> ) }
      <button className="button reset" onClick={onReset}>Restart</button>
    </footer>
  );
}

BoardAreaFooter.propTypes = {
  noPossibleMoves: PropTypes.bool,
  onUndo: PropTypes.func,
  onPass: PropTypes.func,
  onReset: PropTypes.func,
};

function BoardArea({currentPlayer, boardData, possibleMoves, onPlay, onUndo, onPass, onReset, winningStatus}) {
  const currentPlayerName = (currentPlayer === BLACK_PLAYER) ? 'Black' : 'White';
  const nrBlackStones = boardData.filter((v) => v === BLACK).length;
  const nrWhiteStones = boardData.filter((v) => v === WHITE).length;
  const noPossibleMoves = (possibleMoves.length === 0);

  return (
    <div>
      <BoardAreaHeader currentPlayerName={currentPlayerName} 
        nrBlackStones={nrBlackStones}
        nrWhiteStones={nrWhiteStones}
        winningStatus={winningStatus}/>
      <Board currentPlayer={currentPlayer} 
        boardData={boardData} 
        possibleMoves={possibleMoves}
        onPlay={onPlay} />
      <BoardAreaFooter noPossibleMoves={noPossibleMoves} 
        onUndo={onUndo} onPass={onPass} onReset={onReset}/>
    </div>
  );
}

BoardArea.propTypes = {
  currentPlayer: PropTypes.string,
  boardData: PropTypes.array,
  possibleMoves: PropTypes.array,
  onPlay: PropTypes.func,
  onUndo: PropTypes.func,
  onPass: PropTypes.func,
  onReset: PropTypes.func,
  winningStatus: PropTypes.object,
};

function Game() {
  const [history, setHistory] = useState(() => createHistory());
  const [currentMove, setCurrentMove] = useState(0);
  const currentBoardData = history[currentMove];

  // currentPlayer could be derived from state 'currentMove'
  // We should avoid redundant states
  const currentPlayer = currentMove % 2 == 0 ? BLACK_PLAYER : WHITE_PLAYER;

  const possibleMoves = listPossibleMoves(currentBoardData, currentPlayer);

  const winningStatus = {
    isGameEnded: isGameEnded(currentBoardData, currentPlayer),
    gameResult: judgeWinner(currentBoardData),
  };

  function isGameEnded(boardData, player) {
    if (currentBoardData.find((v) => v === EMPTY) === undefined) {
      return true;
    }
    let possibleMovesFromPlayer = listPossibleMoves(boardData, player);
    let possibleMovesFromOpponent = listPossibleMoves(boardData, nextPlayer(player));
    if (possibleMovesFromPlayer.length === 0 && possibleMovesFromOpponent.length === 0) {
      return true;
    }
    return false;
  }

  function judgeWinner(boardData) {
    const nrBlackStones = boardData.filter((v) => v === BLACK).length;
    const nrWhiteStones = boardData.filter((v) => v === WHITE).length;
    
    if (nrBlackStones > nrWhiteStones) {
      return "Winner is Black";
    } else if (nrBlackStones === nrWhiteStones) {
      return "Draw";
    } else {
      return "Winner is White";
    }
  }

  function createHistory() {
    let initBoard = Array(64).fill(0);
    initBoard[coord(3, 3)] = initBoard[coord(4, 4)] = WHITE;
    initBoard[coord(4, 3)] = initBoard[coord(3, 4)] = BLACK;
    return [initBoard]; // history is an array of board data
  }

  function handlePlay(nextBoardData) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextBoardData];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function handleUndo() {
    let previousMove = Math.max(currentMove - 1, 0);
    setCurrentMove(previousMove);
  }

  function handleReset() {
    setCurrentMove(0);
  }

  function handlePass() {
    const nextHistory = [...history.slice(0, currentMove + 1), currentBoardData];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function listPossibleMoves(board, player) {
    return listAttackingMoves(board, player);
  }

  function canAttack(vulnerableCells) {
    return vulnerableCells.length > 0;
  }

  function nextPlayer(player) {
    return player === BLACK_PLAYER ? WHITE_PLAYER : BLACK_PLAYER;
  }

  function makeAttackedBoard(board, x, y, vulnerableCells, player) {
    // make a new board just as player has put a stone on (x, y)
    const playerColor = player2Color(player);
    let newBoard = board.slice();
    newBoard[coord(x, y)] = playerColor;
    for (let i = 0; i < vulnerableCells.length; i++)
      newBoard[vulnerableCells[i]] = playerColor; // flip

    return newBoard;
  }

  function listAttackingMoves(board, player) {
    // For every coordinate on the board,
    // if for current player, if there is any vulnerable cells available
    // then this coordinate is one potential attacking move
    let moves = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        let vulnerableCells = listVulnerableCells(board, x, y, player);
        if (canAttack(vulnerableCells)) {
          moves.push({
            x: x,
            y: y,
            makeAttackedBoardPromise: (function(x, y, vulnerableCells) {
              return delay(function () {
                return makeAttackedBoard(board, x, y, vulnerableCells, player);
              });
            })(x, y, vulnerableCells),
          });
        }
      }
    }

    return moves;
  }

  function listVulnerableCells(board, x, y, player) {
    // For coordinate (x, y), if it is empty,
    // then we assume we're going to put a stone for player on it,
    // and test all eight directions and find vulnerable cells
    let vulnerableCells = [];

    if (board[coord(x, y)] !== EMPTY)
      return vulnerableCells;

    const opponent = nextPlayer(player);
    const playerColor = player2Color(player);
    const opponentColor = player2Color(opponent);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0)
          continue;
        for (let i = 1; i < 8; i++) {
          let nx = x + i * dx;
          let ny = y + i * dy;
          if (nx < 0 || 8 <= nx || ny < 0 || 8 <= ny) // bound test
            break;
          let cell = board[coord(nx, ny)];
          if (cell === playerColor && 2 <= i) {
            for (let j = 1; j < i; j++)
              vulnerableCells.push(coord(x + j * dx, y + j * dy));
            break;
          }
          if (cell !== opponentColor)
            break;
        }
      }
    }

    return vulnerableCells;
  }

  return (
    <body id='play'>
      <BoardArea currentPlayer={currentPlayer}
        boardData={currentBoardData} 
        possibleMoves={possibleMoves}
        onPlay={handlePlay} 
        onUndo={handleUndo}
        onPass={handlePass}
        onReset={handleReset}
        winningStatus={winningStatus} />
    </body>
  );

}

export default Game;