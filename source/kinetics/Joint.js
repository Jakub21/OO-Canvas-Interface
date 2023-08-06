
import Dampening from "./Dampening.js";

export default class Joint {
  constructor(data={}) {
    this.enabled = (data.enabled == false)? false : true;
    this.offset = data.offset || 0;
    this.range = data.range || NaN;
    this.target = data.target || 0;
    this.dampening = new Dampening(data.damp, this.target);
  }
  update(element) {
    if (!this.enabled) return;
    element.trnf.setRotation(this.offset + this.dampening.calculate(this.target));
  }
  set(target) {
    this.target = target;
  }
  add(delta) {
    this.target += delta;
  }
}
