import gsap, { SteppedEase, Power2 } from "gsap";
import { Application, Container, SimpleRope, Texture, Point } from "pixi.js";

export class Line {
  constructor (container, config) {
    this.container = container;
    this.config = config;
    this.dependencies = {};
    this.canvas = this.container.querySelector(".js-line-canvas");
    this.auto = Boolean(this.container.dataset.auto);
    this.light = Boolean(this.container.dataset.light);
    this.color = this.light ? "0xFFFFFF" : "0x263069";
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    this.values = {
      x: 0,
      index: 0,
      y: 400,
      cos: -180
    };
    this.init();
  }
  
  afterInit () {}
  
  destroy () {
    window.removeEventListener("resize", this.resize);
    this.strip.destroy();
    this.points.forEach(point => {
      point.destroy();
    });
    this.exit();
    this.app.destroy();
    this.app = null;
  }
  
  init() {
    this.resize();
    this.setCanvas();
    this.setLine();
    this.setEnter();
    this.setLeave();
    if (this.auto) {
      this.toggle(true);
    }
  }

  setCanvas () {
    this.app = new Application({
      antialias: true,
      autoResize: true,
      autoStart: false,
      // forceCanvas: true,
      height: this.canvasSize.height,
      resolution: window.devicePixelRatio,
      transparent: true,
      view: this.canvas,
      width: this.canvasSize.width
    });
    this.stop = this.app.stop.bind(this.app);
    this.app.ticker.add(this.animate.bind(this));
  }

  easeIn (t, b, c, d) {
    return c * (t /= d) * t + b;
  }

  setLine () {
    this.nbrPoints = 20;
    this.lineDelta = 1;
    this.lineHeigth = 16;
    this.lineWidth = this.canvasSize.width * this.lineHeigth;
    this.ropeLength = this.lineWidth / this.nbrPoints;
    this.points = [];
    for (var i = 0; i <= this.nbrPoints; i++) {
      this.points.push(new Point(i * this.ropeLength, 0));
      // this.points.push(new Point(this.easeIn(i, 0, this.lineWidth, this.nbrPoints), 0));
    }
    this.strip = new SimpleRope(Texture.WHITE, this.points, this.lineDelta);
    this.strip.tint = this.color;
    this.lineContainer = new Container();
    this.lineContainer.y = this.canvasSize.height / 2;
    this.lineContainer.scale.set(1 / this.lineHeigth);
    this.app.stage.addChild(this.lineContainer);
    this.lineContainer.addChild(this.strip);
    this.count = 0;
  }

  resize () {
    this.canvasSize = {
      height: 50,
      width: this.container.offsetWidth
    };
    this.canvas.width = this.canvasSize.width;
    this.canvas.height = this.canvasSize.height;
    if (this.app) {
      this.app.renderer.resize(this.canvasSize.width, this.canvasSize.height);
    }
  }

  toggle (state) {
    this.enterTimeline.pause();
    this.leaveTimeline.pause();
    state ? this.enterTimeline.restart() : this.leaveTimeline.restart();
  }

  setEnter () {
    const duration = this.canvasSize.width * 1.5 / 325;
    this.enterTimeline = gsap.timeline( { onComplete: this.onStopEnter.bind(this), paused: true });
    this.enterTimeline.add(() => {
      this.strip.renderable = true;
      this.app.start();
    });
    this.enterTimeline.fromTo(this.values, { x: -this.canvasSize.width }, { delay: 0, duration, ease: Power2.easeOut, x: 0});
    this.enterTimeline.fromTo(this.values, { cos: 180 }, { duration, cos: 360}, "-=" + duration);
    this.enterTimeline.fromTo(this.values, { y: 0 }, { delay: 0, duration: duration / 2, ease: Power2.easeInOut, y: 400 }, "-=" + duration);
    this.enterTimeline.fromTo(this.values, { y: 400 }, { delay: 0, duration: duration, ease: Power2.easeInOut, y: 0 });
  }

  setLeave () {
    this.strip.renderable = true;
    const duration = this.canvasSize.width * 1.5 / 325;
    this.leaveTimeline = gsap.timeline( { onComplete: this.onStopLeave.bind(this), paused: true });
    this.leaveTimeline.add(() => {
      this.strip.renderable = true;
      this.app.start();
    });
    this.leaveTimeline.fromTo(this.values, { x: 0 }, { delay: 0, duration, ease: Power2.easeOut, x: this.canvasSize.width});
    this.leaveTimeline.fromTo(this.values, { y: 0 }, { delay: 0, duration: duration + 0.5, ease: Power2.easeOut, y: 400 }, "-=" + duration);
  }

  onStopEnter () {
    if (this.app) {
      this.app.stop();
    }
  }

  onStopLeave () {
    if (this.app) {
      this.app.stop();
    }
  }
  
  exit () {
    this.app.stop();
    this.entered = false;
    this.strip.renderable = false;
  }

  animate () {
    this.count += 0.1;
    this.points.forEach((point, index) => {
      // const interval = Math.abs(Math.abs((index * 2 / this.points.length) - 1) - 1);
      const angle = this.values.cos + index * 360 / this.points.length;
      const interval = Math.abs(Math.cos(angle * Math.PI / 180) - 1) / 2
      const deltaValue = this.values.y * interval;
      // let deltaValue = (index * this.values.y / this.points.length) - this.values.y;
      point.y = Math.sin((index * 0.55) - this.count) * deltaValue;
    });
    this.lineContainer.x = this.values.x;
  }
}