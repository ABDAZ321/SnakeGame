const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

//Listening to specific server
const socket = io('https://socketserver-kr9u.onrender.com');

// Getting socket trigger events
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

//Gets html values from index.html
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

//Click even for game join or new game
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

//Initilizing new game
function newGame() {
  socket.emit('newGame');
  init();
}

//Joining game
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

//Initilizing game screen
function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  //Setting game canvas
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

//When key pressed
function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

//Painting game every framce
function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  //Painting snakes
  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  //painting snake with specifc position
  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

//Setting player to specific num 1 or 2
function handleInit(number) {
  playerNumber = number;
}

// Request for new frame from paitnt game every frame
function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

//What happens when game is over
function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  //deactivates game
  gameActive = false;

  //Gives each player their respective game ove prompt
  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}

//Sets room name code to specific code
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

//Alerts user that game code is invalid
function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}


//Alerts user that game is full
function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

//Resets entire game
function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}