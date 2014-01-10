var colors = ['red','orange','yellow','green','blue','indigo','purple'];
var WIDTH = 750;
var HEIGHT = 500;
var left = right = up = down = false;
var pause = false;
var RADIUS = 10;
var balls = [];
var lives = [];
var gameover = false;
var ouch = false;
var player, hiscore, howto;
var levelText, fullness, current, goal, scoreText;
var timerT, drawT, smallT, powerT;
var powerTime, powerBar;

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
    player.accel = .5;
    player.eye = new createjs.Shape();
    player.eye.graphics.beginFill('black').drawCircle(0, 0, player.rad / 5);
    player.faceRight = 1;
    player.eye.x = player.x + player.rad * 2 / 3;
    player.eye.y = player.y;
    player.invincible = player.ice = player.show = player.molasses = false;
    player.hasPower = false;

    player.smallify = function() {
        player.rad -= .1;
        resetPlayer();
        if(player.rad <= RADIUS) {
            player.rad = RADIUS;
            clearInterval(smallT);
            timerT = setInterval(timer, 500);
        }
    }

    player.update = function() {
        var a = player.accel;
        if (left) {
            player.velx -= a;
            player.faceRight = -1;
        }
        if (up) {
            player.vely -= a;
        }
        if (right) {
            player.velx += a;
            player.faceRight = 1;
        }
        if (down) {
            player.vely += a;
        }
        player.x += player.velx;
        player.y += player.vely;
        player.x = player.x.mod(WIDTH);
        player.y = player.y.mod(HEIGHT);
        player.eye.x = player.x + player.faceRight * player.rad * 2 / 3;
        player.eye.y = player.y;
        player.velx *= .9;
        player.vely *= .9;
    }

    //Add Shape instance to stage display list.
    stage.addChild(player);
    stage.addChild(player.eye);

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
    stage.addChildAt(rect,0);
    fullness = new createjs.Shape();
    fullness.x = 10;
    fullness.y = HEIGHT - 30;
    fullness.w = 0;
    fullness.graphics.beginStroke('black').beginFill('red').rect(0, 0, 0, 20);
    stage.addChildAt(fullness,0);

    powerBar = new createjs.Shape();
    powerBar.x = WIDTH - 200;
    powerBar.y = HEIGHT - 30;
    powerBar.graphics.beginStroke('black').beginFill('green').rect(0, 0, 0, 20);

    timerT = setInterval(timer, 500);
    drawT = setInterval(draw, 10);
    powerT = setInterval(spawnPowerUp, 6000);
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
        if (power.on) {
            power.update();
        }

        var rad = player.rad;
        if (rad >= goal) {
            levelUp();
        }
        if (rad >= RADIUS) {
            fullness.w = WIDTH / 3 * (rad - RADIUS) / (goal - RADIUS);
            fullness.graphics.clear().beginStroke('black').beginFill('red').rect(0,0, fullness.w, 20);
        }
        
        if (player.show) {
            for (var i = 0; i < balls.length; i++) {
                var temp = balls[i];
                var color;
                if (temp.rad < player.rad) {
                    color = 'green';
                } else {
                    color = 'red'
                }
                temp.graphics.clear().beginStroke('black').beginFill(color).drawCircle(0,0,temp.rad);
            }
        }
        if (player.invincible) {
            player.graphics.clear().beginStroke('black').beginFill('gold').drawCircle(0,0,player.rad);
        }
        if (player.show || player.invincible || player.molasses || player.ice) {
            powerBar.graphics.clear().beginStroke('black').beginFill('green').rect(0,0,powerTime / 600 * 100, 20);
            powerTime -= 1;
        }
    }
    stage.update();
}

function levelUp() {
    goal = levelText.text * 5 + 15;
    if (!player.hasPower) {
        stage.removeChild(power);
        power = new PowerUp();
    }
    levelText.text += 1;
    while (balls.length > 0) {
        stage.removeChild(balls.pop());
    }
    stage.update();
    clearInterval(timerT);
    smallT = setInterval(player.smallify, 10);
}

function resetPlayer() {
    player.graphics.clear().beginStroke('black').beginFill('white').drawCircle(0,0,player.rad);
    player.eye.graphics.clear().beginFill('black').drawCircle(0,0,player.rad / 5);
    stage.update();
}

function timer() {
    if (balls.length < 50) {
        var b = new createjs.Shape();
        b.x = [0,WIDTH].choose();
        b.y = Math.random() * HEIGHT;
        b.rad = player.rad * Math.random() * (levelText.text / 2. + 1);
        b.col = colors.choose();
        b.graphics.beginStroke('black').beginFill(b.col).drawCircle(0, 0, b.rad);
        if (b.x == 0) {
            b.vel = Math.random() * 5;
        } else {
            b.vel = Math.random() * -5;
        }
        b.update = updateBall;
        balls.push(b);
        stage.addChildAt(b,stage.getChildIndex(player));
    }
    stage.update();
}

var Power = function(image, dims, lifetime, effect) {
    this.image = image;
    this.dims = dims;
    this.lifetime = lifetime;
}
// life0, invinc1, death2, shrink3, freeze4, reveal5, slow6
// ADD INFO
var powers = [new Power(), new Power(), new Power(), new Power(), new Power(), new Power(), new Power()]
powers[0].activate = function() {
    var temp = new createjs.Shape();
    temp.graphics.beginFill(colors[lives.length % colors.length]).drawCircle(0,0,3);
    temp.x = (lives.length+1) * 7 + 45;
    temp.y = 20;
    lives.push(temp);
    stage.addChild(temp);
}
powers[1].activate = function() {
    player.invincible = true;
}
powers[2].activate = function() {
    while (balls.length > 0) {
        stage.removeChild(balls.pop());
    }
}
powers[3].activate = function() {
    for (var i = 0; i < balls.length; i++) {
        var b = balls[i]
        b.rad /= 2;
        b.graphics.clear().beginStroke('black').beginFill(b.col).drawCircle(0,0,b.rad);
    }
}
powers[4].activate = function() {
    player.ice = true;
    clearInterval(timerT);
}
powers[5].activate = function() {
    player.show = true;
}
powers[6].activate = function() {
    player.molasses = true;
}

var PowerUp = function() {
    this.side = 20;
    this.on = false;
    var temp = Math.random() * 100;
    // life0, invinc1, death2, shrink3, freeze4, reveal5, slow6
    if (temp < 2) { // 2
        this.power = powers[0];
    } else if (temp < 0) { // 7
        this.power = powers[1];
    } else if (temp < 0) { // 20
        this.power = powers[2];
    } else if (temp < 0) { // 40
        this.power = powers[3];
    } else if (temp < 100) { // 60
        this.power = powers[4];
    } else if (temp < 80) { // 80
        this.power = powers[5];
    } else { // 100
        this.power = powers[6];
    }
    this.x = Math.random() * (WIDTH - this.side);
    this.y = Math.random() * (HEIGHT - this.side);
    this.age = 0;
    this.update = function() {
        if (dist([this.x,this.y],[player.x,player.y]) < player.rad + this.side) {
            this.side = 50;
            this.on = false;
            this.x = WIDTH / 2 - this.side / 2;
            this.y = HEIGHT - 60;
            this.graphics.clear().beginStroke('black').beginFill('white').rect(0,0,this.side,this.side);
            player.power = this;
            player.hasPower = true;
            clearInterval(powerT);
            powerTime = 555;
        }
        this.age += 1;
        if (this.age == 400) {
            stage.removeChild(this);
            power = new PowerUp();
        }
    }
    this.activate = this.power.activate;
}
PowerUp.prototype = new createjs.Shape();
var power = new PowerUp();

function spawnPowerUp() {
    power = new PowerUp();
    if (Math.random() < 1) {
        power.on = true;
        power.graphics.clear().beginStroke('black').beginFill('white').rect(0,0,power.side,power.side);        
        stage.addChildAt(power, stage.getChildIndex(fullness));
    }
}
  
function dist(p,q) {
    var a = Math.sqrt(Math.pow((p[0]-q[0]),2) + Math.pow((p[1]-q[1]),2));
    return a;
}

function updateBall() {
    // updates movement
    var vel = this.vel;
    if (player.molasses) {
        vel /= 3;
    }
    if (player.ice) {
        vel = 0;
    }
    this.x += vel;
    if (this.x > WIDTH + this.rad || this.x < -this.rad) {
        stage.removeChild(this);
        balls.remove(this);
    }

    // checks for collision
    if (dist([this.x, this.y], [player.x, player.y]) < this.rad + player.rad) {
        if (!player.invincible && this.rad >= player.rad) {
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