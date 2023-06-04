// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict'

export default class gameManager {
  #onScoreChanged;
  #onHighScoreChanged;
  #onGameStarted;
  #onGamePaused;
  #onGameResumed;
  #onGameOver;
  #onGameReset;
  #onSnakeChanged;
  #onFruitChanged;

  #snake;
  get snake() { return this.#snake; }
  #fruits;
  get fruits() { return this.#fruits; }
  #score;
  get score() { return this.#score; }
  #highScore;
  get highScore() { return this.#highScore; }

  constructor() {
    // Keep this as small as possible to reduce load time
    this.#snake = this.#createSnake();
  }

  #createSnake() {
    let snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    return snake
  }  
}