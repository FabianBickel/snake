// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict';

import Config from './config.js';

export default class gameManager {
  #onGameOver;
  set onGameOver(callback) { this.#onGameOver = callback; }
  set onSnakeChanged(callback) { this.#listenableVariables['snake'].callback = callback; }
  set onFoodsChanged(callback) { this.#listenableVariables['foods'].callback = callback; }
  set onScoreChanged(callback) { this.#listenableVariables['score'].callback = callback; }
  set onHighScoreChanged(callback) { this.#listenableVariables['highScore'].callback = callback; }

  #listenableVariables = {
    snake: {},
    foods: {},
    score: {},
    highScore: {}
  };

  #setListenableVariable(variableName, value) {
    this.#listenableVariables[variableName].value = value;
    this.#executeIfExists(this.#listenableVariables[variableName].callback, value);
  }

  #executeIfExists(eventHandler, ...args) {
    if (eventHandler) {
      eventHandler(...args);
    }
  }

  get snake() {
    let snake = this.#listenableVariables.snake.value;
    const timeDifference = Date.now() - this.#lastIntervalUpdate;
    const fraction = timeDifference / this.#frameTime;
    const fractionCapped = Math.min(fraction, 1);
    snake[0].fraction = fractionCapped;

    for (let i = 1; i < snake.length; i++) {
      snake[i].fraction = 1;
    }

    return snake;
  }
  get #snake() { return this.#listenableVariables.snake.value; }
  set #snake(value) { this.#setListenableVariable('snake', value); }
  get #foods() { return this.#listenableVariables.foods.value; }
  set #foods(value) { this.#setListenableVariable('foods', value); }
  get #score() { return this.#listenableVariables.score.value; }
  set #score(value) { this.#setListenableVariable('score', value); }
  get #highScore() { return this.#listenableVariables.highScore.value; }
  set #highScore(value) { this.#setListenableVariable('highScore', value); }

  #fieldWidth;
  #fieldHeight;

  #snakeSpeed;
  #frameTime;
  #lastIntervalUpdate;

  #direction = -1;
  #newDirection = -1;
  #bufferedDirection = -1;

  #game;
  #gamePaused;
  #gameOver;

  constructor() {
    // Keep this as small as possible to reduce visual load time
    this.updateSnakeSpeed(Config.fallbackSnakeSpeed);
  }

  updatePlayingField(fieldWidth, fieldHeight) {
    this.#fieldWidth = fieldWidth;
    this.#fieldHeight = fieldHeight;
    this.resetGame();
  }

  #resetSnake() {
    let snakeHead = this.#getRandomCoordinatesObject();
    const randomDirection = Math.random() * 3;
    const randomDirectionRounded = Math.floor(randomDirection);
    snakeHead.direction = randomDirectionRounded;
    snakeHead.fraction = 1;
    this.#snake = [snakeHead];
  }

  #resetFoods() {
    let food;
    do {
      food = this.#getRandomCoordinatesObject();
    } while (this.#overlapsWithSnake(food));
    this.#foods = [food];
  }

  #getRandomCoordinatesObject() {
    const x = Math.random() * this.#fieldWidth;
    const y = Math.random() * this.#fieldHeight;
    const roundedX = Math.floor(x);
    const roundedY = Math.floor(y);
    return { x: roundedX, y: roundedY };
  }

  updateSnakeSpeed(snakeSpeed) {
    this.#snakeSpeed = snakeSpeed;
    this.#frameTime = 1000 / (snakeSpeed / 10);

    const timeSinceLastFrame = this.#getTimeSinceLastFrame();
    const timeToNextFrame = Math.max(this.#frameTime - timeSinceLastFrame, 0);
    this.#updateGameLoopInterval(timeToNextFrame);
  }

  #updateDirection() {
    if (this.#gamePaused) return;
    if (this.#newDirection != -1) {
      this.#direction = this.#newDirection;
    }
    this.#newDirection = this.#bufferedDirection;
    this.#bufferedDirection = -1;
  }

  handleDirectionInput(directionPressed) {
    if (directionPressed == -1) return;
    if (this.#gamePaused) return;

    let direction = this.#direction;
    if (direction == -1) {
      direction = this.#snake[0].direction;
    }

    const isLinus = this.#snake.length == 1;

    if (isLinus) {
      this.#handleDirectionInputWhenLinus(directionPressed);
    } else {
      this.#handleDirectionInputWhenLong(direction, directionPressed);
    }
  }

  #handleDirectionInputWhenLinus(directionPressed) {
    if (this.#newDirection == -1) {
      this.#newDirection = directionPressed;
    } else if (this.#bufferedDirection == -1 && directionPressed != this.#newDirection) {
      this.#bufferedDirection = directionPressed;
    }
  }

  #handleDirectionInputWhenLong(direction, directionPressed) {
    const isParallel = directionPressed % 2 == direction % 2;
    const isOpposite = directionPressed == (direction + 2) % 4;

    if (this.#newDirection == -1) {
      if (!isOpposite) {
        this.#newDirection = directionPressed;
      }
      return;
    }
    
    const isOppositeOfNew = directionPressed == (this.#newDirection + 2) % 4;
    const canSetBufferedDirection = !isOppositeOfNew && this.#bufferedDirection == -1 && directionPressed != this.#newDirection;
    
    if (canSetBufferedDirection) {
      this.#bufferedDirection = directionPressed;
    }
  }

  #getTimeSinceLastFrame() {
    const now = Date.now();
    return now - this.#lastIntervalUpdate;
  }

  #updateGameLoopInterval(timeToNextFrame) {
    if (!this.#game) return;
    clearInterval(this.#game);
    setTimeout(() => {
      this.#game = setInterval(this.#gameLoop.bind(this), this.#frameTime);
    }, timeToNextFrame);
  }

  requestFrameProgress() {
    const timeSinceLastFrame = this.#getTimeSinceLastFrame();
    const progress = timeSinceLastFrame / this.#frameTime;
    return progress;
  }

  startGame() {
    if (this.#gameOver) this.resetGame();
    this.#gamePaused = false;
    if (this.#game) return;
    if (!this.#snake || !this.#foods || this.#snake.length == 0 || this.#foods.length == 0) {
      throw new Error('Game cannot be started without snake or foods'
        , `snake: ${this.#snake}`
        , `foods: ${this.#foods}`
      );
    }
    this.#game = setInterval(this.#gameLoop.bind(this), this.#frameTime);
  }

  #gameLoop() {
    if (this.#gamePaused) return;
    this.#updateDirection();
    if (this.#direction == -1) return;
    this.#setIntervalTimestamp();
    if (this.#snakeIsColliding()) {
      this.#gameOver = true;
      this.#onGameOver();
      this.resetGame();
      return;
    }
    this.#handleSnakeMovement();
    this.#score = this.#snake.length - 1;
    this.#highScore = Math.max(this.#highScore, this.#score);
    localStorage.setItem('highScore', this.#highScore);
  }

  #setIntervalTimestamp() {
    const now = Date.now();
    this.#lastIntervalUpdate = now;
  }

  #snakeIsColliding() {
    const { x, y } = this.#getNewSnakeHead();
    if (this.#isOutOfBounds(x, y)) return true;
    if (this.#overlapsWithSnake(x, y)) return true;
  }

  #isOutOfBounds(x, y) {
    if (x < 0 || y < 0) return true;
    if (x >= this.#fieldWidth || y >= this.#fieldHeight) return true;
    return false;
  }

  #overlapsWithSnake(x, y) {
    for (let i = this.#snake.length - 1; i >= 0; i--) {
      const snakePart = this.#snake[i];
      if (snakePart.x === x && snakePart.y === y) return true;
    }
    return false;
  }

  #handleSnakeMovement() {
    const newHead = this.#getNewSnakeHead();
    this.#snake.unshift(newHead);
    if (this.#checkFoodEaten()) {
      this.#resetFoods();
      return;
    }
    this.#snake.pop();
  }

  #checkFoodEaten() {
    const snakeHead = this.#snake[0];
    for (const food of this.#foods) {
      if (snakeHead.x === food.x && snakeHead.y === food.y) {
        return true;
      }
    }
  }

  #getNewSnakeHead() {
    const snakeHead = this.#snake[0];
    let newX = snakeHead.x;
    let newY = snakeHead.y;
    if (this.#direction === 0) newY--;
    if (this.#direction === 1) newX++;
    if (this.#direction === 2) newY++;
    if (this.#direction === 3) newX--;
    return { x: newX, y: newY, direction: this.#direction, fraction: 0 };
  }

  pauseGame() {
    this.#gamePaused = true;
    this.#direction = -1;
  }

  resumeGame() {
    this.#gamePaused = true;
  }

  resetGame() {
    this.#resetSnake();
    this.#resetFoods();
    this.#gameOver = false;
    this.#gamePaused = true;

    this.#direction = -1;
    this.#newDirection = -1;
    this.#bufferedDirection = -1;

    this.#score = 0;
    this.#highScore = localStorage.getItem('highScore');
  }
}