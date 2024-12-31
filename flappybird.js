//board
let board;
let boardWidth = 320;
let boardHeight = 640;
let context;

//bird 
let birdWidth = 32;
let birdHeight = 24;
let birdX = boardWidth / 8; //set bird to the left of the board 360/8 = 45
let birdY = boardHeight / 2; //set bird to the middle of the board 640/2 = 320
// let birdImg;
let birdImgs = [];
let birdImgsIndex = 0;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

let gameOver = false;
let score = 0;

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2;//pipes moves to the left
let velocityY = 0;//bird jump
let gravity = 0.4;

//sounds
let windSoung = new Audio("./sound/sfx_wing.wav");
let hitSound = new Audio("./sound/sfx_hit.wav");
let scoreSound = new Audio("./sound/sfx_point.wav");
let bgm = new Audio("./sound/bgm_mario.mp3");
bgm.loop = true;


window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    //draw bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load bird image
    // birdImg = new Image();
    // birdImg.src = "images/flappybird.png";
    // birdImg.onload = function () {
    //     context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    // }

    for (let i = 0; i < 4; i++) {
        let birdImg = new Image();
        birdImg.src = `images/flappybird${i}.png`;
        birdImgs.push(birdImg);
    }

    //load top pipe image
    topPipeImg = new Image();
    topPipeImg.src = "images/toppipe.png";

    //load bottom pipe image
    bottomPipeImg = new Image();
    bottomPipeImg.src = "images/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipe, 1500); //evry 1.5 seconds
    setInterval(animateBird, 100); //evry 0.1 seconds
    document.addEventListener("keydown", moveBird);
    bgm.play();
}

function update() {
    if (gameOver) {
        return;
    }

    requestAnimationFrame(update);
    context.clearRect(0, 0, boardWidth, boardHeight);

    //bird
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to current bird y,limt the bird y. to top of canvas
    velocityY += gravity;
    // context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    context.drawImage(birdImgs[birdImgsIndex], bird.x, bird.y, bird.width, bird.height);    


    if (bird.y >= boardHeight) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            scoreSound.play();
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            hitSound.play();
            gameOver = true;
        }
    }

    // //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
        bgm.pause();
        bgm.currentTime = 0;
    }
}

function animateBird() {
    birdImgsIndex++; //increment birdImgIndex
    birdImgsIndex %= birdImgs.length; //reset birdImgIndex to 0 if it is greater than or equal to birdImgs.length   
}

function placePipe() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2
    //0 -> 123 (pipeHeight/4)
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyW") {
        if (bgm.paused) {
            bgm.play();
        }
        //wind soung
        windSoung.play();
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            velocityY = 0;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}