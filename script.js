// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let currentGridSize = 6;     // Current grid size

// Creates a game grid of specified size
function createGrid(gridSize = currentGridSize) {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  const totalCells = gridSize * gridSize;
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
  // Update CSS grid columns
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
}

// Ensure the grid is created when the page loads
createGrid();

// Show difficulty selection buttons
function showDifficultyButtons() {
  document.getElementById('start-game').style.display = 'none';
  document.getElementById('difficulty-buttons').style.display = 'flex';
}

// Hide difficulty buttons and start game
function startGameWithDifficulty(gridSize) {
  document.getElementById('difficulty-buttons').style.display = 'none';
  currentGridSize = gridSize;
  gameActive = true;
  createGrid(gridSize); // Set up the game grid
}

function endGame() {
  gameActive = false; // Mark the game as inactive
}

// Set up click handlers
document.getElementById('start-game').addEventListener('click', showDifficultyButtons);
document.getElementById('easy-btn').addEventListener('click', () => startGameWithDifficulty(5));
document.getElementById('medium-btn').addEventListener('click', () => startGameWithDifficulty(7));
document.getElementById('hard-btn').addEventListener('click', () => startGameWithDifficulty(10));
