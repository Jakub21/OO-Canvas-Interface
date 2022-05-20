const CircleSlice = require('./CircleSlice');

module.exports = class Circle extends CircleSlice {
  constructor(ci, pos, radius, zIndex) {
    super(ci, pos, radius, 2*Math.PI, 0, false, zIndex);
  }
}