// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict';

import Config from './config.js';

class Element {
  static get canvas() {
    return document.getElementById('gameCanvas');
  }
  static get context() {
    if (this.canvas === null)
      return null;
    return this.canvas.getContext('2d');
  }
  static get menuOverlay() {
    return document.getElementById('menuOverlay');
  }
  static get scoresOverlay() {
    return document.getElementById('scoreOverlay');
  }
}

class Selector {
  static get designPreset() {
    return document.getElementById('designPreset');
  }
  static get backgroundColor() {
    return document.getElementById('backgroundColor');
  }
  static get snakeColor() {
    return document.getElementById('snakeColor');
  }
  static get snakePattern() {
    return document.getElementById('snakePattern');
  }
  static get snakeSpeed() {
    return document.getElementById('snakeSpeed');
  }
}

class Display {
  static #applyStyleToPreviewElements(className, value, styleProperty) {
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
      element.style[styleProperty] = value;
      // if (styleProperty === 'backgroundImage') {
      //   element.style.backgroundSize = 'contain';
      //   element.style.backgroundRepeat = 'repeat';
      // }
    }
  }

  static #applyTextContentToDisplayElements(className, textContent) {
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
      element.textContent = textContent;
    }
  }

  static snakeSpeed() {
    this.#applyStyleToPreviewElements('backgroundColor', Selector.backgroundColor.value, 'backgroundColor');
  }
  static snakeColor() {
    this.#applyStyleToPreviewElements('snakeColor', Selector.snakeColor.value, 'backgroundColor');
  }
  static snakePattern() {
    // this.#applyStyle('snakePattern', Selector.snakePattern.value, 'backgroundImage');
  }
  static score(score) {
    this.#applyTextContentToDisplayElements('score', score);
  }
  static highScore(highScore) {
    this.#applyTextContentToDisplayElements('highScore', highScore);
  }
}

export default class GuiManager {
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

  constructor(snake, food, score, highScore) {
    this.updateSnake(snake);
    this.updateFood(food);
    this.#transitionDuration = Config.animationDuration;
    this.#boxWidth = Config.boxSize;
    this.#boxHeight = Config.boxSize;
    this.updateScore(score);
    this.updateHighScore(highScore);

    this.#backgroundColor = Config.fallbackBackgroundColor;
    this.#snakeColor = Config.fallbackSnakeColor;
    this.#foodColor = Config.fallbackFoodColor;
    this.#snakePattern = Config.fallbackSnakePattern;

    this.#fieldWidth = Math.floor(window.innerWidth / this.#boxWidth);
    this.#fieldHeight = Math.floor(window.innerHeight / this.#boxHeight);

    window.onload = onDocumentLoaded.bind(this);

    function onDocumentLoaded() {
      getCanvasVariables.bind(this)();
      addChangeEventListeners.bind(this)();
      this.#startDrawing();
    };

    function getCanvasVariables() {
      this.#canvas = Element.canvas;
      this.#canvas.width = this.#fieldWidth * this.#boxWidth;
      this.#canvas.height = this.#fieldHeight * this.#boxHeight;
      this.#context = Element.context;
    }

    function addChangeEventListeners() {
      Selector.designPreset.addEventListener('change', this.applyPreset.bind(this));
      Selector.backgroundColor.addEventListener('change', this.updateBackgroundColor.bind(this));
      Selector.snakeColor.addEventListener('change', this.updateSnakeColor.bind(this));
      Selector.snakePattern.addEventListener('change', this.updateSnakePattern.bind(this));
      Selector.snakeSpeed.addEventListener('change', this.updateSnakeSpeed.bind(this));
    }
  }

  updateSnake(snake) {
    this.#lastSnakeUpdate = performance.now();
    this.#snake = snake;
  }

  updateFood(food) {
    this.#food = food;
  }

  updateScore(score) {
    Display.score(score);
  }

  updateHighScore(highScore) {
    Display.highScore(highScore);
  }

  updateBackgroundColor() {
    this.#backgroundColor = Selector.backgroundColor.value;
    Display.backgroundColor();
  }

  updateSnakeColor() {
    this.#snakeColor = Selector.snakeColor.value;
    Display.snakeColor();
  }

  updateSnakePattern() {
    this.#snakePattern = Selector.snakePattern.value;
    Display.snakePattern();
  }

  updateSnakeSpeed() {
    this.#snakeSpeed = Selector.snakeSpeed.value;
    Display.snakeSpeed();
  }

  setAnimationDuration(duration) {
    this.#transitionDuration = duration;
    const animationElements = [
      Element.menuOverlay,
    ];
    animationElements.forEach(element => {
      element.style.animationDuration = `${this.#transitionDuration}ms`;
    });
  }

  applyPreset(preset) {
    Selector.backgroundColor.value = preset.backgroundColor;
    Selector.snakeColor.value = preset.snakeColor;
    Selector.snakePattern.value = preset.snakePattern;
    Display.snakeSpeed();
    Display.snakeColor();
    Display.snakePattern();
  }

  gameStarted() {
    this.#hideMenuOverlay();
  }

  gamePaused() {
    this.#showMenuOverlay();
    this.#stopDrawing();
  }

  gameResumed() {
    this.#hideMenuOverlay();
    this.#startDrawing();
  }

  gameOver() {
    this.#showMenuOverlay();
    this.#stopDrawing();
  }

  resetGame() {
    this.#stopDrawing();
  }

  #showMenuOverlay() {
    menuOverlay.style.display = 'flex';
    menuOverlay.classList.remove('hidden');
  }

  #hideMenuOverlay() {
    menuOverlay.classList.add('hidden');
    setTimeout(() => {
      menuOverlay.style.display = 'flex';
    }, animationDuration);
  }

  #isDrawing = false;

  #startDrawing() {
    this.#lastSnakeUpdate = performance.now();
    if (this.#isDrawing) return;
    this.#isDrawing = true;
    this.#initializeDrawing();
  }

  #stopDrawing() {
    this.#isDrawing = false;
  }

  #initializeDrawing() {
    this.drawFrame();
    if (!this.#isDrawing) return;
    requestAnimationFrame(this.#initializeDrawing.bind(this));
  }

  drawFrame() {
    this.#clearCanvas();
    // this.#drawGrid();
    this.#drawSnake();
    // this.#drawFood();
  }

  #clearCanvas() {
    Element.context.clearRect(0, 0, Element.canvas.width, Element.canvas.height);
  }

  #drawSnake() {
    for (let i = 0; i < this.#snake.length; i++) {
      const snakePart = this.#snake[i];
      this.#context.fillStyle = this.#snakeColor;
      this.#context.fillRect(
        snakePart.x * this.#boxWidth
        , snakePart.y * this.#boxHeight
        , this.#boxWidth
        , this.#boxHeight
      );
    }
  }

  #drawFood() {
    this.#context.fillStyle = this.#foodColor;
    this.#context.fillRect(
      this.#food.x * this.#boxWidth
      , this.#food.y * this.#boxHeight
      , this.#boxWidth
      , this.#boxHeight
    );
  }

  #drawGrid() {
    if (!this.#backgroundColor) {
      this.#backgroundColor = Selector.backgroundColor.value;
    }
    const gridDotColor = getComplementaryColor(this.#backgroundColor.value, 64);
    this.#context.fillStyle = gridDotColor;

    for (let x = 1; x < this.#boxWidth; x++) {
      for (let y = 1; y < this.#boxHeight; y++) {
        this.#context.beginPath();
        this.#context.arc(x * this.#fieldWidth, y * this.#fieldHeight, 1.2, 0, 2 * Math.PI);
        this.#context.fill();
      }
    }
  }
}