var colors = ['red','orange','yellow','green','blue','indigo','purple'];
var WIDTH = 750;
var HEIGHT = 500;
var left = right = up = down = false;
var RADIUS = 5;
var t = 0;
var balls = [];
var gameover = true;
var player, gameover, power, hiscore, howto;
var score, level, mark, count, ouch, pause;
var stage, player;

function init() {
    //Create a stage by getting a reference to the canvas
    stage = new createjs.Stage("gameCanvas");
    //Create a Shape DisplayObject.
    player = new createjs.Shape();
    player.radius = RADIUS;
    player.graphics.beginFill("gray").drawCircle(0, 0, player.radius);
    //Set position of Shape instance.
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
    player.velx = player.vely = 0;
    player.accel = .5
    //Add Shape instance to stage display list.
    stage.addChild(player);

    setInterval(timer, 500);
    setInterval(draw, 10);
};

function draw() {
    for (var i=0; i<balls.length; i++) {
        var b = balls[i];
        b.x += b.vel;
        stage.update();
        if (b.x > WIDTH + b.rad || b.x < -WIDTH- b.rad) {
            console.log(b.x);
            stage.removeChild(b);
            balls.remove(b);
        }
    }

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

    stage.update();
}

function timer() {
    t += 1;

    var b = new createjs.Shape();
    b.x = [0,WIDTH].choose();
    b.y = Math.random() * HEIGHT;
    b.rad = player.radius * Math.random() * 3;
    b.graphics.beginFill(colors.choose()).drawCircle(b.x, b.y, b.rad);
    if (b.x == 0) {
        b.vel = Math.random() * 3 + 2;
    } else {
        b.vel = Math.random() * -3 - 2;
    }
    balls.push(b);
    stage.addChild(b);

    if (ouch) {
        ouch = false;
    }

    stage.update();
}
  
function dist(p,q) {
    return Math.sqrt(Math.pow((p[0]-q[0]),2) + Math.pow((p[1]-q[1]),2));
};

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