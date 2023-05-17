'use strict';

// const FIELD_SIZE = 10;
const BOX_SIZE = 40;
const STARTING_LENGTH = 5;

window.onload = function () {
  let canvas = document.getElementById('gameCanvas');
  let context = canvas.getContext('2d');

  // Calculate the number of boxes that fit into the width and height
  let boxesWidth = Math.floor(window.innerWidth / BOX_SIZE);
  let boxesHeight = Math.floor(window.innerHeight / BOX_SIZE);

  // Set initial canvas size
  canvas.width = boxesWidth * BOX_SIZE;
  canvas.height = boxesHeight * BOX_SIZE;

  let snake = [];
  for (let i = 0; i < STARTING_LENGTH; i++) {
    snake[i] = { x: (STARTING_LENGTH - i) * BOX_SIZE, y: 2 * BOX_SIZE };
  }

  let direction = "right";
  let newDirection = direction;

  function createBG() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, boxesWidth * BOX_SIZE, boxesHeight * BOX_SIZE);
  }

  function createSnake() {
    for (let i = 0; i < snake.length; i++) {
      context.fillStyle = "white";
      context.fillRect(snake[i].x, snake[i].y, BOX_SIZE, BOX_SIZE);
    }
  }

  let snack = {
    x: Math.floor(Math.random() * 15 + 1) * BOX_SIZE,
    y: Math.floor(Math.random() * 15 + 1) * BOX_SIZE
  };

  function createSnack() {
    context.fillStyle = "red";
    context.fillRect(snack.x, snack.y, BOX_SIZE, BOX_SIZE);
  }

  document.addEventListener('keydown', updateDirection);

  function updateDirection(event) {
    let key = event.keyCode
    let isUp = (key == 38 || key == 87);
    let isLeft = (key == 39 || key == 68);
    let isRight = (key == 37 || key == 65);
    let isDown = (key == 40 || key == 83);
    if (isLeft  && direction != "right") newDirection = "left";
    if (isUp    && direction != "down") newDirection = "up";
    if (isRight && direction != "left") newDirection = "right";
    if (isDown  && direction != "up") newDirection = "down";
  }

  function isCollidingWithWall(snakeX, snakeY) {
    return snakeX >= boxesWidth * BOX_SIZE && direction == "right" ||
      snakeX < 0 && direction == 'left' ||
      snakeY >= boxesHeight * BOX_SIZE && direction == "down" ||
      snakeY < 0 && direction == 'up';
  }

  function isCollidingWithSelf(snakeX, snakeY) {
    for (let i = 1; i < snake.length - 1; i++) {
      if (snake[i].x == snakeX && snake[i].y == snakeY) {
        return true;
      }
    }
  }

  function gameLoop() {
    direction = newDirection;

    createBG();
    createSnake();
    createSnack();

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction == "right") snakeX += BOX_SIZE;
    if (direction == "left") snakeX -= BOX_SIZE;
    if (direction == "up") snakeY -= BOX_SIZE;
    if (direction == "down") snakeY += BOX_SIZE;

    if (isCollidingWithWall(snakeX, snakeY) || isCollidingWithSelf(snakeX, snakeY)) {
      clearInterval(game);
      return;
    }

    if (snakeX == snack.x && snakeY == snack.y) {
      spawnFruit();
    } else {
      snake.pop();
    }

    let newHead = {
      x: snakeX,
      y: snakeY
    };

    snake.unshift(newHead);
  }

  function spawnFruit() {
    snack.x = Math.floor(Math.random() * boxesWidth) * BOX_SIZE;
    snack.y = Math.floor(Math.random() * boxesHeight) * BOX_SIZE;
  }

  let game = setInterval(gameLoop, 150);
};
