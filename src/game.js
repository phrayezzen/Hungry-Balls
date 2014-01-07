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
var player, gameover, power, hiscore, howto;
var score, level, mark, count, ouch, pause;

function init() {
    //Create a stage by getting a reference to the canvas
    stage = new createjs.Stage("gameCanvas");
    //Create a Shape DisplayObject.
    player = new createjs.Shape();
    player.rad = RADIUS;
    player.graphics.beginFill("gray").drawCircle(0, 0, player.rad);
    //Set position of Shape instance.
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
    player.velx = player.vely = 0;
    player.accel = .5
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

    for(var i=0; i<7; i++) {
        var temp = new createjs.Shape();
        temp.graphics.beginFill(colors[i]).drawCircle(0,0,3);
        temp.x = (i+1) * 7;
        temp.y = 10;
        lives.push(temp);
        stage.addChild(temp);
    }

    setInterval(timer, 500);
    setInterval(draw, 10);
};

function draw() {
    for (var i=0; i<balls.length; i++) {
        balls[i].update();
    }

    console.log(lives);
    if (ouch) {
        ouch = false;
        player.endFill();
        player.beginFill('red');
        setTimeout(resetColor, 100);
    }

    player.update();
    stage.update();
}

function resetColor() {
    player.endFill();
    player.beginFill("gray");
    stage.update();
}

function timer() {
    t += 1;

    if (balls.length < 20) {
        var b = new createjs.Shape();
        b.x = [0,WIDTH].choose();
        b.y = Math.random() * HEIGHT;
        b.rad = player.rad * Math.random() * 2;
        b.graphics.beginFill(colors.choose()).drawCircle(0, 0, b.rad);
        if (b.x == 0) {
            b.vel = Math.random() * 3 + 2;
        } else {
            b.vel = Math.random() * -3 - 2;
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
            var temp = lives.pop();
            stage.removeChild(temp);
            ouch = true;
        } else {
            player.rad += this.rad / 10;
            player.graphics.drawCircle(0,0,player.rad);
            score += this.rad;
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