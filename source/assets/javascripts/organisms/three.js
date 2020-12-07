import { ThreeLoader } from "./loader-three";
// import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import "../utils/MTLLoader";
import "../utils/OBJLoader";

import * as THREE from "three";

export const ThreeInstance = {

  afterLoadFiles: function () {
    this.afterLoadBackground();
    this.afterLoadBottle();
    this.three.start();
  },

  afterLoadBottle: function () {
    this.bottle = this.three.files.obj.bottle;
    this.three.scene.add(this.bottle);
    this.bottlebox = new THREE.Box3().setFromObject(this.bottle);
    const size = this.bottlebox.getSize();
    const scale = 35 / size.y;
    this.bottle.scale.set(scale, scale, scale);
    this.bottle.castShadow = true;
    this.bottle.receiveShadow = true;
    this.bottleMaterial = new THREE.MeshStandardMaterial({
      color: 0x16697a,
      roughness: 0.6,
      metalness: 1
    });
    this.bottle.traverse( child => {
      if ( child.material ) child.material = this.bottleMaterial;
    });
  },

  afterLoadBackground: function () {
    this.ground = this.three.files.obj.background;
    this.groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xdb6400,
      shininess: 400,
      reflectivity: 1,
      refractionRatio: 1
      });
    this.ground.traverse( child => {
      if ( child.material ) child.material = this.groundMaterial;
    });
    this.three.scene.add(this.ground);
    this.groundbox = new THREE.Box3().setFromObject(this.ground);
    const size = this.groundbox.getSize();
    const scale = 50 / size.y;
    this.ground.scale.set(scale, scale, scale);
    this.ground.castShadow = true;
    this.ground.receiveShadow = true;
  },
  
  callback: function () {
  },

  init: function (container) {
    this.callback = this.callback.bind(this);
    this.three = new ThreeLoader(container, {
      controls: false,
      grid: true,
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
    this.three.loadFiles(["/assets/model/background/background.mtl", "/assets/model/background/background.obj", "/assets/model/bottle/bottle.mtl", "/assets/model/bottle/bottle.obj"], this.afterLoadFiles.bind(this));
    // this.initGround();
  },

  initScene: function() {
    this.camera = this.three.setBasicCamera(false, {x: 0, y: 20, z: 60}, {x: 0, y: 15, z: 0});
    this.three.setCamera(this.camera);
    this.three.debugCamera(this.camera);
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    this.three.scene.add(this.ambientLight);

    this.firstlight = new THREE.PointLight(0xFFFFFF, 30, 100, 1);
    this.firstlight.position.set(30, 35, 10);
    this.three.scene.add(this.firstlight);
    this.firstlight.castShadow = true; // default false
    this.firstlight.shadow.mapSize.width = 512; // default
    this.firstlight.shadow.mapSize.height = 512; // default
    this.firstlight.shadow.camera.near = 0.5; // default
    this.firstlight.shadow.camera.far = 500; // default
    this.three.debugLight(this.firstlight, "PointLightHelper");

    this.secondlight = new THREE.PointLight(0xFFFFFF, 30, 100, 1);
    this.secondlight.position.set(-30, 30, -10);
    this.three.scene.add(this.secondlight);
    this.secondlight.castShadow = true; // default false
    this.three.debugLight(this.secondlight, "PointLightHelper");

    this.thirdlight = new THREE.PointLight(0xFFFFFF, 30, 100, 1);
    this.thirdlight.position.set(-30, 10, 30);
    this.three.scene.add(this.thirdlight);
    this.thirdlight.castShadow = true; // default false
    this.three.debugLight(this.thirdlight, "PointLightHelper");

    this.spotlight = new THREE.SpotLight(0xffffff, 200, 130, 20 * Math.PI / 180, 1 );
    this.spotlight.castShadow = true;
    this.spotlight.position.set(30, 80, 30);
    this.spotlight.shadow.mapSize.width = 100;
    this.spotlight.shadow.mapSize.height = 100;
    this.spotlight.shadow.camera.near = 10;
    this.spotlight.shadow.camera.far = 100;
    this.spotlight.shadow.camera.focus = 1;
    this.three.scene.add(this.spotlight);
    this.three.debugLight(this.spotlight, "SpotLightHelper");
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
    this.mtlLoader.load('/assets/model/background/bottle.mtl', (materials) => {
      materials.preload();
      this.objLoader.setMaterials(materials);
      this.objLoader.load('/assets/model/bottle/bottle.obj', (object) => {
        this.afterLoadBottle(object);
      }, this.onProgress);
    });
  },

  invoke: function () {
    return {
      init: this.init.bind(this)
    };
  },
}.invoke();
