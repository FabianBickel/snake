// 06.06.2023 Version 4: Spiel ohne Tastatur, Pause und Game Over

'use strict';

import GameManager from './game-manager.js';
import GuiManager from './gui-manager.js';

// localStorage.clear();

const game = new GameManager();
const gui = new GuiManager(
  game.snake,
  game.foods,
  game.score,
  game.highScore
);

game.onScoreChanged = gui.updateScore.bind(gui);
game.onHighScoreChanged = gui.updateHighScore.bind(gui);
game.onGameOver = gui.gameOver.bind(gui);
game.onSnakeChanged = gui.updateSnake.bind(gui);
game.onFoodsChanged = gui.updateFood.bind(gui);

gui.onFieldSizeChanged = game.updatePlayingField.bind(game);
gui.onSnakeSpeedChanged = game.updateSnakeSpeed.bind(game);
gui.onGameStarted = game.startGame.bind(game);
gui.onGamePaused = game.pauseGame.bind(game);
gui.onGameReset = game.resetGame.bind(game);
gui.onDirectionInput = game.handleDirectionInput.bind(game);