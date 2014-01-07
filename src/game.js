var colors = ['red','orange','yellow','green','blue','indigo','purple'];
var WIDTH = 750;
var HEIGHT = 500;
var left = right = up = down = false;
var pause = false;
var RADIUS = 10;
var t = 0;
var balls = [];
var lives = [];
var gameover = false;
var ouch = false;
var player, power, hiscore, howto;
var levelText, fullness, current, goal, scoreText;
var timerT, drawT;

function init() {
    //Create a stage by getting a reference to the canvas
    stage = new createjs.Stage("gameCanvas");
    //Create a Shape DisplayObject.
    player = new createjs.Shape();
    player.rad = RADIUS;
    player.graphics.beginStroke('black').beginFill("white").drawCircle(0, 0, player.rad);
    //Set position of Shape instance.
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
    player.velx = player.vely = 0;
    player.accel = .5

    player.smallify = function() {
        player.rad -= 1;
    }

    player.update = function() {
        var a = player.accel;
        if (left) {
            player.velx -= a;
        }
        if (up) {
            player.vely -= a;
        }
        if (right) {
            player.velx += a;
        }
        if (down) {
            player.vely += a;
        }
        player.x += player.velx;
        player.y += player.vely;
        player.x = player.x.mod(WIDTH);
        player.y = player.y.mod(HEIGHT);
        player.velx *= .9;
        player.vely *= .9;
    }

    //Add Shape instance to stage display list.
    stage.addChild(player);

    var lifeText = new createjs.Text("Lives:", "15px Arial", "grey");;
    lifeText.x = 5;
    lifeText.y = 10;
    stage.addChild(lifeText);
    for(var i=0; i<7; i++) {
        var temp = new createjs.Shape();
        temp.graphics.beginFill(colors[i]).drawCircle(0,0,3);
        temp.x = (i+1) * 7 + 45;
        temp.y = 20;
        lives.push(temp);
        stage.addChild(temp);
    }

    scoreText = new createjs.Text("Score: " + 0, "15px Arial", "grey"); 
    scoreText.x = WIDTH - 100;
    scoreText.y = 10;
    scoreText.score = 0;
    stage.addChild(scoreText);

    goal = 15;
    levelText = new createjs.Text(1, "30px Arial", "grey");
    levelText.x = WIDTH / 2;
    levelText.y = 10;
    stage.addChild(levelText);

    var rect = new createjs.Shape();
    rect.graphics.beginStroke('black').rect(10, HEIGHT - 30, WIDTH / 3, 20);
    stage.addChild(rect);
    fullness = new createjs.Shape();
    fullness.x = 10;
    fullness.y = HEIGHT - 30;
    fullness.w = 0;
    fullness.graphics.beginStroke('black').beginFill('red').rect(0, 0, 0, 20);
    stage.addChild(fullness);

    timerT = setInterval(function(){timer()}, 500);
    drawT = setInterval(draw, 10);
};

function draw() {

    if (gameover) {

        init();

    } else {

        if (lives <= 0) {
            clearInterval(drawT);
            clearInterval(timerT);
            init();
        }

        for (var i=0; i<balls.length; i++) {
            balls[i].update();
        }

        if (ouch) {
            ouch = false;
            player.graphics.clear().beginStroke('black').beginFill('red').drawCircle(0,0,player.rad);
            setTimeout(resetPlayer, 200);
        }

        player.update();

        var rad = player.rad;
        if (rad >= goal) {
            levelUp();
        }
        if (rad >= RADIUS) {
            fullness.w = WIDTH / 3 * (rad - RADIUS) / (goal - RADIUS);
            fullness.graphics.clear().beginStroke('black').beginFill('red').rect(0,0, fullness.w, 20);
        }

    }
    stage.update();
}

function levelUp() {
    goal = levelText.text * 5 + 15;
    levelText.text += 1;
    while (balls.length > 0) {
        stage.removeChild(balls.pop());
    }
    player.rad = 10;
    resetPlayer();
    // clearInterval(timerT);
    // var smallT = setInterval(player.smallify(), 10);
    // while (player.rad > RADIUS) {};
    // clearInterval(smallT);
    // timerT = setinterval(timer, 500);
}

function resetPlayer() {
    player.graphics.clear().beginStroke('black').beginFill('white').drawCircle(0,0,player.rad);
    stage.update();
}

function timer() {
    t += 1;

    if (balls.length < 20) {
        var b = new createjs.Shape();
        b.x = [0,WIDTH].choose();
        b.y = Math.random() * HEIGHT;
        b.rad = player.rad * Math.random() * (levelText.text / 2. + 1);
        b.graphics.beginFill(colors.choose()).drawCircle(0, 0, b.rad);
        if (b.x == 0) {
            b.vel = Math.random() * 5;
        } else {
            b.vel = Math.random() * -5;
        }
        b.update = updateBall;
        balls.push(b);
        stage.addChild(b);
    }

    stage.update();
}
  
function dist(p,q) {
    var a = Math.sqrt(Math.pow((p[0]-q[0]),2) + Math.pow((p[1]-q[1]),2));
    return a;
};

function updateBall() {
    // updates movement
    this.x += this.vel;
    if (this.x > WIDTH + this.rad || this.x < -this.rad) {
        stage.removeChild(this);
        balls.remove(this);
    }

    // checks for collision
    if (dist([this.x, this.y], [player.x, player.y]) < this.rad + player.rad) {
        if (this.rad > player.rad) {
            stage.removeChild(lives.pop());
            ouch = true;
        } else {
            player.rad += this.rad / 10;
            resetPlayer();
            scoreText.score += this.rad;
            scoreText.text = "Score: " + Math.round(scoreText.score); 
        }
        balls.remove(this);
        stage.removeChild(this);        
    }
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Array.prototype.choose = function() {
    return this[Math.floor(Math.random() * this.length)]
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}