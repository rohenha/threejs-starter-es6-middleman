import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, PointLight, LoadingManager } from "three";
import * as THREE from "three";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import CameraControls from 'camera-controls';

export const ThreeManager = {

  animate: function () {
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;
    const delta = this.clock.getDelta();
    this.cameraControls.update(delta);
    this.renderer.render(this.scene, this.camera);
    
    requestAnimationFrame(this.animate.bind(this));
  },

  init: function () {
    this.container = document.querySelector("#js-three-container");
    if (!this.container) return;
    CameraControls.install({ THREE: THREE });
    this.scene = new Scene();
    this.clock = new THREE.Clock();
    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.z = 250;
    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.container.appendChild(this.renderer.domElement);
    this.mtlLoader = new MTLLoader();
    this.objLoader = new OBJLoader();
    this.manager = new LoadingManager();
    this.ambientLight = new AmbientLight(0xffffff, 0.4);
    // this.scene.add(this.ambientLight);
    this.pointLight = new PointLight(0xffffff, 0.5);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.camera.near = 0.7;
    this.pointLight.shadow.camera.far = 100;
    this.pointLight.position.set(10, 1, 5);
    // this.camera.add(this.pointLight);
    this.scene.add(this.pointLight);
    this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
    this.setModel();
    this.setFloor();
    this.camera.position.z = 5;
    this.animate();
  },

  invoke: function () {
    return {
      init: this.init.bind(this)
    };
  },

  onProgress: function (xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  },

  setFloor: function () {
    var geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.material.side = THREE.DoubleSide;
    this.floor.rotation.x = 90 * Math.PI / 180;
    this.floor.position.y = -47;
    this.scene.add(this.floor);
  },

  setModel: function () {
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
        this.scene.add(object)
      }, this.onProgress);
    })
  }

}.invoke();
