import Component from '../Component.js';

export default class Fill extends Component {
  constructor(style) {
    super();
    this.style = style;
  }
  draw(ctx, path) {
    this.style.apply(this.constructor.name, ctx);
    ctx.fill(path);
  }
}
