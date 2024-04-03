import React from 'react';
import PropTypes from 'prop-types';
import './App.css';

import { useState } from 'react';

function BlackStone() {
  return <div className="black"></div>;
}

function WhiteStone() {
  return <div className="white"></div>;
}

function Empty() {
  return <div>{true}</div>;
}

function Square({ row, column, value, onSquareClick }) {
  let content;

  if (value === 1) {
    content = <BlackStone />;
  } else if (value == -1) {
    content = <WhiteStone />;
  } else {
    content = <Empty />;
  }

  return (
    <div id={`${row}${column}`} className="square" onClick={onSquareClick}>
      {content}
    </div>
  );
}

Square.propTypes = {
  row: PropTypes.number,
  column: PropTypes.number,
  value: PropTypes.number,
  onSquareClick: PropTypes.func,
}

function Board({currentPlayer, boardData, onPlay}) {
  function handleClick(i) {
    // check if game ends

    const nextBoardData = boardData.slice();

    if (nextBoardData[i] === 0) { // Is it empty?
      nextBoardData[i] = (currentPlayer === 'B' ? 1 : -1);
    }

    onPlay(nextBoardData);
  }

  let content = boardData.map((item, index) => {
    let row = Math.floor(index / 8);
    let column = index % 8;
    return (
      <div key={`${row}${column}`}>
        <Square row={row} 
          column={column} 
          value={item} 
          onSquareClick={() => handleClick(index)} />
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
  onPlay: PropTypes.func,
}

function BoardAreaHeader({ currentPlayerName, nrBlackStones, nrWhiteStones}) {
  return (
    <header>
      <h1>Othello</h1>
      <h2 className='whos-turn'>{currentPlayerName}&apos;s turn</h2>
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
};

function BoardAreaFooter({onUndo, onReset}) {
  return (
    <footer>
      <button className="button undo" onClick={onUndo}>Undo</button>
      <button className="button reset" onClick={onReset}>Reset</button>
    </footer>
  );
}

BoardAreaFooter.propTypes = {
  onUndo: PropTypes.func,
  onReset: PropTypes.func,
};

function BoardArea({currentPlayer, boardData, onPlay, onUndo, onReset}) {
  let currentPlayerName = (currentPlayer === 'B') ? 'Black' : 'White';
  let nrBlackStones = boardData.filter((v) => v === 1).length;
  let nrWhiteStones = boardData.filter((v) => v === -1).length;

  return (
    <div>
      <BoardAreaHeader currentPlayerName={currentPlayerName} 
        nrBlackStones={nrBlackStones}
        nrWhiteStones={nrWhiteStones}/>
      <Board currentPlayer={currentPlayer} 
        boardData={boardData} 
        onPlay={onPlay} />
      <BoardAreaFooter onUndo={onUndo} onReset={onReset}/>
    </div>
  );
}

BoardArea.propTypes = {
  currentPlayer: PropTypes.string,
  boardData: PropTypes.array,
  onPlay: PropTypes.func,
  onUndo: PropTypes.func,
  onReset: PropTypes.func, 
};

function Game() {
  const [history, setHistory] = useState(() => createHistory());
  const [currentMove, setCurrentMove] = useState(0);
  const currentBoardData = history[currentMove];

  // currentPlayer could be derived from state 'currentMove'
  // We should avoid redundant states
  const currentPlayer = currentMove % 2 == 0 ? 'B' : 'W';

  function createHistory() {
    let initBoard = Array(64).fill(0);
    initBoard[3 * 8 + 3] = initBoard[4 * 8 + 4] = -1;
    initBoard[3 * 8 + 4] = initBoard[4 * 8 + 3] = 1;
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

  return (
    <body id='play'>
      <BoardArea currentPlayer={currentPlayer}
        boardData={currentBoardData} 
        onPlay={handlePlay} 
        onUndo={handleUndo} 
        onReset={handleReset} />
    </body>
  );

}

export default Game;