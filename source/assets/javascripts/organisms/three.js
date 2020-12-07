import { ThreeLoader } from "./loader-three";
// import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import "../utils/MTLLoader";
import "../utils/OBJLoader";

import * as THREE from "three";

export const ThreeInstance = {

  afterLoadFiles: function () {
    this.afterLoadBackground();
    // this.afterLoadBottle();
    this.afterLoadInvictus();
    this.loader.style.display = "none";
    this.three.start();
  },

  afterLoadInvictus: function () {
    // console.log(this.three);
    this.invictus = this.three.files.obj.invictus;
    this.three.scene.add(this.invictus);
    this.invictusbox = new THREE.Box3().setFromObject(this.invictus);
    const size = this.invictusbox.getSize();
    const scale = 35 / size.y;
    this.invictus.scale.set(scale, scale, scale);
    this.bottleMaterial = new THREE.MeshStandardMaterial({
      color: 0x16697a,
      opacity: 0.9,
      transparent: false,
      // shadowSide: THREE.FrontSide,
      side: THREE.FrontSide
    });
    this.invictus.traverse( child => {
      if ( child.material ) {
        console.log(child.name);
        child.castShadow = true;
        child.receiveShadow = false;
        child.material = this.bottleMaterial;
      }
    });
  },

  afterLoadBottle: function () {
    this.bottle = this.three.files.obj.bottle;
    this.three.scene.add(this.bottle);
    this.bottlebox = new THREE.Box3().setFromObject(this.bottle);
    const size = this.bottlebox.getSize();
    const scale = 35 / size.y;
    this.bottle.scale.set(scale, scale, scale);
    this.bottleMaterial = new THREE.MeshBasicMaterial({
      color: 0xcecece,
      opacity: 0.5,
      transparent: true,
      shadowSide: THREE.FrontSide,
      side: THREE.BackSide
    });
    this.liquidMaterial = new THREE.MeshBasicMaterial({
      color: 0x16697a,
      opacity: 1,
      transparent: false
    });
    this.metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x030303,
      roughness: 0.6,
      metalness: 1,
    });
    this.bottle.traverse( child => {
      if ( child.material ) {
        console.log(child.name);
        child.castShadow = true;
        child.receiveShadow = false;
        switch (child.name) {
          case "Bottle_Окружность":
            child.material = this.bottleMaterial;
            break;
          case "Liquid_Окружность.002":
            child.material = this.liquidMaterial;
            break;
        
          default:
            child.material = this.metalMaterial;
            break;
        }
      }
    });
    this.bottlePosition = {
      rotation: 0
    };
  },

  afterLoadBackground: function () {
    this.ground = this.three.files.obj.background;
    this.groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      shininess: 400,
      reflectivity: 1,
      refractionRatio: 1,
      });
    this.ground.traverse( child => {
      if ( child.material ) {
        child.material = this.groundMaterial;
        child.castShadow = false;
        child.receiveShadow = true;
      }
    });
    this.three.scene.add(this.ground);
    this.groundbox = new THREE.Box3().setFromObject(this.ground);
    const size = this.groundbox.getSize();
    const scale = 50 / size.y;
    this.ground.scale.set(scale, scale, scale);
  },
  
  callback: function () {
    // this.bottlePosition.rotation += 0.5;
    // this.bottle.rotation.y = this.bottlePosition.rotation * Math.PI / 180;
  },

  init: function (container) {
    this.callback = this.callback.bind(this);
    this.three = new ThreeLoader(container, {
      controls: true,
      grid: false,
      debug: false,
      shadowMap: true,
      background: new THREE.Color(0x000000),
      callback: this.callback
    });
    // this.scene = this.three.initScene();
    this.mtlLoader = new THREE.MTLLoader();
    this.objLoader = new THREE.OBJLoader();
    this.manager = new THREE.LoadingManager();
    this.initScene();
    this.loader = document.querySelector(".js-loader");
    this.loaderPercent = this.loader.querySelector(".js-percent");
    this.three.loadFiles(["/assets/model/background/background.mtl", "/assets/model/background/background.obj", "/assets/model/invictus/invictus.mtl", "/assets/model/invictus/invictus.obj"], this.afterLoadFiles.bind(this), this.onFilesProgress.bind(this));
    // this.three.loadFiles(["/assets/model/background/background.mtl", "/assets/model/background/background.obj", "/assets/model/bottle/bottle.mtl", "/assets/model/bottle/bottle.obj"], this.afterLoadFiles.bind(this), this.onFilesProgress.bind(this));
  },

  onFilesProgress: function (percent) {
    this.loaderPercent.innerHTML = Math.round(percent, 2);
  },

  initScene: function() {
    this.camera = this.three.setBasicCamera(false, {x: 20, y: 50, z: 60}, {x: 0, y: 15, z: 0});
    // this.three.setCamera(this.camera);
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

  invoke: function () {
    return {
      init: this.init.bind(this)
    };
  },
}.invoke();
