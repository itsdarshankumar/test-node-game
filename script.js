let c, cc;
let width, height;

const K = 9;
const G = 4;

let g;

let frame;
let gameState;

let camY;

let orb;
let circleManager;

let score;

let notFirstTime = false;
let allTimeBest;

function setup() {
  c = document.getElementById("gc");

  c.height = height = window.innerHeight;
  c.width = width = window.innerWidth;
  camY = height/2;

  gameState = WAITING_TO_START;
  score = 0;

  if (sessionStorage.getItem("notFirstTime")) notFirstTime = true;
  else sessionStorage.setItem("notFirstTime", true);

  if (localStorage.getItem("allTimeBest")) allTimeBest = Number.parseInt(localStorage.getItem("allTimeBest"));
  else allTimeBest = 0;

  cc = c.getContext("2d");

  g = 0;

  circleManager = new CircleManager(new Circle(new Vector(width/2, height/4), 100, 16, 0.01 * Math.PI));
  orb = new Orb(new Vector(width/2, height*3/4), 10, orbColors.random());
}


function background(col) {
  cc.fillStyle = col;
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

    let cols = [...quadColors].sort(() => (Math.random() > .5) ? 1 : -1);
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
          if (orb.col != quad.col) return FATAL_COLLISION;
          return ORDINARY_COLLISION;
        }
      }
    }
    return NO_COLLISION;
  }
}

class Checkpoint {
  static draw(y, r, col) {
    cc.fillStyle = col;
    cc.beginPath();
    cc.arc(width/2, y, r, 0, 2*Math.PI);
    cc.fill();
  }
}

class CircleManager {
  constructor(initCircle) {
    this.circles = [initCircle];
    this.checkpoints = [];

    this.next = initCircle;
    this.makeNext();
  }

  shouldPurge() {
    let circle = this.circles[0];
    let bottom = circle.pos.y - circle.r - circle.dr/2;
    return bottom > camY + height/2;

  }

  shouldSpawn() {
    let circle = this.next;
    let top = circle.pos.y + circle.r + circle.dr/2;
    return top > camY - height/2;
  }

  makeNext() {
    let curr = this.next;
    let distConsc = height*3/4;
    this.next = new Circle(curr.pos.add(new Vector(0, -distConsc)), curr.r, curr.dr, curr.omega);
    this.checkpoints.push(curr.pos.y - distConsc/2);
  }

  update() {
    if (this.shouldPurge()) this.circles.shift();
    if (this.shouldSpawn()) {
      this.circles.push(this.next);
      this.makeNext();
    }

    this.circles.forEach(circle => circle.update());

  }

  draw() {
    this.circles.forEach(circle => circle.draw());
    this.checkpoints.forEach(
      checkpoint => Checkpoint.draw(checkpoint, 10, checkpointColor)
    );
  }

  handleCheckpoints(orb) {
    if (orb.pos.y <= this.checkpoints[0]) {
      score += 1;
      orb.randomizeCol();
      this.checkpoints.shift();
    }
  }

  checkCollision(orb) {
    for(let circle of this.circles) {
      let collision = circle.collide(orb);;
      if (collision == FATAL_COLLISION) {
        gameState = GAME_OVER;
        return;
      }
      else if (collision == ORDINARY_COLLISION) {
        break;
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

  checkOutOfBounds() {
    if (this.pos.y > camY + height/2) gameState = GAME_OVER;
  }

  update() {
    this.gravity();

    this.vel.incBy(this.acc);
    this.pos.incBy(this.vel);
    this.acc.null();

    this.camUpdate();
  }

  randomizeCol() {
    this.col = orbColors.random(this.col);
  }

  applyImpulse(a) {
    this.vel.set(a);
  }

  applyForce(a) {
    this.acc.incBy(a);
  }
}

function update() {
  orb.update();
  circleManager.update();

  orb.checkOutOfBounds();
  circleManager.checkCollision(orb);

  if (gameState == GAME_OVER) {
    gameOver();
    return;
  }

  circleManager.handleCheckpoints(orb);

  draw();
  hud();

  frame = requestAnimationFrame(update);
}

function draw() {
  background(bgColors.dark);

  cc.save();
  cc.translate(0, height/2-camY);
  circleManager.draw();
  orb.draw();
  cc.restore();
}

function hud() {
  let offset = 20;

  cc.font = "4rem 'Space Grotesk'";
  cc.textBaseline = "top";
  cc.textAlign = "end";
  cc.fillStyle = txtColor.light;
  cc.fillText(score, width - offset, offset);

  if (!notFirstTime && gameState == WAITING_TO_START) {
    background(bgColors.overlay);

    cc.textBaseline = "middle";
    cc.textAlign = "center";
    cc.fillStyle = txtColor.light;

    cc.font = `${Math.max(width/10, 56)}px 'Space Grotesk'`;
    cc.fillText("Color Switch", width/2, height/4);

    cc.font = `${Math.max(width/32, 24)}px 'Space Grotesk'`;
    cc.fillText("Press space to play", width/2, height*7/8);
  }

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

  (new Promise(a => setTimeout(a, 100))).then(a => {
    background(bgColors.overlay);

    cc.font = `${Math.max(width/10, 56)}px 'Space Grotesk'`;
    cc.textBaseline = "middle";
    cc.textAlign = "center";
    cc.fillStyle = txtColor.light;

    let midOffset = Math.max(width/25, 20);
    cc.fillText("Game Over!", width/2, height/2 - midOffset);

    let scoreOffset = 20;
    if (score > allTimeBest) {
      allTimeBest = score;
      localStorage.setItem("allTimeBest", score);

      cc.textBaseline = "top";
      cc.textAlign = "end";
      cc.font = `${Math.max(width/32, 24)}px 'Space Grotesk'`;
      cc.fillText(`New Highscore ${score}!`, width - scoreOffset, scoreOffset);
    }
    else {
      cc.textBaseline = "top";
      cc.textAlign = "end";
      cc.font = `${Math.max(width/32, 24)}px 'Space Grotesk'`;
      cc.fillText(`HI ${allTimeBest} | ${score}`, width - scoreOffset, scoreOffset);
    }

    cc.textBaseline = "middle";
    cc.textAlign = "center";
    cc.font = `${Math.max(width/32, 24)}px 'Space Grotesk'`;
    cc.fillText("Press space to restart", width/2, height/2 + midOffset);

    (new Promise(b => setTimeout(b, 100))).then(b => {
      gameState = WAITING_TO_RESTART;
    });

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

window.onload = async function() {
  initListeners();
  await initColors();
  console.log("called it");
  init();
}

