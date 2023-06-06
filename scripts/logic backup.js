// 30.05.2023 Version 3: Score, Highscore, Difficulty

'use strict';

const DEBUGGING_MODE = false;

const BOX_SIZE = 42;
const START_LENGTH = 1;
const BACKGROUND_COLOR_DEFAULT = '#000000';
const SNAKE_COLOR_DEFAULT = '#FFFFFF';
const SNAKE_OUTLINE_COLOR_DEFAULT = '#808080';

const DESIGN_PRESETS = [
  {
    name: 'Classic',
    backgroundColor: '#000000',
    snakeColor: '#FFFFFF',
  },
  {
    name: 'Twilight',
    backgroundColor: '#222831',
    snakeColor: '#FFD369',
  },
  {
    name: 'Stormy Night',
    backgroundColor: '#363537',
    snakeColor: '#E94560',
  },
  {
    name: 'Calm Sea',
    backgroundColor: '#28334A',
    snakeColor: '#C4ACB4',
  },
  {
    name: 'Dusk',
    backgroundColor: '#353535',
    snakeColor: '#6EC1E4',
  },
  {
    name: 'Enchanted Forest',
    backgroundColor: '#2B2D42',
    snakeColor: '#8D99AE',
  },
  {
    name: 'Flashbang',
    backgroundColor: '#FFFFFF',
    snakeColor: '#000000',
  }
];


let canvas = undefined;
let context = undefined;

let selectorDesignPresets = undefined;
let colorSelectorBackground = undefined;
let colorSelectorSnake = undefined;
let selectorSnakePattern = undefined;
let selectorSnakeSpeed = undefined;

let displayScores = [];
let displayHighScores = [];

let menuOverlay = undefined;

window.onload = function () {
  canvas = document.getElementById('gameCanvas');
  context = canvas.getContext('2d');

  selectorDesignPresets = document.getElementById('designPresets');

  colorSelectorBackground = document.getElementById('backgroundColor');
  colorSelectorSnake = document.getElementById('snakeColor');
  selectorSnakePattern = document.getElementById('snakePattern');
  selectorSnakeSpeed = document.getElementById('snakeSpeed');

  displayScores = document.getElementsByClassName('score');
  displayHighScores = document.getElementsByClassName('highScore');

  menuOverlay = document.getElementById('menuOverlay');

  DESIGN_PRESETS.forEach((preset, index) => {
    let option = document.createElement('option');
    option.text = preset.name;
    option.value = index;
    selectorDesignPresets.add(option);
  });

  selectorDesignPresets.addEventListener('change', applyPresetToUI);

  selectorDesignPresets.addEventListener('change', updateColorsAndPatterns);
  colorSelectorBackground.addEventListener('change', updateColorsAndPatterns);
  colorSelectorSnake.addEventListener('change', updateColorsAndPatterns);
  selectorSnakePattern.addEventListener('change', updateColorsAndPatterns);

  setUpGame();
  applyPresetToUI();
  updateColorsAndPatterns();
  updateScores();
};


let direction = -1;
let newDirection = -1;
let bufferedDirection = -1;

let snake = [];
let fruit = { x: 0, y: 0 };

let lastUpdateTime = undefined;

let backgroundColor = undefined;
let snakeColor = undefined;
let snakeOutlineColor = undefined;
let snakePattern = 'none';

let boxesWidth = 0;
let boxesHeight = 0;

let gamePaused = true;
let game;
let highScore = localStorage.getItem('highScore') || 0;
let getScore = () => snake.length - 1;

function applyPresetToUI() {
  const selectedPreset = DESIGN_PRESETS[selectorDesignPresets.value];

  if (selectedPreset) {
    colorSelectorBackground.value = selectedPreset.backgroundColor;
    colorSelectorSnake.value = selectedPreset.snakeColor;
    changeSelectedIndex(selectorSnakePattern,
      selectedPreset.snakePattern ? selectedPreset.snakePattern : 'none');
  }
}

function changeSelectedIndex(selectElement, desiredValue) {
  for (let i = 0; i < selectElement.options.length; i++) {
    if (selectElement.options[i].value == desiredValue) {
      selectElement.selectedIndex = i;
      break;
    }
  }
}

function updateColorsAndPatterns() {
  backgroundColor = colorSelectorBackground ? colorSelectorBackground.value : BACKGROUND_COLOR_DEFAULT;
  snakeColor = colorSelectorSnake ? colorSelectorSnake.value : SNAKE_COLOR_DEFAULT;
  snakeOutlineColor = backgroundColor;
  const patternName = selectorSnakePattern ? selectorSnakePattern.value : 'none';
  document.getElementById('scoreOverlay').style.color = snakeColor;

  if (patternName && patternName !== 'none') {
    const imagePath = '../media/' + patternName + '.svg';
    const patternColor = getComplementaryColor(snakeColor, 32);
    changeColorOfSvg(imagePath, patternColor, image => {
      snakePattern = context.createPattern(image, 'repeat');
      drawGameToCanvas();
    });
  }
  else {
    drawGameToCanvas();
  }
}

function updateScores() {
  const score = getScore();
  for (let i = 0; i < displayScores.length; i++) {
    displayScores[i].innerText = score;
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }

  for (let i = 0; i < displayHighScores.length; i++) {
    displayHighScores[i].innerText = highScore;
  }
}



function drawGameToCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  document.body.style.backgroundColor = backgroundColor;
  drawGrid();
  drawSnake();
  drawFruit();
}

function drawGrid() {
  const gridDotColor = getComplementaryColor(backgroundColor, 64);
  context.fillStyle = gridDotColor;

  for (let x = 1; x < boxesWidth; x++) {
    for (let y = 1; y < boxesHeight; y++) {
      if (isAdjacentToSnakeOrFruit(x, y)) {
        continue;
      }
      context.beginPath();
      context.arc(x * BOX_SIZE, y * BOX_SIZE, 1.2, 0, 2 * Math.PI);
      context.fill();
    }
  }
}

function getComplementaryColor(color, adjustFactor) {
  if (!color) {
    return color;
  }
  const amount = isColorLight(color)
    ? 0 - adjustFactor
    : adjustFactor;

  let usePound = false;

  if (color[0] == "#") {
    color = color.slice(1);
    usePound = true;
  }

  const num = parseInt(color, 16);

  let r = (num >> 16) + amount;
  let b = ((num >> 8) & 0x00FF) + amount;
  let g = (num & 0x0000FF) + amount;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + ((g | (b << 8) | (r << 16)) | 1 << 24).toString(16).slice(1);
}

function isColorLight(color) {
  const threshold = 127;
  const num = parseInt(color.slice(1), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00FF;
  const b = num & 0x0000FF;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > (255 - threshold);
}


function isAdjacentToSnakeOrFruit(x, y) {
  return false;
  const leftX = x;
  const rightX = (x - 1);
  const upY = y;
  const downY = (y - 1);

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

function drawSnake() {
  for (let i = snake.length - 1; i >= 0; i--) {
    const segment = snake[i];
    const nextSegment = snake[i + 1];
    const previousSegment = snake[i - 1];
    drawSegmentOutline(segment.x, segment.y, nextSegment, previousSegment);
    drawSnakeSegment(i);
    drawPhantomSegment();
    if (snakePattern !== 'none') drawSnakePattern(segment);
  }
}

const drawFunctions = [
  (segment, fraction) => context.fillRect(segment.x * BOX_SIZE, segment.y * BOX_SIZE + BOX_SIZE * (1 - fraction), BOX_SIZE, BOX_SIZE * fraction),
  (segment, fraction) => context.fillRect(segment.x * BOX_SIZE, segment.y * BOX_SIZE, BOX_SIZE * fraction, BOX_SIZE),
  (segment, fraction) => context.fillRect(segment.x * BOX_SIZE, segment.y * BOX_SIZE, BOX_SIZE, BOX_SIZE * fraction),
  (segment, fraction) => context.fillRect(segment.x * BOX_SIZE + BOX_SIZE * (1 - fraction), segment.y * BOX_SIZE, BOX_SIZE * fraction, BOX_SIZE),
];

function drawPhantomSegment() {
  drawSnakeSegment(snake.length);
}

function drawSnakeSegment(segmentIndex) {
  let fraction = 1;
  const cappedIndex = Math.min(segmentIndex, snake.length - 1);
  let segment = snake[cappedIndex];
  const isFirstSegment = segmentIndex === 0;
  const isPhantomSegment = segmentIndex >= snake.length;

  if ((isFirstSegment || isPhantomSegment) && lastUpdateTime) {
    const elapsedTime = ((new Date()).getTime() - lastUpdateTime);
    const frameTime = (10 / selectorSnakeSpeed.value * 1000);
    fraction = (elapsedTime % frameTime) / frameTime;
    fraction = Math.min(fraction, 1);
  }

  if (isPhantomSegment) {
    let newSegment = JSON.parse(JSON.stringify(snake[cappedIndex]));
    switch (snake[snake.length - 1].direction) {
      case 0:
        newSegment.y++;
        break;
      case 1:
        newSegment.x--;
        break;
      case 2:
        newSegment.y--;
        break;
      case 3:
        newSegment.x++;
        break;
    }
    segment = newSegment;
    fraction = 1 - fraction;
  }


  if (gamePaused) {
    fraction = isPhantomSegment ? 0 : 1;
  }

  if (fraction > 1) {
    console.log('ALARM ALAHARM');
  }

  context.fillStyle = snakeColor;
  let direction = segmentIndex === 0 ? segment.direction : (segment.direction + 2) % 4;
  drawFunctions[direction](segment, fraction);
}

function drawSnakePattern(segment) {
  context.fillStyle = snakePattern;
  context.fillRect(segment.x * BOX_SIZE, segment.y * BOX_SIZE, BOX_SIZE, BOX_SIZE);
}

function drawSegmentOutline(x, y, nextSegment, previousSegment) {
  context.strokeStyle = snakeOutlineColor;
  context.lineWidth = 2;
  if (DEBUGGING_MODE) {
    context.globalAlpha = 0.5;
  }
  if (shouldDrawOutline(nextSegment, previousSegment, s => s.x !== x - 1)) {
    drawLine(x, y, x, y + 1);
  }
  if (shouldDrawOutline(nextSegment, previousSegment, s => s.x !== x + 1)) {
    drawLine(x + 1, y, x + 1, y + 1);
  }
  if (shouldDrawOutline(nextSegment, previousSegment, s => s.y !== y - 1)) {
    drawLine(x, y, x + 1, y);
  }
  if (shouldDrawOutline(nextSegment, previousSegment, s => s.y !== y + 1)) {
    drawLine(x, y + 1, x + 1, y + 1);
  }
}

function shouldDrawOutline(next, previous, check) {
  return (!next || check(next)) && (!previous || check(previous));
}

function drawLine(startX, startY, endX, endY) {
  context.beginPath();
  context.moveTo(startX * BOX_SIZE, startY * BOX_SIZE);
  context.lineTo(endX * BOX_SIZE, endY * BOX_SIZE);
  context.stroke();
}

function drawFruit() {
  context.fillStyle = "red";
  context.fillRect(fruit.x * BOX_SIZE, fruit.y * BOX_SIZE, BOX_SIZE, BOX_SIZE);
}

// --------------------------------- GAME SETUP ------------------------------ //

function setUpGame() {
  boxesWidth = Math.floor(window.innerWidth / BOX_SIZE);
  boxesHeight = Math.floor(window.innerHeight / BOX_SIZE);

  canvas.width = boxesWidth * BOX_SIZE;
  canvas.height = boxesHeight * BOX_SIZE;

  const initialOrientation = Math.floor(Math.random() * 4);

  let randomForPositionX = -1;
  let randomForPositionY = -1;

  if (initialOrientation == 0 || initialOrientation == 2) {
    randomForPositionX = Math.floor(Math.random() * boxesWidth);
    randomForPositionY = Math.floor(Math.random() * (boxesHeight - START_LENGTH));
  } else if (initialOrientation == 1 || initialOrientation == 3) {
    randomForPositionX = Math.floor(Math.random() * (boxesWidth - START_LENGTH));
    randomForPositionY = Math.floor(Math.random() * boxesHeight);
  } else {
    throw new Error('Invalid initial orientation: ' + initialOrientation);
  }

  let startX = randomForPositionX;
  let startY = randomForPositionY;
  if (initialOrientation == 2) {
    startY += START_LENGTH;
  } else if (initialOrientation == 1) {
    startX += START_LENGTH;
  }

  if (DEBUGGING_MODE) {
    console.log('initialOrientation: ' + initialOrientation);
    console.log('startX: ' + startX);
    console.log('startY: ' + startY);
  }

  for (let i = 0; i < START_LENGTH; i++) {
    switch (initialOrientation) {
      case 0:
        snake[i] = { x: startX, y: startY + i, direction: 0 };
        break;
      case 1:
        snake[i] = { x: startX - i, y: startY, direction: 1 };
        break;
      case 2:
        snake[i] = { x: startX, y: startY - i, direction: 2 };
        break;
      case 3:
        snake[i] = { x: startX + i, y: startY, direction: 3 };
        break;
    }
  }

  direction = initialOrientation;
  spawnFruit();
  if (DEBUGGING_MODE) {
    window.addEventListener('keydown', event => {
      if (event.key != 'Enter') return;
      gameLoop();
    });
  }
  const buttonsStartGame = document.getElementsByClassName('startGame');
  for (const element of buttonsStartGame) {
    element.addEventListener('click', startGame);
  };
  startDrawing();
}

function startDrawing() {
  drawGameToCanvas();
  requestAnimationFrame(startDrawing);
}

function gameLoop() {

  updateDirectionVariables();
  if (gamePaused || direction == -1) {
    return;
  }

  let { snakeX, snakeY } = getNewSnakeCoordinates();

  if (isCollidingWithWall(snakeX, snakeY) || isCollidingWithSelf(snakeX, snakeY)) {
    clearInterval(game);
    return;
  }
  lastUpdateTime = new Date().getTime();
  handleSnakeMovement(snakeX, snakeY);

  updateScores();
}

function updateDirectionVariables() {
  if (newDirection != -1) {
    direction = newDirection;
  }
  newDirection = bufferedDirection;
  bufferedDirection = -1;
}

function getNewSnakeCoordinates() {
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction == 0)
    snakeY -= 1;
  else if (direction == 1)
    snakeX += 1;
  else if (direction == 2)
    snakeY += 1;
  else if (direction == 3)
    snakeX -= 1;
  return { snakeX, snakeY };
}

function isCollidingWithWall(snakeX, snakeY) {
  const collidesUp = direction == 0 && snakeY < 0;
  const collidesRight = direction == 1 && snakeX >= boxesWidth;
  const collidesDown = direction == 2 && snakeY >= boxesHeight;
  const collidesLeft = direction == 3 && snakeX < 0;
  const collidesWithWall = collidesUp || collidesLeft || collidesDown || collidesRight;
  return collidesWithWall;
}

function isCollidingWithSelf(snakeX, snakeY) {
  let result = false;
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snakeX && snake[i].y == snakeY) {
      result = true;
      break;
    }
  }
  return result;
}

function handleSnakeMovement(snakeX, snakeY) {
  if (snakeX == fruit.x && snakeY == fruit.y) {
    spawnFruit();
  } else {
    snake.pop();
  }
  addNewHead(snakeX, snakeY);
}

function addNewHead(snakeX, snakeY) {
  let newHead = {
    x: snakeX,
    y: snakeY,
    direction: direction
  };

  snake.unshift(newHead);
}

function spawnFruit() {
  x = Math.floor(Math.random() * boxesWidth);
  y = Math.floor(Math.random() * boxesHeight);
}

function startGame() {
  const framesPerSecond = selectorSnakeSpeed.value / 10;
  game = setInterval(gameLoop, 1000 / framesPerSecond);

  menuOverlay.classList.add('hidden');
  canvas.focus();
  setTimeout(() => {
    menuOverlay.style.display = 'none';
  }, 1000);

  window.addEventListener('keydown', event => {
    const key = event.key;
    const directionPressed = getNewDirectionFromButtonPress(key);
    changeDirection(directionPressed);
  });

  function getNewDirectionFromButtonPress(key) {
    if (key == 'ArrowUp' || key == 'w')
      return 0;
    if (key == 'ArrowRight' || key == 'd')
      return 1;
    if (key == 'ArrowDown' || key == 's')
      return 2;
    if (key == 'ArrowLeft' || key == 'a')
      return 3;

    return -1;
  }

  let initialX = null;
  let initialY = null;

  function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
  }

  function moveTouch(e) {
    if (initialX === null || initialY === null) {
      return;
    }

    let diffX = initialX - e.touches[0].clientX;
    let diffY = initialY - e.touches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // swiped horizontally
      if (diffX > 0) {
        // swiped left
        changeDirection(3);
      } else {
        // swiped right
        changeDirection(1);
      }
    } else {
      // swiped vertically
      if (diffY > 0) {
        // swiped up
        changeDirection(0);
      } else {
        // swiped down
        changeDirection(2);
      }
    }

    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
    lastMoveX = initialX;
    lastMoveY = initialY;
  }

  document.addEventListener("touchstart", startTouch, false);
  document.addEventListener("touchmove", moveTouch, false);
  document.addEventListener("touchend", function (e) {
    initialX = null;
    initialY = null;
    lastMoveX = null;
    lastMoveY = null;
  }, false);


  function changeDirection(directionPressed) {
    if (directionPressed == -1) return;
    const isLinus = snake.length == 1;
    const isOpposite = (directionPressed + 2) % 4 == direction;
    const isParallel = directionPressed % 2 == direction % 2;
    if (gamePaused && (!isOpposite || isLinus)) gamePaused = false;
    if (isParallel) {
      if (newDirection != -1) bufferedDirection = directionPressed;
      if (bufferedDirection == -1 && isLinus) newDirection = directionPressed;
      return;
    }
    newDirection = directionPressed;
  }
}