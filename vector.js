class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  sqrMag() {
    return this.x * this.x + this.y * this.y;
  }

  set(v) {
    this.x = v.x;
    this.y = v.y;
  }

  mag() {
    return Math.sqrt(this.sqrMag());
  }

  mult(n) {
    return new Vector(this.x*n, this.y*n);
  }

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  incBy(v) {
    this.x += v.x;
    this.y += v.y;
  }

  normalized() {
    return this.mult(1/this.mag());
  }

  null() {
    this.x = 0;
    this.y = 0;
  }

  angle() {
    let theta = Math.atan(this.y/this.x);
    if (theta <= 0) theta += Math.PI;
    if (this.y <= 0) theta += Math.PI;
    return theta;
  }

  rotated(phi) {
    let r = this.mag();
    console.log(r);
    let theta = this.angle();
    console.log(theta);
    
    return Vector.fromAngle(theta+phi).mult(r);

  }

  static fromAngle(theta) {
    return new Vector(Math.cos(theta), Math.sin(theta));
  }
}
