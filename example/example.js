import * as oci from '../oci.js';

let canvas = $.get('#Canvas');
let ci = new oci.core.CanvasInterface(canvas.elm);

let blueTexture = new oci.tex.Texture([
  new oci.tex.components.Fill(new oci.tex.styles.Color(50, 80, 230)),
  new oci.tex.components.Outline(new oci.tex.styles.Color(0, 0, 0), 1),
]);

let base = new oci.elm.Element(ci, {
  shape: new oci.elm.polygon.Rectangle({x:100, y:100}),
  transform: new oci.geo.Transform({ax: 1920/2, ay: 1080/2}),
  texture: new oci.tex.Texture([
    new oci.tex.components.Fill(new oci.tex.styles.Color(80, 80, 80)),
    new oci.tex.components.Outline(new oci.tex.styles.Color(0, 0, 0), 1),
  ]),
});

let arm1 = new oci.elm.Element(base, {
  shape: new oci.elm.polygon.Rectangle({x:30, y:150}),
  transform: new oci.geo.Transform({ax: 0, ay: 0, oy:75}),
  texture: blueTexture,
  joint: new oci.kine.Joint(),
});

let arm2 = new oci.elm.Element(arm1, {
  shape: new oci.elm.polygon.Rectangle({x:20, y:100}),
  transform: new oci.geo.Transform({ay: 60, oy: 40}),
  texture: blueTexture,
  joint: new oci.kine.Joint(),
});


let mouse = {x: 0, y:0};
arm2.joint.add(-0.5);

let updateElement = () => {
  arm1.joint.add(1);
  arm2.joint.add(1);
  setTimeout(() => {
    arm2.joint.add(-1);
  }, 1e3);
}
setInterval(updateElement, 2e3);

let nextFrame = () => {
  ci.update();
  let mouseOn = base.intersects(new oci.geo.Vector(mouse.x, mouse.y));
  $.get('#Output').prop({innerText: mouseOn? 'YES' : 'NO'})
    ._s.style({left: `${mouse.x}px`, top: `${mouse.y+30}px`});
  requestAnimationFrame(nextFrame);
}

canvas.on('mousemove', (evt) => {
  mouse.x = evt.clientX;
  mouse.y = evt.clientY;
});

requestAnimationFrame(nextFrame);
