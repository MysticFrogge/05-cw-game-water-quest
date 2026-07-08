// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let currentGridSize = 5;     // Current grid size
let waterSourceRow = null;   // Random row where the water source begins
let waterTankRow = null;     // Random row where the water tank is tied
let timerInterval = null;    // Tracks the countdown interval
let timeLeft = 10;           // Time remaining in seconds
let selectedPipeCell = null; // Stores the first clicked pipe cell for swapping
let swapsLocked = false;     // Prevents pipe movement after activation

// Starting timer duration for a fresh game. Each completed round reduces
// this by 2 seconds, down to a minimum of MIN_ROUND_TIME.
let baseTimerSeconds = 25;
const MIN_ROUND_TIME = 10;
const ROUND_TIME_STEP = 2;
 
// List of pipe pieces that can appear in the grid.
const pipeTypes = [
  {
    name: 'Left_Right_Empty',
    image: 'img/Pipe-pieces/Left_Right_Empty.png',
    connections: ['left', 'right']
  },
  {
    name: 'Cross_Empty',
    image: 'img/Pipe-pieces/Cross_Empty.png',
    connections: ['left', 'right', 'up', 'down']
  },
  {
    name: 'Down_Right_Empty',
    image: 'img/Pipe-pieces/Down_Right_Empty.png',
    connections: ['down', 'right']
  },
  {
    name: 'HalfCross_Down_Empty',
    image: 'img/Pipe-pieces/HalfCross_Down_Empty.png',
    connections: ['left', 'down', 'right']
  },
  {
    name: 'HalfCross_Left_Empty',
    image: 'img/Pipe-pieces/HalfCross_Left_Empty.png',
    connections: ['left', 'up', 'down']
  },
  {
    name: 'HalfCross_Right_Empty',
    image: 'img/Pipe-pieces/HalfCross_Right_Empty.png',
    connections: ['up', 'down', 'right']
  },
  {
    name: 'HalfCross_Up_Empty',
    image: 'img/Pipe-pieces/HalfCross_Up_Empty.png',
    connections: ['left', 'up', 'right']
  },
  {
    name: 'Left_Down_Empty',
    image: 'img/Pipe-pieces/Left_Down_Empty.png',
    connections: ['left', 'down']
  },
  {
    name: 'Left_Up_Empty',
    image: 'img/Pipe-pieces/Left_Up_Empty.png',
    connections: ['left', 'up']
  },
  {
    name: 'Up_Down_Empty',
    image: 'img/Pipe-pieces/Up_Down_Empty.png',
    connections: ['up', 'down']
  },
  {
    name: 'Up_Right_Empty',
    image: 'img/Pipe-pieces/Up_Right_Empty.png',
    connections: ['up', 'right']
  }
];
 
const waterActivationPipeNames = [
  'Left_Right_Empty',
  'Cross_empty',
  'Down_Right_Empty',
  'HalfCross_Down_Empty',
  'HalfCross_Left_Empty',
  'HalfCross_Right_Empty',
  'HalfCross_Up_Empty',
  'Left_Down_Empty',
  'Left_Up_Empty',
  'Up_Down_Empty',
  'Up_Right_Empty',
  'halfcross_down_empty',
  'halfcross_left_empty',
  'halfcross_up_empty'
];
 
function chooseWaterSourceRow(gridSize) {
  waterSourceRow = Math.floor(Math.random() * gridSize);
}
 
function normalizePipeName(pipeName = '') {
  return pipeName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
 
function isWaterActivationPipe(pipeName = '') {
  const normalizedTargetName = normalizePipeName(pipeName);
  return waterActivationPipeNames.some((name) => normalizePipeName(name) === normalizedTargetName);
}
 
function getPipeConnections(pipeName = '') {
  const normalizedName = normalizePipeName(pipeName);
 
  if (normalizedName === 'left_right_empty' || normalizedName === 'left_right_full') {
    return ['left', 'right'];
  }
 
  if (normalizedName === 'up_down_empty' || normalizedName === 'up_down_full') {
    return ['up', 'down'];
  }
 
  if (normalizedName === 'cross_empty' || normalizedName === 'cross_full') {
    return ['left', 'right', 'up', 'down'];
  }
 
  if (normalizedName === 'down_right_empty' || normalizedName === 'down_right_full') {
    return ['down', 'right'];
  }
 
  if (normalizedName === 'halfcross_down_empty' || normalizedName === 'halfcross_down_full') {
    return ['left', 'down', 'right'];
  }
 
  if (normalizedName === 'halfcross_left_empty' || normalizedName === 'halfcross_left_full') {
    return ['left', 'up', 'down'];
  }
 
  if (normalizedName === 'halfcross_right_empty' || normalizedName === 'halfcross_right_full') {
    return ['up', 'down', 'right'];
  }
 
  if (normalizedName === 'halfcross_up_empty' || normalizedName === 'halfcross_up_full') {
    return ['left', 'up', 'right'];
  }
 
  if (normalizedName === 'left_down_empty' || normalizedName === 'left_down_full') {
    return ['left', 'down'];
  }
 
  if (normalizedName === 'left_up_empty' || normalizedName === 'left_up_full') {
    return ['left', 'up'];
  }
 
  if (normalizedName === 'up_down_empty' || normalizedName === 'up_down_full') {
    return ['up', 'down'];
  }
 
  if (normalizedName === 'up_right_empty' || normalizedName === 'up_right_full') {
    return ['up', 'right'];
  }
 
  return [];
}
 
function getOppositeDirection(direction) {
  const oppositeDirections = {
    left: 'right',
    right: 'left',
    up: 'down',
    down: 'up'
  };
 
  return oppositeDirections[direction] || null;
}
 
function getNeighborCellIndex(index, direction, gridSize) {
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;
 
  if (direction === 'left' && col > 0) {
    return index - 1;
  }
 
  if (direction === 'right' && col < gridSize - 1) {
    return index + 1;
  }
 
  if (direction === 'up' && row > 0) {
    return index - gridSize;
  }
 
  if (direction === 'down' && row < gridSize - 1) {
    return index + gridSize;
  }
 
  return null;
}
 
function getFullPipeVariant(pipeName = '') {
  const normalizedName = normalizePipeName(pipeName);
 
  const pipeVariantMap = {
    left_right_empty: {
      name: 'Left_Right_Full',
      image: 'img/Pipe-pieces/Left_Right_Full.png'
    },
    cross_empty: {
      name: 'Cross_Full',
      image: 'img/Pipe-pieces/Cross_Full.png'
    },
    down_right_empty: {
      name: 'Down_Right_Full',
      image: 'img/Pipe-pieces/Down_Right_Full.png'
    },
    halfcross_down_empty: {
      name: 'HalfCross_Down_Full',
      image: 'img/Pipe-pieces/HalfCross_Down_Full.png'
    },
    halfcross_left_empty: {
      name: 'HalfCross_Left_Full',
      image: 'img/Pipe-pieces/HalfCross_Left_Full.png'
    },
    halfcross_right_empty: {
      name: 'HalfCross_Right_Full',
      image: 'img/Pipe-pieces/HalfCross_Right_Full.png'
    },
    halfcross_up_empty: {
      name: 'HalfCross_Up_Full',
      image: 'img/Pipe-pieces/HalfCross_Up_Full.png'
    },
    left_down_empty: {
      name: 'Left_Down_Full',
      image: 'img/Pipe-pieces/Left_Down_Full.png'
    },
    left_up_empty: {
      name: 'Left_Up_Full',
      image: 'img/Pipe-pieces/Left_Up_Full.png'
    },
    up_down_empty: {
      name: 'Up_Down_Full',
      image: 'img/Pipe-pieces/Up_Down_Full.png'
    },
    up_right_empty: {
      name: 'Up_Right_Full',
      image: 'img/Pipe-pieces/Up_Right_Full.png'
    }
  };
 
  return pipeVariantMap[normalizedName] || null;
}
 
function getWaterSourceTargetCell(gridSize = currentGridSize) {
  const grid = document.querySelector('.game-grid');
  if (!grid) return null;
 
  const cells = Array.from(grid.children);
  if (cells.length === 0) return null;
 
  const targetIndex = (waterSourceRow ?? 0) * gridSize;
  return cells[targetIndex] || cells[0] || null;
}
 
function chooseWaterTankRow(gridSize) {
  waterTankRow = Math.floor(Math.random() * gridSize);
}
 
function getWaterTankTargetCell(gridSize = currentGridSize) {
  const grid = document.querySelector('.game-grid');
  if (!grid) return null;
 
  const cells = Array.from(grid.children);
  if (cells.length === 0) return null;
 
  // Right-side tank ties to the tile at the far right column in the given row
  const targetIndex = (waterTankRow ?? 0) * gridSize + (gridSize - 1);
  return cells[targetIndex] || cells[cells.length - 1] || null;
}
 
function updateTimerDisplay() {
  const timer = document.getElementById('timer');
  if (timer) {
    timer.textContent = timeLeft;
  }
}
 
function startGameTimer() {
  clearInterval(timerInterval);
  swapsLocked = false;
  timeLeft = baseTimerSeconds;
  updateTimerDisplay();
 
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
 
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      activateWaterSource();
    }
  }, 1000);
}
 
function activatePipeCell(cell) {
  const pipeName = cell.dataset.pipeName || '';
  const fullPipeVariant = getFullPipeVariant(pipeName);
 
  if (!fullPipeVariant) return false;
 
  const pipeImage = document.createElement('img');
  pipeImage.src = fullPipeVariant.image;
  pipeImage.alt = fullPipeVariant.name;
  pipeImage.className = 'pipe-piece';
 
  cell.innerHTML = '';
  cell.dataset.pipeName = fullPipeVariant.name;
  cell.dataset.activated = 'true';
  cell.classList.add('pipe-activated');
  cell.appendChild(pipeImage);
 
  return true;
}
 
function activateWaterSource() {
  const source = document.getElementById('water-source');
  const targetCell = getWaterSourceTargetCell();
 
  if (!source || !targetCell) return;
 
  const grid = document.querySelector('.game-grid');
  if (!grid) return;
 
  const cells = Array.from(grid.children);
  const visited = new Set();
  const queue = [];
  const sourceIndex = cells.indexOf(targetCell);
 
  const sourcePipeName = targetCell.dataset.pipeName || '';
  const sourceConnections = getPipeConnections(sourcePipeName);
 
  if (
    sourceIndex >= 0 &&
    isWaterActivationPipe(sourcePipeName) &&
    sourceConnections.includes('left')
  ) {
    activatePipeCell(targetCell);
    visited.add(sourceIndex);
    queue.push(sourceIndex);
  }
 
  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const currentCell = cells[currentIndex];
    const currentPipeName = currentCell.dataset.pipeName || '';
    const currentConnections = getPipeConnections(currentPipeName);
 
    currentConnections.forEach((direction) => {
      const neighborIndex = getNeighborCellIndex(currentIndex, direction, currentGridSize);
      if (neighborIndex === null || visited.has(neighborIndex)) {
        return;
      }
 
      const neighborCell = cells[neighborIndex];
      const neighborPipeName = neighborCell.dataset.pipeName || '';
      const neighborConnections = getPipeConnections(neighborPipeName);
      const oppositeDirection = getOppositeDirection(direction);
 
      if (
        neighborCell.dataset.activated === 'true' ||
        !isWaterActivationPipe(neighborPipeName) ||
        !neighborConnections.includes(oppositeDirection)
      ) {
        return;
      }
 
      activatePipeCell(neighborCell);
      visited.add(neighborIndex);
      queue.push(neighborIndex);
    });
  }
 
  const activatedAny = cells.some((cell) => cell.dataset.activated === 'true');
  swapsLocked = true;
  selectedPipeCell = null;
  source.classList.toggle('active', activatedAny);
 
  // Also update the water tank visual based on whether any activated pipe reaches its tied tile
  const tank = document.getElementById('water-tank');
  const tankCell = getWaterTankTargetCell();
  if (tank && tankCell) {
    const tankPipeName = tankCell.dataset.pipeName || '';
    const tankConnections = getPipeConnections(tankPipeName);
    const tankConnected =
      tankCell.dataset.activated === 'true' && tankConnections.includes('right');

    if (tankConnected) {
      tank.style.backgroundImage = "url('img/Watertank_Full.png')";
      currentCans += 1;
      updateCansDisplay();
      setTimeout(() => {
        showRoundComplete();
      }, 2000);
    } else {
      tank.style.backgroundImage = "url('img/Watertank_Empty.png')";
      setTimeout(() => {
        showRoundFailed();
      }, 2000);
    }
  }
}
 
function placeWaterSource(gridSize = currentGridSize) {
  const grid = document.querySelector('.game-grid');
  const source = document.getElementById('water-source');
  const stage = document.querySelector('.game-stage');
 
  if (!grid || !source || !stage) return;
 
  const cells = Array.from(grid.children);
  if (cells.length === 0) return;
 
  const targetCell = getWaterSourceTargetCell(gridSize);
  const stageRect = stage.getBoundingClientRect();
  const cellRect = targetCell.getBoundingClientRect();
  
  // Scale water source inversely with grid size: larger on easy, smaller on hard
  // Base size of 140px for easy (5x5), scales down for larger grids
  const waterSourceSize = 140 * (5 / gridSize);
  source.style.width = `${waterSourceSize}px`;
  source.style.height = `${waterSourceSize}px`;
  
  // Position water source so it doesn't clip into the grid (offset by its width plus 5px gap)
  const leftOffset = -waterSourceSize - 5;
  source.style.left = `${leftOffset}px`;
  
  // Center the water source on the target cell
  const topPosition = cellRect.top - stageRect.top + (cellRect.height / 2) - (waterSourceSize / 2);
 
  source.style.top = `${topPosition}px`;
  source.style.display = 'block';
}
 
function placeWaterTank(gridSize = currentGridSize) {
  const grid = document.querySelector('.game-grid');
  const tank = document.getElementById('water-tank');
  const stage = document.querySelector('.game-stage');
 
  if (!grid || !tank || !stage) return;
 
  const targetCell = getWaterTankTargetCell(gridSize);
  if (!targetCell) return;
 
  const stageRect = stage.getBoundingClientRect();
  const cellRect = targetCell.getBoundingClientRect();
 
  // Increase the tank so its pipe graphic more closely matches the width
  // of the pipes in the grid. We compute a size relative to the cell width
  // and ensure a reasonable minimum based on difficulty.
  const baseSize = Math.round(120 * (5 / gridSize));
  const desiredFromCell = Math.round(cellRect.width * 1.8); // 1.8x a grid cell
  const tankSize = Math.max(baseSize * 1.2, desiredFromCell); // choose the larger
  tank.style.width = `${tankSize}px`;
  tank.style.height = `${tankSize}px`;
  // Align a connector point on the tank image with the right-center of the tied cell.
  // We compute a very small overlap ('sliver') so the connector lines up while
  // the visible tank body remains effectively outside the stage.
  const sliverPx = 2; // allow 2px overlap so alignment is exact but visually outside
 
  const desiredConnX = cellRect.left - stageRect.left + cellRect.width; // right edge of cell
  const desiredConnY = cellRect.top - stageRect.top + (cellRect.height / 2);
 
  // Connector fraction derived from sliver: connector will sit `sliverPx` inside the stage
  const pipeConnXFrac = sliverPx / tankSize;
  const pipeConnYFrac = 0.20; // vertical connector fraction (tweak up slightly)
 
  // Compute tank left/top relative to the stage so the connector aligns exactly
  const tankLeft = desiredConnX - (tankSize * pipeConnXFrac);
  let tankTop = desiredConnY - (tankSize * pipeConnYFrac);
 
  // Difficulty-specific offsets: move more up on all sizes; adjust X per difficulty
  let tankOffsetX = 0;
  const tankOffsetY = -12; // move up on all difficulties to align better
 
  if (gridSize <= 5) {
    // Easy: move closer to grid (left)
    tankOffsetX = -20;
  } else if (gridSize >= 10) {
    // Hard: move more left than before but keep the tank outside the grid
    tankOffsetX = -7; // nudged 2px to the right from previous -11
  } else {
    // Medium: small left nudge
    tankOffsetX = -1;
  }
 
  // Apply left relative to the stage; add offset to fine-tune placement
  tank.style.left = `${Math.round(tankLeft) + tankOffsetX}px`;
  tank.style.right = 'auto';
 
  // Clamp vertical position so the tank isn't far off-stage
  const minTop = -Math.round(tankSize * 0.4);
  const maxTop = Math.round(stageRect.height - tankSize * 0.05);
  tankTop = Math.max(minTop, Math.min(tankTop, maxTop));
  tank.style.top = `${Math.round(tankTop) + tankOffsetY}px`;
  tank.style.display = 'block';
}
 
function renderPipeCell(cell, pipeName) {
  const pipeType = pipeTypes.find((type) => type.name === pipeName) || pipeTypes[0];
  const pipeImage = document.createElement('img');
  pipeImage.src = pipeType.image;
  pipeImage.alt = pipeType.name;
  pipeImage.className = 'pipe-piece';
 
  cell.innerHTML = '';
  cell.dataset.pipeName = pipeName;
  cell.dataset.activated = 'false';
  cell.classList.remove('pipe-activated');
  cell.appendChild(pipeImage);
}
 
function swapPipeCells(firstCell, secondCell) {
  const firstPipeName = firstCell.dataset.pipeName || '';
  const secondPipeName = secondCell.dataset.pipeName || '';
 
  renderPipeCell(firstCell, secondPipeName);
  renderPipeCell(secondCell, firstPipeName);
}
 
function handlePipeCellClick(event) {
  const cell = event.currentTarget;
 
  if (swapsLocked) {
    return;
  }
 
  if (!selectedPipeCell) {
    selectedPipeCell = cell;
    cell.classList.add('pipe-selected');
    return;
  }
 
  if (selectedPipeCell === cell) {
    selectedPipeCell.classList.remove('pipe-selected');
    selectedPipeCell = null;
    return;
  }
 
  swapPipeCells(selectedPipeCell, cell);
  selectedPipeCell.classList.remove('pipe-selected');
  selectedPipeCell = null;
}
 
function getRandomPipeType() {
  const randomIndex = Math.floor(Math.random() * pipeTypes.length);
  return pipeTypes[randomIndex];
}
 
function populateGridWithPipes(grid) {
  const cells = Array.from(grid.children);
 
  cells.forEach((cell) => {
    const pipeType = getRandomPipeType();
    renderPipeCell(cell, pipeType.name);
  });
}
 
// Creates a game grid of specified size
function createGrid(gridSize = currentGridSize) {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  const totalCells = gridSize * gridSize;
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    cell.addEventListener('click', handlePipeCellClick);
    grid.appendChild(cell);
  }
  // Update CSS grid sizing so the board is a proper square grid
  grid.style.gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, minmax(0, 1fr))`;
  grid.style.aspectRatio = `${gridSize} / ${gridSize}`;
 
  populateGridWithPipes(grid);
 
  chooseWaterSourceRow(gridSize);
  chooseWaterTankRow(gridSize);

  // Reset the tank sprite back to empty for the new round
  const tank = document.getElementById('water-tank');
  if (tank) {
    tank.style.backgroundImage = "url('img/Watertank_Empty.png')";
    tank.classList.remove('active');
  }
  const source = document.getElementById('water-source');
  if (source) {
    source.classList.remove('active');
  }
 
  placeWaterSource();
  placeWaterTank();
}
 
// Show the difficulty menu and hide the game elements
function showMenu() {
  const menuScreen = document.getElementById('menu-screen');
  const grid = document.querySelector('.game-grid');
  const source = document.getElementById('water-source');
  const tank = document.getElementById('water-tank');
  const roundCompleteScreen = document.getElementById('round-complete-screen');
  const roundFailedScreen = document.getElementById('round-failed-screen');
 
  if (menuScreen) menuScreen.style.display = 'flex';
  if (grid) grid.style.display = 'none';
  if (source) source.style.display = 'none';
  if (tank) tank.style.display = 'none';
  if (roundCompleteScreen) roundCompleteScreen.style.display = 'none';
  if (roundFailedScreen) roundFailedScreen.style.display = 'none';
}
 
// Hide the menu and reveal the game elements
function showGame() {
  const menuScreen = document.getElementById('menu-screen');
  const grid = document.querySelector('.game-grid');
  const roundCompleteScreen = document.getElementById('round-complete-screen');
  const roundFailedScreen = document.getElementById('round-failed-screen');
 
  if (menuScreen) menuScreen.style.display = 'none';
  if (roundCompleteScreen) roundCompleteScreen.style.display = 'none';
  if (roundFailedScreen) roundFailedScreen.style.display = 'none';
  if (grid) grid.style.display = 'grid';
  // water-source/water-tank display is handled by placeWaterSource/placeWaterTank
}

// Show the "Round completed!" screen in place of the grid, reporting the
// total cans filled so far, with a button to continue to the next round.
function showRoundComplete() {
  gameActive = false;
  clearInterval(timerInterval);
  timerInterval = null;

  const grid = document.querySelector('.game-grid');
  const source = document.getElementById('water-source');
  const tank = document.getElementById('water-tank');
  const roundCompleteScreen = document.getElementById('round-complete-screen');
  const roundCompleteCans = document.getElementById('round-complete-cans');

  if (grid) grid.style.display = 'none';
  if (source) source.style.display = 'none';
  if (tank) tank.style.display = 'none';
  if (roundCompleteCans) roundCompleteCans.textContent = currentCans;
  if (roundCompleteScreen) roundCompleteScreen.style.display = 'flex';
}

// Show the "Round failed" screen in place of the grid, reporting the
// final cans filled score, with a button to restart from the menu.
function showRoundFailed() {
  gameActive = false;
  clearInterval(timerInterval);
  timerInterval = null;

  const grid = document.querySelector('.game-grid');
  const source = document.getElementById('water-source');
  const tank = document.getElementById('water-tank');
  const roundFailedScreen = document.getElementById('round-failed-screen');
  const roundFailedCans = document.getElementById('round-failed-cans');

  if (grid) grid.style.display = 'none';
  if (source) source.style.display = 'none';
  if (tank) tank.style.display = 'none';
  if (roundFailedCans) roundFailedCans.textContent = currentCans;
  if (roundFailedScreen) roundFailedScreen.style.display = 'flex';
}

// Resets game state and returns to the difficulty selection menu.
function restartGame() {
  currentCans = 0;
  updateCansDisplay();

  const roundFailedScreen = document.getElementById('round-failed-screen');
  if (roundFailedScreen) roundFailedScreen.style.display = 'none';

  showMenu();
}

// Starts the next round on the same difficulty, reducing the timer by
// ROUND_TIME_STEP seconds (never going below MIN_ROUND_TIME).
function continueToNextRound() {
  baseTimerSeconds = Math.max(MIN_ROUND_TIME, baseTimerSeconds - ROUND_TIME_STEP);

  const roundCompleteScreen = document.getElementById('round-complete-screen');
  if (roundCompleteScreen) roundCompleteScreen.style.display = 'none';

  showGame();
  gameActive = true;
  createGrid(currentGridSize);
  startGameTimer();
}
 
// Hide difficulty buttons and start game
function startGameWithDifficulty(gridSize) {
  showGame();
  currentGridSize = gridSize;
  baseTimerSeconds = 25; // reset round timer for a fresh game
  chooseWaterSourceRow(gridSize);
  chooseWaterTankRow(gridSize);
  gameActive = true;
  createGrid(gridSize); // Set up the game grid
  startGameTimer();
}
 
function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(timerInterval);
  timerInterval = null;
}
 
// Initialize the timer display; grid/water elements stay hidden until a difficulty is chosen
timeLeft = baseTimerSeconds;
updateTimerDisplay();
 
// Set up click handlers
document.getElementById('easy-btn').addEventListener('click', () => startGameWithDifficulty(5));
document.getElementById('medium-btn').addEventListener('click', () => startGameWithDifficulty(7));
document.getElementById('hard-btn').addEventListener('click', () => startGameWithDifficulty(10));
document.getElementById('continue-btn').addEventListener('click', continueToNextRound);
document.getElementById('restart-btn').addEventListener('click', restartGame);
window.addEventListener('resize', () => {
  if (gameActive) {
    placeWaterSource();
    placeWaterTank();
  }
});
 
function updateCansDisplay() {
  const cansDisplay = document.getElementById('current-cans');
  if (cansDisplay) {
    cansDisplay.textContent = currentCans;
  }
}