import Vector from '../geometry/Vector.js';

/*
velocity = current velocity of the element
acceleration = current acceleration of the element
drag = base decceleration applied at all times

ALSO RADIAL V, A ETC
ALSO ABS V vs FORWARD V

*/

export default class Kinetics {
  constructor(data={}) {
    this.enabled = (data.enabled == false)? false : true;
    this.velocity = data.velocity || new Vector(0, 0);
    this.acceleration = data.acceleration || new Vector(0, 0);
    // this.drag = data.drag || new Vector(0, 0);
  }
  update(element) {
    if (!this.enabled) return;
    this.velocity.add(this.acceleration)
    element.trnf.move(this.velocity);
  }
  setVelocity(velocity) {
    this.velocity = velocity.copy();
  }
}
