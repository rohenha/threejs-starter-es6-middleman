import { ThreeLoader } from "./loader-three";
// import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import "../utils/MTLLoader";
import "../utils/OBJLoader";

import * as THREE from "three";

export const ThreeInstance = {

  afterLoadCup: function (cup) {
    this.three.scene.add(cup);
    this.cup = cup;
    this.cupbox = new THREE.Box3().setFromObject(this.cup);
    const size = this.cupbox.getSize();
    const scale = 20 / size.y;
    this.cup.scale.set(scale, scale, scale);
    this.cup.rotation.x = -90 * Math.PI / 180;
    this.cup.rotation.z = -45 * Math.PI / 180;
    this.cup.position.x = -15;
    this.cup.castShadow = true;
    this.cup.receiveShadow = false;
    this.three.start();
  },
  
  callback: function () {
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
    this.mtlLoader = new THREE.MTLLoader();
    this.objLoader = new THREE.OBJLoader();
    this.manager = new THREE.LoadingManager();
    this.initScene();
    this.initGround();
    this.initModel();
  },

  onProgress: function (xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  },

  initScene: function() {
    this.camera = this.three.setBasicCamera(false, {x: 0, y: 20, z: 60}, {x: 0, y: 15, z: 0});
    this.three.setCamera(this.camera);
    this.three.debugCamera(this.camera);
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.three.scene.add(this.ambientLight);
    this.ambientLight.castShadow = true; // default false

    this.firstlight = new THREE.PointLight(0xFFFFFF, 10);
    this.firstlight.position.set(50, 15, -10);
    this.three.scene.add(this.firstlight);
    this.firstlight.castShadow = true; // default false
    this.three.debugLight(this.firstlight, "PointLightHelper");
    // const helper = new THREE.CameraHelper( light.shadow.camera );
    this.three.debugCamera(this.firstlight.shadow.camera);


    this.secondlight = new THREE.PointLight(0xFFFFFF, 10);
    this.secondlight.position.set(-50, 30, -10);
    this.three.scene.add(this.secondlight);
    this.secondlight.castShadow = true; // default false
    this.three.debugLight(this.secondlight, "PointLightHelper");

    this.thirdlight = new THREE.PointLight(0xFFFFFF, 10);
    this.thirdlight.position.set(-30, 10, 30);
    this.three.scene.add(this.thirdlight);
    this.thirdlight.castShadow = true; // default false
    this.three.debugLight(this.thirdlight, "PointLightHelper");

    this.secondlight = new THREE.SpotLight(0xffffff, 0.6);
    this.secondlight.castShadow = true;
    this.secondlight.shadow.camera.near = 0.7;
    this.secondlight.shadow.camera.far = 50;
    this.secondlight.position.set(50, 30, 50);
    this.three.scene.add(this.secondlight);
    this.three.debugLight(this.secondlight, "SpotLightHelper");
  },

  initGround: function () {
    this.mtlLoader.load('/assets/model/background/background.mtl', (materials) => {
      materials.preload();
      this.objLoader.setMaterials(materials);
      this.objLoader.load('/assets/model/background/background.obj', (object) => {
        this.three.scene.add(object);
        this.ground = object;
        this.groundbox = new THREE.Box3().setFromObject(this.ground);
        const size = this.groundbox.getSize();
        const scale = 50 / size.y;
        this.ground.scale.set(scale, scale, scale);
        this.ground.castShadow = false;
        this.ground.receiveShadow = true;
        // this.three.start();
      }, this.onProgress);
    });
  },

  initModel: function () {
    // this.objLoader.setMaterials(materials)
    this.objLoader.load('/assets/model/olympea.obj', (object) => {
      this.afterLoadCup(object);
    }, this.onProgress);
  },

  invoke: function () {
    return {
      init: this.init.bind(this)
    };
  },
}.invoke();
