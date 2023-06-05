// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict';

import Config from './config.js';

export default class gameManager {
  #onScoreChanged;
  set onScoreChanged(callback) { this.#onScoreChanged = callback; }
  #onHighScoreChanged;
  set onHighScoreChanged(callback) { this.#onHighScoreChanged = callback; }
  #onGameStarted;
  set onGameStarted(callback) { this.#onGameStarted = callback; }
  #onGamePaused;
  set onGamePaused(callback) { this.#onGamePaused = callback; }
  #onGameResumed;
  set onGameResumed(callback) { this.#onGameResumed = callback; }
  #onGameOver;
  set onGameOver(callback) { this.#onGameOver = callback; }
  #onGameReset;
  set onGameReset(callback) { this.#onGameReset = callback; }
  #onSnakeChanged;
  set onSnakeChanged(callback) { this.#onSnakeChanged = callback; }
  #onFoodChanged;
  set onFoodChanged(callback) { this.#onFoodChanged = callback; }

  #snake = undefined;
  get snake() { return this.#snake; }
  #foods = [];
  get foods() { return this.#foods; }
  #score;
  get score() { return this.#score; }
  #highScore;
  get highScore() { return this.#highScore; }
  #fieldWidth;
  #fieldHeight;

  constructor() {
    // Keep this as small as possible to reduce visual load time

  }

  updatePlayingField(fieldWidth, fieldHeight) {
    this.#fieldWidth = fieldWidth;
    this.#fieldHeight = fieldHeight;
    this.#respawnSnake();
    this.#spawnFood();
  }

  #executeIfExists(eventHandler, ...args) {
    eventHandler ? eventHandler(...args) : null;
  }

  #respawnSnake() {
    console.log('respawn snake');
    let snakeHead = this.#getRandomCoordinatesObject();
    snakeHead.direction = Math.random() * 3;
    this.#snake = [snakeHead];
    this.#executeIfExists(this.#onSnakeChanged, this.#snake);
  }

  #spawnFood() {
    let food = this.#getRandomCoordinatesObject();
    this.#foods.push(food);
  }

  #getRandomCoordinatesObject() {
    const x = Math.random() * (this.#fieldWidth - 1);
    const y = Math.random() * (this.#fieldHeight - 1);
    return { x, y };
  }
}