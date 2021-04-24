let c, cc;
let width = 400, height = 400;

let circle;

function setup() {
  c = document.getElementById("gc");

  let resize = () => {
    c.height = height = window.innerHeight;
    c.width = width = window.innerWidth;
  };

  resize();

  window.addEventListener("resize", resize);
  document.addEventListener("keydown", keyDown);

  cc = c.getContext("2d");

  circle = new Circle(new Vector(width/2, height/2), 50, 8, 0.01 * Math.PI);
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

    cc.closePath()

    cc.fillStyle = this.col;
    cc.fill();
  }

  rotate(phi) {
    this.theta += phi;
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
}

function draw() {
  background();

  circle.update();
  circle.draw();

  requestAnimationFrame(draw);
}

function keyDown(evt) {
  if (evt.keyCode == 32) ;
}



window.onload = function() {
  setup();
  requestAnimationFrame(draw);
}

