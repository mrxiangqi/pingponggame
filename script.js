const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreText = document.getElementById('playerScore');
const cpuScoreText = document.getElementById('cpuScore');
const restartBtn = document.getElementById('restartBtn');

const paddle = {
  width: 14,
  height: 96,
  margin: 18,
  speed: 8,
};

const player = {
  x: paddle.margin,
  y: canvas.height / 2 - paddle.height / 2,
  dy: 0,
  score: 0,
};

const cpu = {
  x: canvas.width - paddle.width - paddle.margin,
  y: canvas.height / 2 - paddle.height / 2,
  score: 0,
};

const ball = {
  size: 14,
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 5,
  vy: 3,
  speedBoost: 0.35,
};

let isRunning = true;

function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = 5 * direction;
  ball.vy = (Math.random() * 4 - 2) || 2;
}

function clampPaddle(target) {
  return Math.max(0, Math.min(canvas.height - paddle.height, target));
}

function updateScore() {
  playerScoreText.textContent = player.score;
  cpuScoreText.textContent = cpu.score;
}

function movePlayer() {
  player.y = clampPaddle(player.y + player.dy);
}

function moveCpu() {
  const cpuCenter = cpu.y + paddle.height / 2;
  const diff = ball.y - cpuCenter;
  const reaction = Math.sign(diff) * Math.min(Math.abs(diff) * 0.12, 6);
  cpu.y = clampPaddle(cpu.y + reaction);
}

function collideWithPaddle(target) {
  return (
    ball.x - ball.size / 2 < target.x + paddle.width &&
    ball.x + ball.size / 2 > target.x &&
    ball.y - ball.size / 2 < target.y + paddle.height &&
    ball.y + ball.size / 2 > target.y
  );
}

function bounceFromPaddle(target, direction) {
  const relativeIntersect = ball.y - (target.y + paddle.height / 2);
  const normalized = relativeIntersect / (paddle.height / 2);
  ball.vx = (Math.abs(ball.vx) + ball.speedBoost) * direction;
  ball.vy = normalized * 6;
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y <= ball.size / 2 || ball.y >= canvas.height - ball.size / 2) {
    ball.vy *= -1;
  }

  if (collideWithPaddle(player) && ball.vx < 0) {
    bounceFromPaddle(player, 1);
  }

  if (collideWithPaddle(cpu) && ball.vx > 0) {
    bounceFromPaddle(cpu, -1);
  }

  if (ball.x < 0) {
    cpu.score += 1;
    updateScore();
    resetBall(1);
  }

  if (ball.x > canvas.width) {
    player.score += 1;
    updateScore();
    resetBall(-1);
  }
}

function drawNet() {
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.setLineDash([10, 14]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb703';
  ctx.fill();
}

function drawOverlay() {
  if (isRunning) return;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Tạm dừng', canvas.width / 2, canvas.height / 2);
  ctx.font = '20px Arial';
  ctx.fillText('Nhấn Space để tiếp tục', canvas.width / 2, canvas.height / 2 + 36);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawRect(player.x, player.y, paddle.width, paddle.height, '#57d1ff');
  drawRect(cpu.x, cpu.y, paddle.width, paddle.height, '#57d1ff');
  drawBall();
  drawOverlay();
}

function loop() {
  if (isRunning) {
    movePlayer();
    moveCpu();
    updateBall();
  }
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  const mouseY = (event.clientY - rect.top) * scaleY;
  player.y = clampPaddle(mouseY - paddle.height / 2);
});

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'w') player.dy = -paddle.speed;
  if (event.key.toLowerCase() === 's') player.dy = paddle.speed;
  if (event.code === 'Space') {
    event.preventDefault();
    isRunning = !isRunning;
  }
});

window.addEventListener('keyup', (event) => {
  if ([ 'w', 's' ].includes(event.key.toLowerCase())) {
    player.dy = 0;
  }
});

restartBtn.addEventListener('click', () => {
  player.score = 0;
  cpu.score = 0;
  player.y = canvas.height / 2 - paddle.height / 2;
  cpu.y = canvas.height / 2 - paddle.height / 2;
  updateScore();
  resetBall(Math.random() > 0.5 ? 1 : -1);
  isRunning = true;
});

updateScore();
resetBall(Math.random() > 0.5 ? 1 : -1);
loop();
