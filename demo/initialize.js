const FPS = 60;
let FRAME = 0;
let ci;
let elms = {};
let PAUSED = true;
let linearStep = 10;
let scaleStep = 0.05;
let rotateStep = 0.2;

class FpsMeter {
  constructor(deltas=20) {
    this.maxDeltasLength = deltas;
    this.lastTickTime = Date.now();
    this.deltas = [];
  }
  tick() {
    var now = Date.now();
    var delta = now - this.lastTickTime;
    this.lastTickTime = now;
    this.deltas.push(delta);
    if (this.deltas.length > this.maxDeltasLength) this.deltas.shift();
  }
  get() {
    var average = 0;
    for (var delta of this.deltas) average += delta;
    return 1000 / (average / this.deltas.length);
  }
}

let init = () => {

  let meter = new FpsMeter();
  ci = new oci.CanvasInterface($.get('#Canvas').elm);
  setInterval(() => {
    $.get('#FPS').prop({innerText: `FPS: ${Math.round(meter.get())}`});
  }, 1e3/5);

  let update = (time) => {
    ci.update();
    ci.view.zoom = Math.min(ci.canvas.width/(2.5e3), ci.canvas.height/2e3);
    if (!PAUSED) FRAME++;
    meter.tick();
    updateAnimation(ci);
    requestAnimationFrame(update);
  }

  setupAnimation(ci);
  requestAnimationFrame(update);
  setupSliders();
}

let setupAnimation = (ci) => {
  class ImageRect extends oci.prm.Polygon {
    constructor(ci, path, scale=1) {
      super(ci, [new oci.Vector()]);
      this.trf.scale(scale);
      this.imf = new oci.tex.ImageFill(this, path);
      new oci.tex.Outline(this, new oci.tex.Color(150, 255, 150, 100));
      // new oci.tex.Center(this);
      new oci.tex.JointAnchor(this);
      this.imf.image.on('load', (evt) => {
        let img = evt.target;
        let size = new oci.Vector(img.naturalWidth, img.naturalHeight);
        this.vertices = [];
        this.vertices.push(new oci.Vector(size.x/2, size.y/2));
        this.vertices.push(new oci.Vector(-size.x/2, size.y/2));
        this.vertices.push(new oci.Vector(-size.x/2, -size.y/2));
        this.vertices.push(new oci.Vector(size.x/2, -size.y/2));
        this.triangulate();
        this.box = oci.Box.FromVertices(this.vertices);
        this.imf.transform(oci.Matrix.Translation(new oci.Vector(-size.x/2, -size.y/2)));
      });
    }
  }

  class Character extends oci.cpx.Complex {
    constructor(ci) {
      super(ci);
      new ImageRect(this.root, './img/body_down.png');
      this._root.trf.scale(1.05);
      new ImageRect(this.limb('bodyU'), './img/body_up.png');
      this.getJoint('bodyU').move(new oci.Vector(0, -300)).scale(1.1)
        .offset(new oci.Vector(0, -300)).snap();
      new ImageRect(this.limb('head', 'bodyU'), './img/head.png');
      this.getJoint('head').move(new oci.Vector(-30, -245))
        .offset(new oci.Vector(65, -180)).snap();
      // left arm
      new ImageRect(this.limb('armUL', 'bodyU'), './img/arm_up.png');
      this.getJoint('armUL').move(new oci.Vector(0, -100))
        .offset(new oci.Vector(0, 225)).scale(0.95).snap();
      new ImageRect(this.limb('armDL', 'armUL'), './img/arm_down.png');
      this.getJoint('armDL').move(new oci.Vector(0, 250))
        .offset(new oci.Vector(20, 330)).scale(0.95).snap();
      // right arm
      // new ImageRect(this.limb('armUR', 'bodyU'), './img/arm_up.png');
      // this.getJoint('armUR').move(new oci.Vector(0, -150))
      //   .offset(new oci.Vector(0, 250)).snap();
      // new ImageRect(this.limb('armDR', 'armUR'), './img/arm_down.png');
      // this.getJoint('armDR').move(new oci.Vector(0, 250))
      //   .offset(new oci.Vector(20, 330)).snap();
      // left leg
      new ImageRect(this.limb('legUL'), './img/leg_up.png');
      this.getJoint('legUL').move(new oci.Vector(0, 200))
        .offset(new oci.Vector(0, 200)).scale(1.045).snap();
      new ImageRect(this.limb('legDL', 'legUL'), './img/leg_down.png');
      this.getJoint('legDL').move(new oci.Vector(0, 350))
        .offset(new oci.Vector(-20, 450)).scale(1.045).snap();
      // right leg
      // new ImageRect(this.limb('legUR'), './img/leg_up.png');
      // this.getJoint('legUR').move(new oci.Vector(0, 200))
      //   .offset(new oci.Vector(0, 200)).snap();
      // new ImageRect(this.limb('legDR', 'legUR'), './img/leg_down.png');
      // this.getJoint('legDR').move(new oci.Vector(0, 350))
      //   .offset(new oci.Vector(-20, 450)).snap();
    }
  }

  // elms.planet = new ImageRect(ci, './img/planet.png');
  // elms.planet.trf.move(new oci.Vector(1920*2/4, 1080*1/4)).rotate(-Math.PI/4);
  elms.body = new Character(ci);
  elms.body.trf.scale(0.25).move(new oci.Vector(1920/2,1080/2-50))//.rotate(-.2);
}

let updateAnimation = (ci) => {
  if (PAUSED) return;
  // elms.body.trf.rotate(-0.01);
  let FPS = 200;
  const A = Math.sin(2*Math.PI*        (0+FRAME)/FPS) * 0.33;
  const B = Math.sin(2*Math.PI*((FPS*1/4)+FRAME)/FPS) * 0.33;
  const C = Math.sin(2*Math.PI*((FPS*2/4)+FRAME)/FPS) * 0.33;
  const D = Math.sin(2*Math.PI*((FPS*3/4)+FRAME)/FPS) * 0.33;
  // elms.body.trf.move(new oci.Vector(12,3*Math.sin(2*Math.PI*(FRAME*2)/FPS)));
  elms.body.getJoint('bodyU').setRotation(-A*1-.5);
  elms.body.getJoint('head').setRotation(-A*2);
  elms.body.getJoint('armUL').setRotation(A*2);
  elms.body.getJoint('armDL').setRotation(A*2+.75);
  // elms.body.getJoint('armUR').setRotation(-A*2);
  // elms.body.getJoint('armDR').setRotation(-A*2+.75);
  elms.body.getJoint('legUL').setRotation(A*2+0.33);
  elms.body.getJoint('legDL').setRotation(-B*3-1);
  // elms.body.getJoint('legUR').setRotation(C*2+0.33);
  // elms.body.getJoint('legDR').setRotation(-D*3-1);
}

let setupSliders = () => {
  const container = $.get('#Sliders');


  // CONFIGURATION
  container.append($.make('button .Outer .Danger').prop({innerText: 'Reset'})
  .on('click', () => {
    FRAME = 0;
    elms.body.remove();
    setupAnimation(ci);
    container.empty();
    linearStep = 10;
    scaleStep = 0.05;
    rotateStep = 0.2;
    setupSliders();
  }))
  container.append($.make('button .Outer').prop({innerText: 'Original pos'})
  .on('click', () => {
    elms.body.getJoint('bodyU').setRotation(0);
    elms.body.getJoint('head').setRotation(0);
    elms.body.getJoint('armUL').setRotation(0);
    elms.body.getJoint('armDL').setRotation(0);
    // elms.body.getJoint('armUR').setRotation(-A*2);
    // elms.body.getJoint('armDR').setRotation(-A*2+.75);
    elms.body.getJoint('legUL').setRotation(0);
    elms.body.getJoint('legDL').setRotation(0);
    // elms.body.getJoint('legUR').setRotation(C*2+0.33);
    // elms.body.getJoint('legDR').setRotation(-D*3-1);
  }))
  container.append($.make('button .Outer').prop({innerText: 'Toggle animation'})
  .on('click', () => {
    PAUSED = !PAUSED;
  }))


  // OUTPUT
  container.append($.make('button .Outer').prop({innerText: 'Spew out'})
  .on('click', () => {
    let data = `"Root": {"Scale": ${elms.body._root.trf._scale}}\n`;
    for (let [key, joint] of Object.entries(elms.body.joints)) {
      data += `"${key}": {
  "AnchorX": ${joint.target._anchor.x}, "AnchorY": ${joint.target._anchor.y},
  "OffsetX": ${joint.target._offset.x}, "OffsetY": ${joint.target._offset.y},
  "Scale": ${joint.target._scale}
}\n`;
    }
    alert(data);
  }))


  // JOINTS CONFIG
  for (let [key, joint] of Object.entries(elms.body.joints)) {
    let limb = elms.body.limbs[key];
    container.appendShp(`$div[#Section${key} .Section] {
      $h3{${key}}
      $section {Anchor
        $div[.Row]{$button[.None] $button[#AnchorY${key}Decr] {^} $button[.None]}
        $div[.Row]{$button[#AnchorX${key}Decr] {<} $button[#AnchorY${key}Incr] {v} $button[#AnchorX${key}Incr] {>}}}
      $section {Transform
        $div[.Row]{Offset $button[#OffsetY${key}Decr] {^}}
        $div[.Row]{$button[#OffsetX${key}Decr] {<} $button[#OffsetY${key}Incr] {v} $button[#OffsetX${key}Incr] {>}}
        $div[.Row]{Scale $button[#Scale${key}Decr] {Decr} $button[#Scale${key}Incr] {Incr}}
        $div[.Row]{Rotate $button[#Rotate${key}Decr] {CCW} $button[#Rotate${key}Incr] {CW}}}
      }
    }`);
    $.get(`#AnchorX${key}Decr`).on('click', (evt)=>{joint.move(new oci.Vector(-linearStep,0))});
    $.get(`#AnchorY${key}Decr`).on('click', (evt)=>{joint.move(new oci.Vector(0,-linearStep))});
    $.get(`#AnchorX${key}Incr`).on('click', (evt)=>{joint.move(new oci.Vector(linearStep,0))});
    $.get(`#AnchorY${key}Incr`).on('click', (evt)=>{joint.move(new oci.Vector(0,linearStep))});
    $.get(`#OffsetX${key}Decr`).on('click', (evt)=>{joint.offset(new oci.Vector(-linearStep,0))});
    $.get(`#OffsetY${key}Decr`).on('click', (evt)=>{joint.offset(new oci.Vector(0,-linearStep))});
    $.get(`#OffsetX${key}Incr`).on('click', (evt)=>{joint.offset(new oci.Vector(linearStep,0))});
    $.get(`#OffsetY${key}Incr`).on('click', (evt)=>{joint.offset(new oci.Vector(0,linearStep))});
    $.get(`#Scale${key}Incr`).on('click', (evt)=>{limb.trf.scale(1+scaleStep)});
    $.get(`#Scale${key}Decr`).on('click', (evt)=>{limb.trf.scale(1-scaleStep)});
    $.get(`#Rotate${key}Incr`).on('click', (evt)=>{joint.rotate(-rotateStep)});
    $.get(`#Rotate${key}Decr`).on('click', (evt)=>{joint.rotate(rotateStep)});
  }


  // STEP SIZE
  container.appendShp(`$div[.Section .NextRow] {
    $h3 {Step size (precision)}
    $section {
      Movement step $div[.Row] { $span[#LinearStep]{${linearStep}}
        $button[#LinearDecr] {-} $button[#LinearIncr] {+}}
      Scaling step $div[.Row] { $span[#ScaleStep]{${scaleStep}}
        $button[#ScaleDecr] {-} $button[#ScaleIncr] {+}}
      Rotate step $div[.Row] { $span[#RotateStep]{${rotateStep}}
        $button[#RotateDecr] {-} $button[#RotateIncr] {+}}
    }
  }`);
  $.get('#LinearDecr').on('click', () => {
    linearStep -= 1;
    $.get('#LinearStep').prop({innerText:linearStep});
  })
  $.get('#LinearIncr').on('click', () => {
    linearStep += 1;
    $.get('#LinearStep').prop({innerText:linearStep});
  })
  $.get('#ScaleDecr').on('click', () => {
    scaleStep -= 0.01;
    $.get('#ScaleStep').prop({innerText:Math.round(scaleStep*1e4)/1e4});
  })
  $.get('#ScaleIncr').on('click', () => {
    scaleStep += 0.01;
    $.get('#ScaleStep').prop({innerText:Math.round(scaleStep*1e4)/1e4});
  })
  $.get('#RotateDecr').on('click', () => {
    rotateStep -= 0.05;
    $.get('#RotateStep').prop({innerText:Math.round(rotateStep*1e4)/1e4});
  })
  $.get('#RotateIncr').on('click', () => {
    rotateStep += 0.05;
    $.get('#RotateStep').prop({innerText:Math.round(rotateStep*1e4)/1e4});
  })


  // ROOT
  container.appendShp(`$div[#SectionRoot .Section] {
    $h3{Root}
    $section {Root element
      $div[.Row]{Scale $button[#ScaleRootDecr] {Decr} $button[#ScaleRootIncr] {Incr}}}
      $section {Complex anchor
        $div[.Row]{$button[.None] $button[#AnchorYRootDecr] {^} $button[.None]}
        $div[.Row]{$button[#AnchorXRootDecr] {<} $button[#AnchorYRootIncr] {v} $button[#AnchorXRootIncr] {>}}
        $div[.Row]{$button[#RotateRootDecr] {CCW} $button[#RotateRootIncr] {CW}}
      }
    }
  }`);
  $.get(`#ScaleRootIncr`).on('click', (evt)=>{elms.body._root.trf.scale(1+scaleStep)});
  $.get(`#ScaleRootDecr`).on('click', (evt)=>{elms.body._root.trf.scale(1-scaleStep)});
  $.get(`#AnchorXRootDecr`).on('click', (evt)=>{elms.body.trf.move(new oci.Vector(-linearStep,0))});
  $.get(`#AnchorYRootDecr`).on('click', (evt)=>{elms.body.trf.move(new oci.Vector(0,-linearStep))});
  $.get(`#AnchorXRootIncr`).on('click', (evt)=>{elms.body.trf.move(new oci.Vector(linearStep,0))});
  $.get(`#AnchorYRootIncr`).on('click', (evt)=>{elms.body.trf.move(new oci.Vector(0,linearStep))});
  $.get(`#RotateRootIncr`).on('click', (evt)=>{elms.body.trf.rotate(-rotateStep)});
  $.get(`#RotateRootDecr`).on('click', (evt)=>{elms.body.trf.rotate(rotateStep)});
}
