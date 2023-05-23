// 23.05.2023 Version 1: Grundfunktionen des Spiels implementiert

// 23.05.2023 Version 1: Grundfunktionen des Spiels implementiert

'use strict';

const BOX_SIZE = 40;
const START_LENGTH = 5;
const START_X = 0;
const START_Y = 0;
const FRAME_TIME = 150;

window.onload = function () {
  let canvas = document.getElementById('gameCanvas');
  let context = canvas.getContext('2d');

  let boxesWidth = Math.floor(window.innerWidth / BOX_SIZE);
  let boxesHeight = Math.floor(window.innerHeight / BOX_SIZE);

  canvas.width = boxesWidth * BOX_SIZE;
  canvas.height = boxesHeight * BOX_SIZE;

  let snake = [];
  for (let i = 0; i < START_LENGTH; i++) {
    snake[i] = { x: (START_X + START_LENGTH -  - i) * BOX_SIZE, y: START_Y * BOX_SIZE };
  }

  let direction = "right";
  let newDirection = direction;

  function isAdjacentToSnakeOrFruit(x, y) {
    const leftX = (Math.floor(x)) * BOX_SIZE;
    const rightX = (Math.floor(x) - 1) * BOX_SIZE;
    const upY = Math.floor(y) * BOX_SIZE;
    const downY = (Math.floor(y) - 1) * BOX_SIZE;

    if (touchesSnake(leftX, rightX, upY, downY)
      || touchesFruit(leftX, rightX, upY, downY)) {
      return true;
    }

    return false;
  }

  function touchesSnake(leftX, rightX, upY, downY) {
    for (let part of snake) {
      if (part.x == leftX || part.x == rightX) {
        if (part.y == upY || part.y == downY) {
          return true;
        }
      }
    }
  }

  function touchesFruit(leftX, rightX, upY, downY) {
    if ((fruit.x == leftX || fruit.x == rightX) && (fruit.y == upY || fruit.y == downY)) {
      return true;
    }
  }

  document.addEventListener('keydown', updateDirection);

  function updateDirection(event) {
    let key = event.keyCode;
    let key = event.keyCode;
    let isUp = (key == 38 || key == 87);
    let isLeft = (key == 37 || key == 65);
    let isLeft = (key == 37 || key == 65);
    let isDown = (key == 40 || key == 83);
    let isRight = (key == 39 || key == 68);
    if (isLeft && direction != "right") newDirection = "left";
    if (isUp && direction != "down") newDirection = "up";
    let isRight = (key == 39 || key == 68);
    if (isLeft && direction != "right") newDirection = "left";
    if (isUp && direction != "down") newDirection = "up";
    if (isRight && direction != "left") newDirection = "right";
    if (isDown && direction != "up") newDirection = "down";
  }


  // GameLoop Methods


  function gameLoop() {
    let { snakeX, snakeY } = getNewSnakeCoordinates();

    if (isCollidingWithWall(snakeX, snakeY) || isCollidingWithSelf(snakeX, snakeY)) {
      clearInterval(game);
      return;
    }
    handleSnakeMovement(snakeX, snakeY);

    drawBackground();
    drawSnake();
    drawFruit();
  }

  function getNewSnakeCoordinates() {
    direction = newDirection;

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction == "right")
      snakeX += BOX_SIZE;
    if (direction == "left")
      snakeX -= BOX_SIZE;
    if (direction == "up")
      snakeY -= BOX_SIZE;
    if (direction == "down")
      snakeY += BOX_SIZE;
    return { snakeX, snakeY };
  }

  function isCollidingWithWall(snakeX, snakeY) {
    let collidesUp = direction == 'up' && snakeY < 0;
    let collidesLeft = direction == 'left' && snakeX < 0;
    let collidesDown = direction == 'down' && snakeY >= boxesHeight * BOX_SIZE;
    let collidesRight = direction == 'right' && snakeX >= boxesWidth * BOX_SIZE;
    let collidesWithWall = collidesUp || collidesLeft || collidesDown || collidesRight;
    return collidesWithWall;
    let collidesUp = direction == 'up' && snakeY < 0;
    let collidesLeft = direction == 'left' && snakeX < 0;
    let collidesDown = direction == 'down' && snakeY >= boxesHeight * BOX_SIZE;
    let collidesRight = direction == 'right' && snakeX >= boxesWidth * BOX_SIZE;
    let collidesWithWall = collidesUp || collidesLeft || collidesDown || collidesRight;
    return collidesWithWall;
  }

  function isCollidingWithSelf(snakeX, snakeY) {
    let result = false;
    for (let i = 1; i < snake.length; i++) {
    let result = false;
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x == snakeX && snake[i].y == snakeY) {
        result = true;
        break;
        result = true;
        break;
      }
    }
    return result;
    return result;
  }

  function handleSnakeMovement(snakeX, snakeY) {
    if (snakeX == fruit.x && snakeY == fruit.y) {
  function handleSnakeMovement(snakeX, snakeY) {
    if (snakeX == fruit.x && snakeY == fruit.y) {
      spawnFruit();
    } else {
      snake.pop();
    }
    addNewHead(snakeX, snakeY);
  }
    addNewHead(snakeX, snakeY);
  }

  function addNewHead(snakeX, snakeY) {
  function addNewHead(snakeX, snakeY) {
    let newHead = {
      x: snakeX,
      y: snakeY
    };

    snake.unshift(newHead);
  }

  function spawnFruit() {
    fruit.x = Math.floor(Math.random() * boxesWidth) * BOX_SIZE;
    fruit.y = Math.floor(Math.random() * boxesHeight) * BOX_SIZE;
  }

  function drawBackground() {
    context.fillStyle = "black";
    const dotThickness = 1.2;
    context.fillRect(0, 0, boxesWidth * BOX_SIZE, boxesHeight * BOX_SIZE);

    drawGrid(dotThickness);
  }

  function drawGrid(dotThickness) {
    for (let x = 1; x < boxesWidth; x++) {
      for (let y = 1; y < boxesHeight; y++) {
        if (isAdjacentToSnakeOrFruit(x, y)) {
          continue;
        }
        context.beginPath();
        context.arc(x * BOX_SIZE, y * BOX_SIZE, dotThickness, 0, 2 * Math.PI);
        context.fill();
      }
    }
  }

  function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
      context.fillStyle = "white";
      context.fillRect(snake[i].x, snake[i].y, BOX_SIZE, BOX_SIZE);
    }
  }

  function drawFruit() {
    context.fillStyle = "red";
    context.fillRect(fruit.x, fruit.y, BOX_SIZE, BOX_SIZE);
  }


  let fruit = { x: 0, y: 0 };
  spawnFruit();
  let game = setInterval(gameLoop, FRAME_TIME);

  let fruit = { x: 0, y: 0 };
  spawnFruit();
  let game = setInterval(gameLoop, FRAME_TIME);
};
