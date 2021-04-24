let c, cc;
let width = 400, height = 400;

const K = 12;
const G = 4;

let camY;

let circle;
let orb;

let spacebarDown = false;

function setup() {
  c = document.getElementById("gc");

  let resize = () => {
    c.height = height = window.innerHeight;
    c.width = width = window.innerWidth;
    camY = height/2;
  };

  resize();

  window.addEventListener("resize", resize);
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  cc = c.getContext("2d");

  circle = new Circle(new Vector(width/2, height/4), 100, 16, 0.01 * Math.PI);
  orb = new Orb(new Vector(width/2, height*3/4), 10, orbColors.random());
  console.log(orb);
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
          if (orb.col != quad.col) orb.col = orbColors.white;
          break;
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
    this.applyForce(new Vector(0, G*0.1));
  }

  controls() {
    if (spacebarDown) this.applyImpulse(new Vector(0, -K*0.5));
  }

  camUpdate() {
    if (this.pos.y < camY) camY = this.pos.y;
  }

  update() {
    this.controls();
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

function draw() {
  background();

  circle.update();
  orb.update();
  circle.collide(orb);

  cc.save();
  cc.translate(0, height/2-camY);
  circle.draw();
  orb.draw();
  cc.restore();

  requestAnimationFrame(draw);
}

function keyDown(evt) {
  if (evt.keyCode == 32) spacebarDown = true;
}

function keyUp(evt) {
  if(evt.keyCode == 32) spacebarDown = false;
}



window.onload = function() {
  setup();
  requestAnimationFrame(draw);
}

