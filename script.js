let c, cc;
let width, height;

const K = 9;
const G = 4;

let g;

let frame;
let gameState;

let camY;

let circle;
let orb;

function setup() {
  c = document.getElementById("gc");

  c.height = height = window.innerHeight;
  c.width = width = window.innerWidth;
  camY = height/2;

  gameState = WAITING_TO_START;

  cc = c.getContext("2d");

  g = 0;

  circle = new Circle(new Vector(width/2, height/4), 100, 16, 0.01 * Math.PI);
  orb = new Orb(new Vector(width/2, height*3/4), 10, orbColors.random());
}


function background() {
  cc.fillStyle = bgColors.dark;
  cc.fillRect(0, 0, width, height);
}

class Quadrant {
  constructor(pos, r, dr, theta, col) {
    this.pos = pos;
    this.r = r;
    this.dr = dr;
    this.theta = theta;
    this.col = col;
  }

  draw() {
    cc.beginPath();

    cc.arc(this.pos.x, this.pos.y, this.r + this.dr/2, this.theta, this.theta + Math.PI/2, false);
    cc.arc(this.pos.x, this.pos.y, this.r - this.dr/2, this.theta + Math.PI/2, this.theta, true);

    cc.closePath();

    cc.fillStyle = this.col;
    cc.fill();
  }

  rotate(phi) {
    this.theta = (this.theta + phi) % (2*Math.PI);
  }
}

class Circle {
  constructor(pos, r, dr, omega) {
    this.pos = pos;
    this.r = r;
    this.dr = dr;
    this.omega = omega;

    let cols = Object.values(quadColors).sort(() => (Math.random() > .5) ? 1 : -1);
    this.quads = cols.map((col,i) => new Quadrant(pos, r, dr, i*Math.PI/2, col));
  }

  draw() {
    this.quads.forEach(quad => quad.draw());
  }

  rotate() {
    this.quads.forEach(quad => quad.rotate(this.omega));
  }

  update() {
    this.rotate();
  }

  collide(orb) {
    let r = orb.pos.sub(this.pos);
    let ang = r.angle();
    let diff = r.mag() - this.r + this.dr/2;
    if (diff >= 0 && diff <= this.dr) {
      for(let quad of this.quads) {
        if (quad.theta <= ang && quad.theta + Math.PI/2 > ang) {
          if (orb.col != quad.col) return true;
          return false;
        }
      }
    }
  }
}

class Orb {
  constructor(pos, r, col) {
    this.pos = pos;
    this.r = r;
    this.col = col;

    this.acc = new Vector(0,0);
    this.vel = new Vector(0,0);
  }

  draw() {
    cc.fillStyle = this.col;
    cc.beginPath();
    cc.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
    cc.fill();
  }

  gravity() {
    this.applyForce(new Vector(0, g*0.1));
  }

  camUpdate() {
    if (this.pos.y < camY) camY = this.pos.y;
  }

  update() {
    this.gravity();

    this.vel.incBy(this.acc);
    this.pos.incBy(this.vel);
    this.acc.null();

    this.camUpdate();
  }

  applyImpulse(a) {
    this.vel.set(a);
  }

  applyForce(a) {
    this.acc.incBy(a);
  }
}

function update() {
  circle.update();
  orb.update();
  if (circle.collide(orb)) {
    gameOver();
    return;
  }

  draw();

  frame = requestAnimationFrame(update);
}

function draw() {
  background();

  cc.save();
  cc.translate(0, height/2-camY);
  circle.draw();
  orb.draw();
  cc.restore();
}

function keyDown(evt) {
  if (evt.repeat) return;
  if (evt.keyCode == 32) { 
    switch(gameState) {
      case WAITING_TO_START:
        gameState = RUNNING;
        g = G;
        orb.applyImpulse(new Vector(0, -K));
        break;
      case RUNNING:
        orb.applyImpulse(new Vector(0, -K));
        break;
      case WAITING_TO_RESTART:
        init();
        break;
    }
  }
    
}

function mouseDown(evt) {
  switch(gameState) {
    case WAITING_TO_START:
      gameState = RUNNING;
      g = G;
      orb.applyImpulse(new Vector(0, -K));
      break;
    case RUNNING:
      orb.applyImpulse(new Vector(0, -K));
      break;
    case WAITING_TO_RESTART:
      init();
      break;
  }
}


function stop() {
  cancelAnimationFrame(frame);
}

function gameOver() {
  stop();
  draw();

  (new Promise(a => setTimeout(a, 1000))).then((a) => {
    gameState = WAITING_TO_RESTART;
  });

}

function initListeners() {
  window.addEventListener("resize", () => {stop(); init();});
  document.addEventListener("keydown", keyDown);
  document.addEventListener("mousedown", mouseDown);
}

function init() {
  setup();
  frame = requestAnimationFrame(update);
}

window.onload = function() {
  initListeners();
  init();
}

