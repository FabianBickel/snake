'use strict'
const FIELD_SIZE = 10;
const BOX_SIZE = 40;

window.onload = function () {
  let canvas = document.getElementById('gameCanvas');
  let context = canvas.getContext('2d');

  let playingField = [];
  playingField = getPlayingField();

  function getPlayingField() {
    for (let i = 0; i < FIELD_SIZE; i++) {
      playingField[i] = [];
      for (let j = 0; j < FIELD_SIZE; j++) {
        playingField[i][j] = 0;
      }
    }
  }

  let box = BOX_SIZE;
  
  function createBG() {
    context.fillStyle = "gray";
    context.fillRect(0, 0, 16 * box, 16 * box);
  }

  function drawSnake() {
    for (let i = 0; i < FIELD_SIZE; i++) {
      for (let j = 0; j < FIELD_SIZE; j++) {
        if (playingField[i][j] == 1) {
          context.fillStyle = "white";
          context.fillRect(i * box, j * box, box, box);
        }
      }
    }
  }

  let direction = "right";
  document.addEventListener('keydown', update);

  function update(event) {
    if (event.keyCode == 37 && direction != "right") direction = "left";
    if (event.keyCode == 38 && direction != "down") direction = "up";
    if (event.keyCode == 39 && direction != "left") direction = "right";
    if (event.keyCode == 40 && direction != "up") direction = "down";
  }

  // random snake x position
  let snakeX = Math.random() * (FIELD_SIZE - 1);
  let snakeY = Math.random() * (FIELD_SIZE - 1);
}