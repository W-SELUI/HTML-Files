const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

// GAME STATE
let gameStarted = false;
let gameOver = false;
let winner = "";

// SCORES
let playerScore = 0;
let aiScore = 0;

// EFFECTS
let ballTrail = [];

let shakeDuration = 0;
let shakeIntensity = 0;

// PLAYER
const player = {
    x: 20,
    y: 200,
    width: 15,
    height: 100,
    speed: 7
};

// AI
const ai = {
    x: 765,
    y: 200,
    width: 15,
    height: 100,
    speed: 4
};

// BALL
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speedX: 5,
    speedY: 3
};

// INPUT
let wPressed = false;
let sPressed = false;

document.addEventListener("keydown", (e) => {

    if (e.key.toLowerCase() === "w") wPressed = true;
    if (e.key.toLowerCase() === "s") sPressed = true;

    if (e.code === "Space") {

        if (!gameStarted) {
            gameStarted = true;
        }

        if (gameOver) {
            restartGame();
        }
    }
});

document.addEventListener("keyup", (e) => {

    if (e.key.toLowerCase() === "w") wPressed = false;
    if (e.key.toLowerCase() === "s") sPressed = false;
});

function triggerShake(duration, intensity) {
    shakeDuration = duration;
    shakeIntensity = intensity;
}

function restartGame() {

    playerScore = 0;
    aiScore = 0;

    winner = "";
    gameOver = false;

    resetBall();
}

function resetBall() {

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    ball.speedX = Math.random() > 0.5 ? 5 : -5;
    ball.speedY = Math.random() > 0.5 ? 3 : -3;

    ballTrail = [];
}

function update() {

    if (!gameStarted || gameOver) return;

    // PLAYER
    if (wPressed) player.y -= player.speed;
    if (sPressed) player.y += player.speed;

    player.y = Math.max(
        0,
        Math.min(canvas.height - player.height, player.y)
    );

    // AI
    const targetY = ball.y - ai.height / 2;

    if (ai.y < targetY) ai.y += ai.speed;
    if (ai.y > targetY) ai.y -= ai.speed;

    ai.y = Math.max(
        0,
        Math.min(canvas.height - ai.height, ai.y)
    );

    // BALL MOVEMENT
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // BALL TRAIL
    ballTrail.push({
        x: ball.x,
        y: ball.y
    });

    if (ballTrail.length > 15) {
        ballTrail.shift();
    }

    // WALL COLLISION
    if (
        ball.y - ball.radius <= 0 ||
        ball.y + ball.radius >= canvas.height
    ) {
        ball.speedY *= -1;
    }

    // PLAYER COLLISION
    if (
        ball.x - ball.radius <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height
    ) {

        const hitPosition =
            (ball.y - (player.y + player.height / 2))
            / (player.height / 2);

        ball.speedY = hitPosition * 7;
        ball.speedX = Math.abs(ball.speedX) * 1.05;

        triggerShake(8, 6);
    }

    // AI COLLISION
    if (
        ball.x + ball.radius >= ai.x &&
        ball.y >= ai.y &&
        ball.y <= ai.y + ai.height
    ) {

        const hitPosition =
            (ball.y - (ai.y + ai.height / 2))
            / (ai.height / 2);

        ball.speedY = hitPosition * 7;
        ball.speedX = -Math.abs(ball.speedX) * 1.05;

        triggerShake(8, 6);
    }

    // AI SCORE
    if (ball.x < 0) {

        aiScore++;

        if (aiScore >= 10) {
            winner = "AI WINS!";
            gameOver = true;
        }

        resetBall();
    }

    // PLAYER SCORE
    if (ball.x > canvas.width) {

        playerScore++;

        if (playerScore >= 10) {
            winner = "YOU WIN!";
            gameOver = true;
        }

        resetBall();
    }
}

function drawCenterLine() {

    ctx.strokeStyle = "#222";
    ctx.setLineDash([10, 10]);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]);
}

function draw() {
    

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // SCREEN SHAKE
    if (shakeDuration > 0) {

        const dx =
            (Math.random() - 0.5) * shakeIntensity;

        const dy =
            (Math.random() - 0.5) * shakeIntensity;

        ctx.translate(dx, dy);

        shakeDuration--;
    }

    // START SCREEN
    if (!gameStarted) {

        ctx.fillStyle = "#00ffff";
        ctx.font = "60px 'Press Start 2P'";

        ctx.fillText("NEON", 170, 170);

        ctx.fillStyle = "#ff00ff";
        ctx.fillText("PONG", 170, 260);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px 'Press Start 2P'";

        ctx.fillText("PRESS SPACE", 200, 350);
        ctx.fillText("W / S TO MOVE", 175, 420);

        ctx.restore();
        return;
    }

    drawCenterLine();

    // SCORES
    ctx.font = "50px 'Press Start 2P'";

    ctx.fillStyle = "#00ffff";
    ctx.fillText(playerScore, 170, 70);

    ctx.fillStyle = "#ff00ff";
    ctx.fillText(aiScore, 560, 70);

    // PLAYER PADDLE
    ctx.fillStyle = "#00ffff";
    ctx.shadowBlur = 35;
    ctx.shadowColor = "#00ffff";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    // AI PADDLE
    ctx.fillStyle = "#ff00ff";
    ctx.shadowBlur = 35;
    ctx.shadowColor = "#ff00ff";

    ctx.fillRect(
        ai.x,
        ai.y,
        ai.width,
        ai.height
    );

    // BALL TRAIL
    for (let i = 0; i < ballTrail.length; i++) {

        const trail = ballTrail[i];

        const alpha = i / ballTrail.length;

        ctx.fillStyle =
            `rgba(255,255,255,${alpha * 0.35})`;

        ctx.beginPath();

        ctx.arc(
            trail.x,
            trail.y,
            ball.radius * alpha,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // BALL
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ffffff";

    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    // GAME OVER
    if (gameOver) {

        ctx.fillStyle = "#ffff00";
        ctx.font = "30px 'Press Start 2P'";

        ctx.fillText(winner, 170, 220);

        ctx.fillStyle = "#ffffff";
        ctx.font = "14px 'Press Start 2P'";

        ctx.fillText(
            "PRESS SPACE TO RESTART",
            90,
            300
        );
    }

    ctx.restore();
}

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();