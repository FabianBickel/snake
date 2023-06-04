// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict';

import GameManager from './game-manager.js';
import GuiManager from './gui-manager.js';
import Config from './config.js';

const game = new GameManager();
const gui = new GuiManager(
  game.snake,
  game.foods,
  game.score,
  game.highScore
);

game.onScoreChanged = gui.updateScore;
game.onHighScoreChanged = gui.updateHighScore;
game.onGameStarted = gui.gameStarted;
game.onGamePaused = gui.gamePaused;
game.onGameResumed = gui.gameResumed;
game.onGameOver = gui.gameOver;
game.onGameReset = gui.resetGame;
game.onSnakeChanged = gui.updateSnake;
game.onFruitChanged = gui.updateFood;
