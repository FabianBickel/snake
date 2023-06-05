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

game.onScoreChanged = gui.updateScore.bind(gui);
game.onHighScoreChanged = gui.updateHighScore.bind(gui);
game.onGameStarted = gui.gameStarted.bind(gui);
game.onGamePaused = gui.gamePaused.bind(gui);
game.onGameResumed = gui.gameResumed.bind(gui);
game.onGameOver = gui.gameOver.bind(gui);
game.onGameReset = gui.resetGame.bind(gui);
game.onSnakeChanged = gui.updateSnake.bind(gui);
game.onFoodChanged = gui.updateFood.bind(gui);
