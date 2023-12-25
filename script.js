/**
 * Represents a position on the grid with x and y coordinates, managing movements within specified boundaries.
 */
class Position {
  /**
   * Creates a new Position instance.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Updates the position based on direction and step size while adhering to maximum boundaries.
   * @param {number} direction - The direction in which to move.
   * @param {number} step - The distance to move in the chosen direction.
   * @param {number} maxWidth - The maximum allowable x value.
   * @param {number} maxHeight - The maximum allowable y value.
   */
  move(direction, step, maxWidth, maxHeight) {
    const movements = [
      () => {
        this.x = Math.min(this.x + step, maxWidth - step);
      }, // Right
      () => {
        this.x = Math.max(this.x - step, 0);
      }, // Left
      () => {
        this.y = Math.min(this.y + step, maxHeight - step);
      }, // Down
      () => {
        this.y = Math.max(this.y - step, 0);
      } // Up
    ];
    movements[direction]();
  }

  /**
   * Clones the position, creating a new instance with the same coordinates.
   * @returns {Position} A new Position instance with the same x and y values.
   */
  clone() {
    return new Position(this.x, this.y);
  }
}

/**
 * Represents a single dot on the grid, handling its visual representation and positioning.
 */
class Dot {
  /**
   * Creates a new Dot instance.
   * @param {Position} position - The position object representing the dot's location.
   * @param {string} color - The color of the dot.
   * @param {number} size - The size of the dot.
   */
  constructor(position, color, size) {
    this.position = position;
    this.color = color;
    this.size = size;
    this.element = this.createDotElement();
    this.updatePosition();
  }

  /**
   * Initializes the dot element with default styles and the specified color and size.
   * @returns {HTMLElement} The initialized dot element.
   */
  createDotElement() {
    const dotElement = document.createElement("div");
    dotElement.classList.add("dot", this.color);
    dotElement.style.height = `${this.size}px`;
    dotElement.style.width = `${this.size}px`;
    return dotElement;
  }

  /**
   * Updates the color of the dot.
   * @param {string} newColor - The new color to set.
   */
  changeColor(newColor) {
    this.element.classList.replace(this.color, newColor);
    this.color = newColor;
  }

  /**
   * Updates the position of the dot on the grid based on its Position object.
   */
  updatePosition() {
    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
  }
}

/**
 * Handles the movement logic for dots, calculating new positions based on the current position and random direction.
 */
class DotMover {
  /**
   * Creates a new DotMover instance.
   * @param {number} step - The distance each move should take.
   * @param {number} maxWidth - The maximum allowable x-coordinate.
   * @param {number} maxHeight - The maximum allowable y-coordinate.
   */
  constructor(step, maxWidth, maxHeight) {
    this.step = step;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
  }

  /**
   * Calculates a new position based on the current position and random direction.
   * @param {Position} position - The current position.
   * @returns {Position} The new position after the move.
   */
  getNewPosition(position) {
    const direction = Math.floor(Math.random() * 4);
    const newPosition = position.clone();
    newPosition.move(direction, this.step, this.maxWidth, this.maxHeight);
    return newPosition;
  }

  /**
   * Changes the step size for movements.
   * @param {number} newStep - The new step size.
   */
  changeStepSize(newStep) {
    this.step = parseInt(newStep, 10);
  }
}

/**
 * Manages the creation, updating, and management of dots on the canvas.
 */
class DotManager {
  /**
   * Creates a new DotManager instance.
   * @param {number} maxWidth - The maximum width of the canvas.
   * @param {number} maxHeight - The maximum height of the canvas.
   * @param {DotMover} dotMover - The DotMover instance to control dot movements.
   */
  constructor(maxWidth, maxHeight, dotMover) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.dotMover = dotMover;
    this.gridContainer = document.getElementById("gridContainer");
    this.previousDot = null;
    this.dotSize = 10;
    this.color = "black";
  }

  /**
   * Creates and places a new dot on the canvas or moves the existing dot to a new position.
   */
  createDot() {
    let newPosition;
    if (!this.previousDot) {
      const initialX = this.maxWidth / 2;
      const initialY = this.maxHeight / 2;
      newPosition = new Position(initialX, initialY);
    } else {
      newPosition = this.dotMover.getNewPosition(this.previousDot.position);
      this.previousDot.changeColor(this.color);
    }
    this.previousDot = new Dot(newPosition, this.color, this.dotSize);
    this.gridContainer.appendChild(this.previousDot.element);
  }

  /**
   * Clears all dots from the canvas, resetting it to an empty state.
   */
  resetDots() {
    while (this.gridContainer.firstChild) {
      this.gridContainer.removeChild(this.gridContainer.firstChild);
    }
    this.previousDot = null;
  }

  /**
   * Changes the color of future dots.
   * @param {string} newColor - The new color for dots.
   */
  changeColor(newColor) {
    this.color = newColor;
  }

  /**
   * Changes the size of future dots.
   * @param {number} newSize - The new size for dots.
   */
  changeDotSize(newSize) {
    this.dotSize = parseInt(newSize, 10);
  }
}

/**
 * Handles user interactions, updating the game settings and controls based on user input.
 */
class UIManager {
  /**
   * Creates a new UIManager instance.
   * @param {GameController} gameController - The main controller of the game.
   */
  constructor(gameController) {
    this.gameController = gameController;
    this.attachEventListeners();
  }

  /**
   * Attaches event listeners to UI elements for controlling the game.
   */
  attachEventListeners() {
    document
      .getElementById("startButton")
      .addEventListener("click", () => this.gameController.startDotMover());
    document
      .getElementById("stopButton")
      .addEventListener("click", () => this.gameController.stopDotMover());
    document
      .getElementById("resetButton")
      .addEventListener("click", () =>
        this.gameController.dotManager.resetDots()
      );
    document
      .getElementById("stepSlider")
      .addEventListener("input", (e) =>
        this.gameController.dotMover.changeStepSize(e.target.value)
      );
    document
      .getElementById("sizeSlider")
      .addEventListener("input", (e) =>
        this.gameController.dotManager.changeDotSize(e.target.value)
      );

    const colorButtons = document.querySelectorAll(".colorButton");
    colorButtons.forEach((button) => {
      button.addEventListener("click", (e) =>
        this.gameController.dotManager.changeColor(e.target.dataset.color)
      );
    });
  }
}

/**
 * Controls the overall flow and rules of the game, coordinating between the UI, dot movement, and management.
 */
class GameController {
  /**
   * Creates a new GameController instance.
   * @param {number} maxWidth - The maximum width of the canvas.
   * @param {number} maxHeight - The maximum height of the canvas.
   * @param {number} step - The initial step size for dot movements.
   */
  constructor(maxWidth, maxHeight, step) {
    this.dotMover = new DotMover(step, maxWidth, maxHeight);
    this.dotManager = new DotManager(maxWidth, maxHeight, this.dotMover);
    this.uiManager = new UIManager(this);
    this.intervalId = null;
  }

  /**
   * Starts the process of automatically creating and moving dots.
   */
  startDotMover() {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.dotManager.createDot(), 0);
    }
  }

  /**
   * Stops the automatic creation and movement of dots.
   */
  stopDotMover() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

//////////////////////////////////////////////////

// Initialize the game when the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", () => {
  new GameController(500, 500, 10);
});
