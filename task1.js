// ===== Task 1: Code Breaker =====
// All numbers of the game are constants
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 8;
const MIN_DIGIT = 0;
const MAX_DIGIT = 9;

const form = document.getElementById('guess-form');
const input = document.getElementById('guess');
const guessBtn = document.getElementById('guess-btn');
const restartBtn = document.getElementById('restart-btn');
const messageEl = document.getElementById('message');
const historyEl = document.getElementById('history');
const emptyHistory = document.getElementById('empty-history');
const attemptsLeftEl = document.getElementById('attempts-left');
const winsEl = document.getElementById('wins');
const lossesEl = document.getElementById('losses');
const rulesEl = document.getElementById('rules');
const gameSection = document.getElementById('game');

let secret = [];
let guesses = [];   // each: { digits: '1234', right: 1, wrong: 2 }
let gameOver = false;
let wins = 0;
let losses = 0;

// Fair random integer: min and max both included
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Secret code with no repeated digits
function generateSecret() {
  const pool = [];
  for (let d = MIN_DIGIT; d <= MAX_DIGIT; d++) {
    pool.push(d);
  }
  const code = [];
  while (code.length < CODE_LENGTH) {
    const index = randomInt(0, pool.length - 1);
    code.push(pool.splice(index, 1)[0]); // remove so it cannot repeat
  }
  return code;
}

// Returns an error text, or '' if the guess is valid
function validateGuess(text) {
  if (text.length !== CODE_LENGTH) {
    return `Enter exactly ${CODE_LENGTH} digits.`;
  }
  const seen = [];
  for (const ch of text) {
    if (!/^[0-9]$/.test(ch) || Number(ch) < MIN_DIGIT || Number(ch) > MAX_DIGIT) {
      return `Use only digits from ${MIN_DIGIT} to ${MAX_DIGIT}.`;
    }
    if (seen.includes(ch)) {
      return 'Digits must not repeat.';
    }
    seen.push(ch);
  }
  return '';
}

// Count digits in the right place and in the wrong place
function evaluate(text) {
  let right = 0;
  let wrong = 0;
  for (let i = 0; i < CODE_LENGTH; i++) {
    const digit = Number(text[i]);
    if (digit === secret[i]) {
      right++;
    } else if (secret.includes(digit)) {
      wrong++;
    }
  }
  return { right, wrong };
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message ' + type;
}

function render() {
  attemptsLeftEl.textContent = MAX_ATTEMPTS - guesses.length;
  winsEl.textContent = wins;
  lossesEl.textContent = losses;

  historyEl.replaceChildren();
  guesses.forEach((g, i) => {
    const li = document.createElement('li');

    const num = document.createElement('span');
    num.textContent = `#${i + 1}`;

    const digits = document.createElement('span');
    digits.className = 'digits';
    digits.textContent = g.digits;

    const result = document.createElement('span');
    const right = document.createElement('span');
    right.className = 'right';
    right.textContent = `${g.right} in place`;
    const wrong = document.createElement('span');
    wrong.className = 'wrong';
    wrong.textContent = ` · ${g.wrong} misplaced`;
    result.append(right, wrong);

    li.append(num, digits, result);
    historyEl.appendChild(li);
  });

  emptyHistory.classList.toggle('hidden', guesses.length > 0);
  input.disabled = gameOver;
  guessBtn.disabled = gameOver;
  gameSection.classList.toggle('game-over', gameOver);
}

function startGame() {
  secret = generateSecret();
  guesses = [];
  gameOver = false;
  input.value = '';
  input.maxLength = CODE_LENGTH;
  rulesEl.textContent =
    `Guess a ${CODE_LENGTH}-digit code (digits ${MIN_DIGIT}–${MAX_DIGIT}, no repeats) in ${MAX_ATTEMPTS} attempts.`;
  messageEl.className = 'message hidden';
  render();
  input.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (gameOver) return;

  const text = input.value.trim();
  const error = validateGuess(text);
  if (error !== '') {
    showMessage(error, 'error'); // state is NOT changed
    return;
  }

  const { right, wrong } = evaluate(text);
  guesses.push({ digits: text, right, wrong });
  input.value = '';

  const won = right === CODE_LENGTH;
  const noAttempts = guesses.length >= MAX_ATTEMPTS;

  if (won) {
    gameOver = true;
    wins++;
    showMessage(`You win in ${guesses.length} attempt(s)! 🎉`, 'win');
  } else if (noAttempts && !won) {
    gameOver = true;
    losses++;
    showMessage(`You lose. The code was ${secret.join('')}.`, 'loss');
  } else {
    showMessage(`${right} in the right place, ${wrong} in the wrong place.`, 'info');
  }

  render();
  if (!gameOver) input.focus();
});

restartBtn.addEventListener('click', startGame);

startGame();
