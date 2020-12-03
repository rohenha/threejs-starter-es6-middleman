import { ThreeLoader } from "./loader-three";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";

import * as THREE from "three";

export const ThreeInstance = {

  afterLoadCup: function (cup) {
    this.three.scene.add(cup);
    this.cup = cup;
    this.cupbox = new THREE.Box3().setFromObject(this.cup);
    const size = this.cupbox.getSize();
    const scale = 50 / size.y;
    this.cup.scale.set(scale, scale, scale);
    console.log(size);
    this.cup.position.y = 0;
    this.three.start();
  },

  callback: function () {
    this.cup.rotation.y += 0.01;
    // this.light.position.x += 0.1;
  },

  init: function (container) {
    console.log("init");
    this.callback = this.callback.bind(this);
    this.three = new ThreeLoader(container, {
      controls: false,
      grid: false,
      debug: false,
      shadowMap: true,
      background: new THREE.Color(0x000000),
      // background: new THREE.Color(0x3C3C3C),
      callback: this.callback
    });
    // this.scene = this.three.initScene();
    this.mtlLoader = new MTLLoader();
    this.objLoader = new OBJLoader();
    this.manager = new THREE.LoadingManager();
    this.initScene();
    this.initModel();
  },

  onProgress: function (xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  },

  initScene: function() {
    this.camera = this.three.setBasicCamera(false, {x: 0, y: 35, z: -80}, {x: 0, y: 25, z: 0});
    this.three.setCamera(this.camera);
    this.three.debugCamera(this.camera);
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.three.scene.add(this.ambientLight);
    this.light = new THREE.SpotLight(0xffffff, 0.3);
    this.light.castShadow = true;
    this.light.shadow.camera.near = 0.7;
    this.light.shadow.camera.far = 100;
    this.light.position.set(20, 50, -50);
    this.three.scene.add(this.light);
    this.three.debugLight(this.light, "SpotLightHelper");

    this.secondlight = new THREE.SpotLight(0xffffff, 0.6);
    this.secondlight.castShadow = true;
    this.secondlight.shadow.camera.near = 0.7;
    this.secondlight.shadow.camera.far = 50;
    this.secondlight.position.set(-20, 30, -20);
    this.three.scene.add(this.secondlight);
    this.three.debugLight(this.secondlight, "SpotLightHelper");
  },

  initModel: function () {
    this.mtlLoader.load('/assets/model/paco_rabanne_invictus.mtl', (materials) => {
      materials.preload();
      this.objLoader.setMaterials(materials)
      this.objLoader.load('/assets/model/paco_rabanne_invictus.obj', (object) => {
        object.position.y = - 47;
        var texture = new THREE.TextureLoader().load('/assets/model/paco_rabanne_invictus.jpg');
        object.traverse(function (child) {   // aka setTexture
          if (child instanceof THREE.Mesh) {
            child.material.map = texture;
          }
        });
        this.afterLoadCup(object);
      }, this.onProgress);
    });
  },

  invoke: function () {
    return {
      init: this.init.bind(this)
    };
  },
}.invoke();
