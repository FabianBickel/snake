// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict';

import Config from './config.js';
import { Element, Selector, Display, changeColorOfSvg, getComplementaryColor } from './gui-functions.js';

export default class GuiManager {
  #onFieldSizeChanged;
  set onFieldSizeChanged(callback) { this.#onFieldSizeChanged = callback; }
  #onGameStarted;
  set onGameStarted(callback) { this.#onGameStarted = callback; }
  #onGamePaused;
  set onGamePaused(callback) { this.#onGamePaused = callback; }
  #onSnakeSpeedChanged;
  set onSnakeSpeedChanged(callback) { this.#onSnakeSpeedChanged = callback; }
  #onDirectionInput;
  set onDirectionInput(callback) { this.#onDirectionInput = callback; }
  #requestSnakeState;
  set requestSnakeState(callback) { this.#requestSnakeState = callback; }

  #snake;
  #food;

  #canvas;
  #context;

  #backgroundColor;
  #snakeColor;
  #foodColor;
  #snakePattern;
  #snakeSpeed;

  #boxWidth;
  #boxHeight;
  #fieldWidth;
  #fieldHeight;

  #transitionDuration;
  #lastSnakeUpdate;

  constructor() {
    this.#transitionDuration = Config.transitionDuration;
    this.#boxWidth = Config.boxSize;
    this.#boxHeight = Config.boxSize;

    this.#backgroundColor = Config.fallbackBackgroundColor;
    this.#snakeColor = Config.fallbackSnakeColor;
    this.#foodColor = Config.fallbackFoodColor;
    this.#snakePattern = Config.fallbackSnakePattern;

    this.#fieldWidth = Math.floor(window.innerWidth / this.#boxWidth);
    this.#fieldHeight = Math.floor(window.innerHeight / this.#boxHeight);

    window.onload = onDocumentLoaded.bind(this);
    
    function onDocumentLoaded() {
      this.#setTransitionDuration.bind(this)(Config.transitionDuration);
      getCanvasVariables.bind(this)();
      addChangeEventListeners.bind(this)();
      
      let options = [];
      for (const theme of Config.themes) {
        let option = document.createElement('option');
        option.textContent = theme.name;
        option.value = JSON.stringify(theme);
        options.push(option);
      }
      Selector.theme.append(...options);
      this.#applyPreset.bind(this)();
      options = [];
      for (const difficultyLevel of Config.difficultyLevels) {
        let option = document.createElement('option');
        option.value = difficultyLevel.speed;
        option.textContent = difficultyLevel.name;
        options.push(option);
      }
      Selector.snakeSpeed.append(...options);
      options = [];
      for (const pattern of Config.snakePatterns) {
        let option = document.createElement('option');
        option.value = pattern.path;
        option.textContent = pattern.name;
        options.push(option);
      }
      Selector.snakePattern.append(...options);
    };

    function getCanvasVariables() {
      this.#canvas = Element.canvas;
      this.#canvas.width = this.#fieldWidth * this.#boxWidth;
      this.#canvas.height = this.#fieldHeight * this.#boxHeight;
      this.#context = Element.context;
      this.#onFieldSizeChanged(this.#fieldWidth, this.#fieldHeight);
    }

    function addChangeEventListeners() {
      Selector.theme
        .addEventListener('change', this.#applyPreset.bind(this));
      Selector.backgroundColor.addEventListener('change', this.#updateBackgroundColor.bind(this));
      Selector.snakeColor.addEventListener('change', this.#updateSnakeColor.bind(this));
      Selector.snakePattern.addEventListener('change', this.#updateSnakePattern.bind(this));
      Selector.snakeSpeed.addEventListener('change', this.#updateSnakeSpeed.bind(this));

      Element.startGame.addEventListener('click', this.#startGame.bind(this));
      Element.pauseGame.addEventListener('click', this.#pauseGame.bind(this));

      window.addEventListener('keydown', this.#handleKeyboardInput.bind(this));
      document.addEventListener('touchstart', this.#handleTouchStart.bind(this));
      document.addEventListener('touchmove', this.#handleTouchMove.bind(this));
    }
  }

  updateSnake(snake) {
    this.#lastSnakeUpdate = Date.now();
    if (!snake) return;
    this.#snake = snake;
  }

  updateFood(food) {
    this.#food = food;
  }

  updateScore(score) {
    Display.score(score || 0);
  }

  updateHighScore(highScore) {
    Display.highScore(highScore || 'none');
  }

  #updateBackgroundColor() {
    this.#backgroundColor = Selector.backgroundColor.value;
    Display.backgroundColor();
  }

  #updateSnakeColor() {
    this.#snakeColor = Selector.snakeColor.value;
    Display.snakeColor();
  }

  #updateSnakePattern() {
    const path = Selector.snakePattern.value;
    const color = getComplementaryColor(this.#snakeColor, 0);
    changeColorOfSvg(path, color, image => {
      this.#snakePattern = this.#context.createPattern(image, 'repeat');
      Display.snakePattern();
    });
  }

  #updateSnakeSpeed() {
    this.#snakeSpeed = Selector.snakeSpeed.value;
    this.#onSnakeSpeedChanged(this.#snakeSpeed);
  }

  #setTransitionDuration(duration) {
    this.#transitionDuration = duration;
    const transitionElements = [
      Element.menuOverlay,
    ];
    transitionElements.forEach(element => {
      element.style.transitionDuration = `${this.#transitionDuration}ms`;
    });
  }

  #applyPreset() {
    const preset = JSON.parse(Selector.theme.value);
    Selector.backgroundColor.value = preset.backgroundColor;
    Selector.snakeColor.value = preset.snakeColor;
    this.#updateBackgroundColor();
    this.#updateSnakeColor();
    Display.backgroundColor();
    Display.snakeColor();
  }

  #startGame() {
    console.log('start game');
    this.#startDrawing();
    this.#executeIfExists(this.#onGameStarted);
    Element.menuOverlay.classList = 'afterStart';
    Element.menuOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    setTimeout(() => {
      Element.menuOverlay.style.display = 'none';
      const elements = document.getElementsByClassName('gameOver');
      for (const element of elements) {
        element.hidden = true;
      }
    }, this.#transitionDuration);
  }

  #pauseGame() {
    console.log('pause game');
    this.#executeIfExists(this.#onGamePaused);
    Element.startGame.textContent = 'Continue';
    Element.menuOverlay.style.display = 'flex';
    Element.menuOverlay.classList = 'afterPause';
  }

  gameOver() {
    console.log('game over');
    Element.startGame.textContent = 'Restart Game';

    Element.menuOverlay.style.display = 'flex';
    Element.menuOverlay.classList = 'afterPause backgroundColor';
    Display.backgroundColor();
    const elements = document.getElementsByClassName('gameOver');
    for (const element of elements) {
      element.hidden = false;
    }
  }

  #handleKeyboardInput(event) {
    const key = event.key;
    this.#handleDirectionInputs(key);
    this.#handleStartPauseInputs(key);
  }

  #handleDirectionInputs(key) {
    let directionPressed = -1;
    if (key == 'ArrowUp' || key == 'w')
      directionPressed = 0;
    else if (key == 'ArrowRight' || key == 'd')
      directionPressed = 1;
    else if (key == 'ArrowDown' || key == 's')
      directionPressed = 2;
    else if (key == 'ArrowLeft' || key == 'a')
      directionPressed = 3;
    this.#onDirectionInput(directionPressed);
  }

  #handleStartPauseInputs(key) {
    if (key == 'Enter') this.#startGame();
    if (key == 'Escape' || key == ' ' || key == 'p') this.#pauseGame();
  }


  #initialX = null;
  #initialY = null;

  #handleTouchStart(e) {
    this.#initialX = e.touches[0].clientX;
    this.#initialY = e.touches[0].clientY;
  }

  #handleTouchMove(e) {
    if (this.#initialX === null || this.#initialY === null) {
      return;
    }

    let diffX = this.#initialX - e.touches[0].clientX;
    let diffY = this.#initialY - e.touches[0].clientY;

    let direction = -1;
    if (this.#swipedHorizontally(diffX, diffY)) {
      if (diffX > 0) {
        direction = 3;
      } else {
        direction = 1;
      }
    } else {
      if (diffY > 0) {
        direction = 0;
      } else {
        direction = 2;
      }
    }
    this.#onDirectionInput(direction);

    this.#initialX = null;
    this.#initialY = null;
  }

  #swipedHorizontally(diffX, diffY) {
    return Math.abs(diffX) > Math.abs(diffY);
  }

  #executeIfExists(eventHandler, ...args) {
    eventHandler ? eventHandler(...args) : null;
  }

  #isDrawing = false;

  #startDrawing() {
    this.#lastSnakeUpdate = Date.now();
    if (this.#isDrawing) return;
    this.#isDrawing = true;
    this.#initializeDrawing();
  }

  #stopDrawing() {
    this.#isDrawing = false;
  }

  #initializeDrawing() {
    if (!this.#isDrawing) return;
    this.drawFrame();
    requestAnimationFrame(this.#initializeDrawing.bind(this));
  }

  drawFrame() {
    this.#clearCanvas();
    this.#drawGrid();
    this.#drawSnake();
    this.#drawFoods();
  }

  #clearCanvas() {
    Element.context.clearRect(0, 0, Element.canvas.width, Element.canvas.height);
  }

  #drawSnake() {
    this.#snake = this.#requestSnakeState();
    if (!this.#snake) return;

    this.#drawHead();
    this.#drawBody();
    const tailFraction = 1 - this.#snake[0].fraction;
    this.#drawTail(tailFraction);
  }

  #drawHead() {
    const head = this.#snake[0];
    this.#drawPartialBox(head.x, head.y, this.#snakeColor, head.fraction, head.direction);
  }

  #drawBody() {
    for (let i = 1; i < this.#snake.length; i++) {
      const segment = this.#snake[i];
      this.#drawBox(segment.x, segment.y, this.#snakeColor);
      this.#drawBox(segment.x, segment.y, this.#snakePattern);
    }
  }
  
  #drawTail(fraction) {
    const tail = this.#snake[this.#snake.length - 1];
    const { xOffset, yOffset } = this.#getTailOffset(tail);
    
    if (tail.fraction == 1 || this.#snake.length == 1) {
      const x = tail.x + xOffset;
      const y = tail.y + yOffset;
      const direction = (tail.direction + 2) % 4;
      this.#drawPartialBox(x, y, this.#snakeColor, fraction, direction);
    }
  }
  
    #getTailOffset(tail) {
      let xOffset = 0;
      let yOffset = 0;
  
      if (tail.direction == 0) yOffset = 1;
      if (tail.direction == 1) xOffset = -1;
      if (tail.direction == 2) yOffset = -1;
      if (tail.direction == 3) xOffset = 1;
  
      return { xOffset, yOffset };
    }

  #drawFoods() {
    if (!this.#food) return;
    for (const food of this.#food) {
      this.#drawBox(food.x, food.y, this.#foodColor);
    }
  }

  #drawBox(x, y, fillStyle) {
    this.#drawPartialBox(x, y, fillStyle, 1, -1);
  }

  #drawPartialBox(x, y, fillStyle, fraction, direction) {
    const modifiers = this.#getDirectionFractionModifiers(direction, fraction);

    const xPixels = x * this.#boxWidth + this.#boxWidth * modifiers.xModifier;
    const yPixels = y * this.#boxHeight + this.#boxHeight * modifiers.yModifier;
    const width = this.#boxWidth * modifiers.widthModifier;
    const height = this.#boxHeight * modifiers.heightModifier;

    this.#context.fillStyle = fillStyle;
    this.#context.fillRect(xPixels, yPixels, width, height);
  }

  #getDirectionFractionModifiers(direction, fraction) {
    let xModifier = 0;
    let yModifier = 0;
    let widthModifier = 1;
    let heightModifier = 1;

    switch (direction) {
      case 0:
        heightModifier = fraction;
        yModifier = 1 - fraction;
        break;
      case 1:
        widthModifier = fraction;
        break;
      case 2:
        heightModifier = fraction;
        break;
      case 3:
        widthModifier = fraction;
        xModifier = 1 - fraction;
        break;
    }

    return { xModifier, yModifier, widthModifier, heightModifier };
  }

  #drawGrid() {
    if (!this.#backgroundColor) {
      this.#backgroundColor = Selector.backgroundColor.value;
    }
    const gridDotColor = getComplementaryColor(this.#backgroundColor, 64);
    this.#context.fillStyle = gridDotColor;

    for (let x = 1; x < this.#fieldWidth; x++) {
      for (let y = 1; y < this.#fieldHeight; y++) {
        this.#context.beginPath();
        this.#context.arc(x * this.#boxWidth, y * this.#boxHeight, 1.2, 0, 2 * Math.PI);
        this.#context.fill();
      }
    }
  }
}