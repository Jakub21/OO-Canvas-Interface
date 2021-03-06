const Vector = require('./Vector');

module.exports = class Matrix {
  constructor(values) {
    if (values !== undefined) {
      if (values.length != 9 || values.constructor != Array) {
        throw 'Matrix error: Only arrays of length 9 are accepted'; }
      this.values = values;
    }
    else this.values = [1,0,0, 0,1,0, 0,0,1];
    // 0 3 6
    // 1 4 7
    // 2 5 8
  }
  str() {
    return `<Matrix ${this.values.map(v=>{return Math.round(v*1e3)/1e3})}>`
  }
  copy() {
    return new Matrix([...this.values]);
  }
  getDOMValues() {
    let q = this.values;
    return [q[0], q[1], q[3], q[4], q[6], q[7]];
  }
  getDOMMatrix() {
    return new DOMMatrix(this.getDOMValues());
  }
  getUnits() {
    let ih = new Vector(this.values[0], this.values[1], this.values[2]);
    let jh = new Vector(this.values[3], this.values[4], this.values[5]);
    let kh = new Vector(this.values[6], this.values[7], this.values[8]);
    return [ih, jh, kh];
  }
  mult(other) {
    // [other][old this] = [new this]
    let [ih, jh, kh] = this.getUnits();
    ih = other.apply(ih); jh = other.apply(jh); kh = other.apply(kh);
    this.values = [ih.x, ih.y, ih.z, jh.x, jh.y, jh.z, kh.x, kh.y, kh.z];
    return this;
  }
  apply(vector) {
    let [ih, jh, kh] = this.getUnits();
    let xx = ih.mult(vector.x);
    let yy = jh.mult(vector.y);
    let zz = kh.mult(vector.z);
    return xx.add(yy).add(zz);
  }
  noAction() {
    return this.values == [1,0,0, 0,1,0, 0,0,1]
  }
  static Translation(vector) {
    return new Matrix([1,0,0, 0,1,0, vector.x, vector.y, 1]);
  }
  static Rotation(angle) {
    let cos = Math.cos(angle), sin = Math.sin(angle);
    return new Matrix([cos, -sin, 0, sin, cos, 0, 0,0,1]);
  }
  static Scaling(factor) {
    return new Matrix([factor,0,0, 0,factor,0, 0,0,1]);
  }
}
