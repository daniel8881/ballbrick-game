//Todo
//ball is bigger than paddle's height

// Initialize canvas and required variables

canvas = document.getElementById("canvas"),
ctx = canvas.getContext("2d"), // Create canvas context
W = window.innerWidth, // Window's width
H = window.innerHeight; // Window's height

// sound effect
var hitpaddle = new Howl({
    urls: ['hitpaddle.wav']
}),
bgm = new Howl({
    urls: ['bpm.wav']
}),
hitbricks = new Howl({
   urls: ['hitbricks.wav']
}),
gameover = new Howl({
    urls: ['gameover.wav']
}),
gamestart = new Howl({
    urls: ['gamestart.ogg']
}),
win = new Howl({
    urls: ['win.wav']
});



// Set the canvas's height and width to full screen
canvas.width = W;
canvas.height = H;
var gutter = 50;
var paddle_x = canvas.width / 2 - 50,
    paddle_y = canvas.height - gutter,
    startBtn,
    restartBtn;

// Paint canvas
var paintCanvas = function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);
};

startBtn = {
    w: 200,
    h: 50,
    x: W / 2 - 100,
    y: H / 2 - 25,

    draw: function() {
        ctx.strokeStyle = "white";
        ctx.lineWidth = "2";
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.font = "18px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.fillText("Click to Start", W / 2, H / 2);
    }
};

restartBtn = {
    w: 100,
    h: 50,
    x: W / 2 - 50,
    y: H / 2 - 50,

    draw: function() {
        ctx.strokeStyle = "white";
        ctx.lineWidth = "2";
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.font = "18px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStlye = "white";
        ctx.fillText("Restart", W / 2, H / 2 - 25);
    }
};

// Ball

var ball = {
    size: 10,
    x: canvas.width / 2,
    y: 500, //canvas.height / 2 + 50,
    color: "#fff",
    speedX: -10,
    speedY: -6,
    reset: function() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
    },
    render: function() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
        ctx.fill();
    }
};

// Paddle

var paddle = {
    width: 150,
    height: 15,
    speed: 15,
    render: function() {
        ctx.fillStyle = "white";
        ctx.fillRect(paddle_x, paddle_y, this.width, this.height);
    }
};

// Brick
var brick_w = 100,
    brick_h = 25,
    bricks = new Array(brick_col),
    brick_gap = 5,
    brick_row = 9,
    brick_col = 12,
    brickLeft = 0;


var drawBrick = function() {
    for (var l = 0; l < brick_row; l++) {
        for (var i = 0; i < brick_col; i++) {

            //var arrayIndex = brick_col * l + i;
            var arrayIndex = calBrickIndex(i, l);

            if (bricks[arrayIndex]) {
                ctx.fillStlye = "#fff";
                ctx.fillRect(brick_w * i, brick_h * l, brick_w - brick_gap, brick_h - brick_gap);
            }
        }
    }

};

function brickReset() {
    brickLeft = 0;

    //set the first 3 column of bricks empty
    for (var l = 0; l < brick_col * 3; l++) {
        bricks[l] = false;
    }

    for (var i = 3 * brick_col; i < brick_col * brick_row; i++) {
        bricks[i] = true;
        brickLeft++;
        //Math.random() > 0.5 ? bricks[i] = true : bricks[i] = false;        
    }


}

function calBrickIndex(col, row) {
    return brick_col * row + col;
}

//render

var render = function() {
    paintCanvas();
    ball.render();
    paddle.render();
    drawBrick();

    //for debug use
    //var mouseBrickX = Math.floor(mouseX / brick_w),
    //   mouseBrickY = Math.floor(mouseY / brick_h),
    //    indexOfBrickMouse = calBrickIndex(mouseBrickX, mouseBrickY);

    //for debug use
    //colorText(mouseBrickX + ",," + mouseBrickY + ":" + indexOfBrickMouse, mouseX, mouseY, 'red');

};

var reset = function() {
    isGameStarted = false;
    ball.reset();
    //cancelAnimationFrame(init);    
    //	restartBtn.draw();
};




// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, true);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, true);

//update

function ballMovement() {
    if (isGameStarted) {
        ball.x += ball.speedX;
        ball.y += ball.speedY;
    }

    //dealing ball left and right bounce
    if (ball.x < 0 && ball.speedX < 0.0 ) {
        ball.speedX *= -1;
    }

    if(ball.x > canvas.width && ball.speedX > 0.0){
        ball.speedX *= -1;
    }

    //when ballover the bottom
    if (ball.y > canvas.height) {
        gameover.play();
        reset();
    }


    //ball reach to top
    if (ball.y < 0) {
        ball.speedY *= -1;
    }
}

function handleBrickCollision() {
    //when ball hit the brick, brick vanish
    var ballBrickX = Math.floor(ball.x / brick_w),
        ballBrickY = Math.floor(ball.y / brick_h),
        //use x-axis, y-axis to define which brick
        indexOfBrick = calBrickIndex(ballBrickX, ballBrickY);

    // fix edge issue, when ball < 0, destrict ball position in bricks
    if (ballBrickX >= 0 && ballBrickX < brick_col && ballBrickY >= 0 && ballBrickY < brick_row) {

        //if there's a brick
        if (bricks[indexOfBrick]) {

            //brick disappear
            bricks[indexOfBrick] = false;
            brickLeft--;
            hitbricks.play();


            var prevBallX = ball.x - ball.speedX,
                prevBallY = ball.y - ball.speedY,
                prevBrickCol = Math.floor(prevBallX / brick_w),
                prevBrickRow = Math.floor(prevBallY / brick_h);

            //if bounce the left, right side, then change x value
            if (prevBrickCol != ballBrickX) {

                //var adjBrick = calBrickIndex(col, row)               

                ball.speedX *= -1;

            }

            //if bounce the top, bottom side, then change y value
            if (prevBrickRow != ballBrickY) {
                ball.speedY *= -1;

            }
            //if both test above are true, then ball will bounce both x,y side
        }
    }
}

function paddleCollision() {
    var paddleLeftX = paddle_x,
        paddleRightX = paddleLeftX + paddle.width,
        paddleTopY = paddle_y,
        paddleBottomY = paddle_y + paddle.height;

    if (ball.y > paddleTopY && ball.y < paddleBottomY && ball.x > paddleLeftX && ball.x < paddleRightX) {

        ball.speedY *= -1;
        hitpaddle.play();

        var paddleCenter = paddle_x + paddle.width / 2,
            distance = ball.x - paddleCenter;

        ball.speedX = distance * 0.2;

        if (brickLeft === 0) {
            win.play();
            brickReset();
        }
    }


}

function paddleControl() {
    //handle paddle move
    if (32 in keysDown) { // Start the game with the spacebar
        isGameStarted = true;
    }

    if (37 in keysDown && paddle_x > 0) { // left arrow

        paddle_x -= paddle.speed;
    }
    if (39 in keysDown && paddle_x < canvas.width - paddle.width) { //right arrow
        paddle_x += paddle.speed;
    }
}

var update = function(dt) {

    ballMovement();
    handleBrickCollision();
    paddleCollision();
    paddleControl();
};


var mouseX = 0,
    mouseY = 0;

// mouse 
function calculateMouse(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;

    /*
    //for debug use
    ball.x = mouseX;
    ball.y = mouseY;
    ball.speedX = 6;
    ball.speedY = -4;
    //paddle_x = mouseX - paddle.width / 2;
    */
}


//event listener
canvas.addEventListener('mousemove', calculateMouse);
canvas.addEventListener("mousedown", clickBtn, true);



//for debug use

function colorText(words, x, y, color) {

    ctx.fillStyle = color;
    ctx.fillText(words, x, y);
}

var main = function() {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;

    // Request to do this again ASAP
    init = requestAnimationFrame(main);
};


function startScreen() {
    render();
    startBtn.draw();
    bgm.play();
}

function clickBtn(e) {
    var mx = e.pageX,
        my = e.pageY;

    if (mx >= startBtn.x && mx <= startBtn.x + startBtn.w) {
        isGameStarted = true;
        bgm.fadeOut();
        gamestart.play();
        main();

        // Delete the start button after clicking it
        startBtn = {};
    }

    /*
    if (isGameStarted === false) {
        if (mx >= restartBtn.x && mx <= restartBtn.x + restartBtn.w) {
            isGameStarted = true;
            main();
        }
    }
    */
}

brickReset();
isGameStarted = false;
var then = Date.now();
startScreen();