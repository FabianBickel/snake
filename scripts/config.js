export default class Config {
  static #boxSize = 42;
  static #startLength = 1;
  static #fallbackBackgroundColor = "#000000";
  static #fallbackSnakeColor = "#FFFFFF";
  static #fallbackFoodColor = "#FF0000";
  static #animationDuration = 1000;

  static #menucConfigurations = {
    afterReset: {
      showDesignMenu: true,
      showPreviewMenu: true,
      showGameOverMenu: false,
      buttons: ["Start Game"],
    },
    afterStart: {
      showDesignMenu: true,
      showPreviewMenu: true,
      showGameOverMenu: false,
      buttons: ["Resume", "New Game"],
    },
    afterOver: {
      showDesignMenu: false,
      showPreviewMenu: false,
      showGameOverMenu: true,
      buttons: ["New Game"],
    }
  };

  static #difficultyLevels = [
    {
      name: "Easy",
      speed: 40
    },
    {
      name: "Medium",
      speed: 60
    },
    {
      name: "Hard",
      speed: 80
    },
    {
      name: "Expert",
      speed: 110
    },
    {
      name: "Insane",
      speed: 150
    },
    {
      name: "Impossible",
      speed: 200
    }
  ]

  static #designPresets = [
    {
      name: "Classic",
      backgroundColor: "#000000",
      snakeColor: "#FFFFFF"
    },
    {
      name: "Twilight",
      backgroundColor: "#222831",
      snakeColor: "#FFD369"
    },
    {
      name: "Stormy Night",
      backgroundColor: "#363537",
      snakeColor: "#E94560"
    },
    {
      name: "Calm Sea",
      backgroundColor: "#28334A",
      snakeColor: "#C4ACB4"
    },
    {
      name: "Dusk",
      backgroundColor: "#353535",
      snakeColor: "#6EC1E4"
    },
    {
      name: "Enchanted Forest",
      backgroundColor: "#2B2D42",
      snakeColor: "#8D99AE"
    },
    {
      name: "Flashbang",
      backgroundColor: "#FFFFFF",
      snakeColor: "#000000"
    }
  ];

  static get boxSize() { return this.#boxSize; }
  static get startLength() { return this.#startLength; }
  static get fallbackBackgroundColor() { return this.#fallbackBackgroundColor; }
  static get fallbackSnakeColor() { return this.#fallbackSnakeColor; }
  static get fallbackFoodColor() { return this.#fallbackFoodColor; }
  static get animationDuration() { return this.#animationDuration; }
  static get menuConfigurations() { return this.#menucConfigurations; }
  static get difficultyLevels() { return this.#difficultyLevels; }
  static get designPresets() { return this.#designPresets; }
}