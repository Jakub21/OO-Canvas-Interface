// Second order dynamics based on https://youtu.be/KPoeNZZ6H4s
// Might need further optimalisation

export default class Dampening {
  constructor(data={}, target=0) {
    this.configure(data);
    this.prevTarget = target;
    this.position = target;
    this.velocity = 0;
    this.DAMPENING_DELTA_T = 1 / 60; // FIXME
  }
  configure(data) {
    this.freq = data.freq || 1;
    this.zeta = data.zeta || 1;
    this.init = data.init || 0;
    this.k1 = this.zeta / (Math.PI * this.freq);
    this.k2 = 1 / ((2 * Math.PI * this.freq) ** 2);
    this.k3 = this.init * this.zeta / (2 * Math.PI * this.freq);
  }
  calculate(target) {
    let targetVelocity = (target - this.prevTarget) / this.DAMPENING_DELTA_T;
    this.position = this.position + this.DAMPENING_DELTA_T * this.velocity;
    this.velocity = this.velocity + this.DAMPENING_DELTA_T * (
      target + this.k3 * targetVelocity - this.position - this.k1 * this.velocity) / this.k2;
    this.prevTarget = target;
    return this.position;
  }
}
