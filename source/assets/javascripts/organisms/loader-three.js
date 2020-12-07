import * as THREE from "three";
import CameraControls from 'camera-controls';
import Stats from "stats.js";
import "../utils/MTLLoader";
import "../utils/OBJLoader";

/**
* description
*
* @method functionName
* @access accessType (ex: public, private)
* Put all parameters with @param
* @param {dom} container - description.
* {
  * @param {boolean} debug - description.
  * @param {boolean} grid - description.
  * @param {boolean} controls - description.
  * @param {object} fog - description.
  * @param {boolean} shadowMap - description.
  * @param {string} background - description.
  * @param {function} callback - description.
* }
* @returns { returnType }
* @example
* 
*/
export class ThreeLoader {

  constructor (container, config = {
    debug: false,
    grid: false,
    controls: false,
    shadowMap: false,
    fog: {
      color: 0x000000,
      near: 1,
      far: 1000
    },
    background: null,
    callback: () => {}
  }) {
    this.container = container;
    this.config = config;
    this.cameras = [];
    this.lights = [];
    this.helpers = [];
    this.clock = new THREE.Clock();
    this.mtlLoader = new THREE.MTLLoader();
    this.objLoader = new THREE.OBJLoader();
    this.files = {
      loaded: 0,
      toLoad: [],
      callback: null
    };
    this.size = { width : 0, height: 0 };
    CameraControls.install({ THREE: THREE });
    this.init();
    this.animate = this.animate.bind(this);
    this.start = this.animate;
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
  }

  destroy () {
    window.removeEventListener("resize", this.resize);
    this.stop();
  }

  init() {
    this.resize();
    this.initScene();
    this.setRender();
    this.baseCamera = this.setBasicCamera(true);
    if (this.config.debug) {
      this.stats = new Stats();
      this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      this.container.appendChild(this.stats.dom);
    }
    if (this.config.controls) {
      this.addControls(true, 2, 20, 360);
    }
    this.resize();
  }

  initScene () {
    const scene = this.createScene();
    this.setScene(scene);
    if (this.config.grid) {
      this.setGrid();
    }
    return scene;
  }
  
  setBasicCamera (activeCamera = false, position = {x: 100, y: 100, z: 100}, lookAt = {x: 0, y: 0, z: 0}) {
    const camera = this.addCamera();
    camera.position.set(position.x, position.y, position.z);
    camera.lookAt(new THREE.Vector3(lookAt.x, lookAt.y, lookAt.z));
    if (activeCamera) this.setCamera(camera);
    return camera;
  }

  createScene() {
    const scene = new THREE.Scene();
    if (this.config.fog) {
      scene.fog = new THREE.Fog(this.config.fog.color , this.config.fog.near, this.config.fog.far);
    }
    if (this.config.background) {
      scene.background = this.config.background;
    }
    return scene;
  }

  setScene (scene) {
    this.scene = scene;
  }

  setRender(bg, shadowMap) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize( this.size.width, this.size.height );
    this.renderer.encoding = true;
    this.renderer.outputEncoding = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    // if (this.config.background) {
    //   this.renderer.setClearColor(this.config.background, 1);
    // }
    if (this.config.shadowMap) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default PCFShadowMap
    }
    this.container.appendChild( this.renderer.domElement );
  }

  addControls() {
    this.cameraControls = new CameraControls(this.baseCamera, this.renderer.domElement);
  }

  setGrid (size = 1000) {
    this.gridHelper = new THREE.GridHelper(size, 100, 0x000000, 0x000000);
    this.scene.add(this.gridHelper);
    const thickness = 3;
    const vectors = [];
    vectors[0] = [
      new THREE.Vector3(-size, 0, 0),
      new THREE.Vector3(size, 0, 0),
    ];
    vectors[1] = [
      new THREE.Vector3(0, -size, 0),
      new THREE.Vector3(0, size, 0),
    ];
    vectors[2] = [
      new THREE.Vector3(0, 0, -size),
      new THREE.Vector3(0, 0, size),
    ];
    const material = new THREE.LineBasicMaterial( {
      color: 0x000000,
      linewidth: 3,
      linecap: 'round',
      linejoin:  'round'
    } );
    for ( const vectorArray of vectors) {
      const geometry = new THREE.Geometry();
      for (const vector of vectorArray) {
        geometry.vertices.push(vector);
      }
      const line = new THREE.Line( geometry, material );
      this.scene.add( line );
    }
  }

  addCamera(inputCamera) {
    let camera;
    if (!inputCamera) {
      camera = new THREE.PerspectiveCamera(
        45, this.size.width / this.size.height, 0.5, 1000
      );
    } else {
      camera = inputCamera;
    }
    this.scene.add(camera);
    return camera;
  }

  setCamera(camera) {
    this.activeCamera = camera;
  }

  debugCamera (camera) {
    if (!this.config.debug) return;
    const helper = new THREE.CameraHelper(camera);
    this.helpers.push(helper);
    this.scene.add(helper);
  }
  
  // For SpotLightHelper, or DirectionalLightHelper
  debugLight (light, helper) {
    if (!this.config.debug) return;
    const lightHelper = new THREE[helper](light);
    this.helpers.push(lightHelper);
    this.scene.add(lightHelper);
    if ( light.castShadow === true ) {
      const shadowCameraHelper = new THREE.CameraHelper( light.shadow.camera );
      this.helpers.push(shadowCameraHelper);
      this.scene.add( shadowCameraHelper );
    }
  }

  onFileProgress (xhr) {
    if ( xhr.lengthComputable ) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      const percent = this.files.loaded * this.files.progressFile + percentComplete * this.files.progressFile / 100;
      if (this.files.onProgress) {
        this.files.onProgress(percent);
      }
    }
  }

  loadFiles (files, callback, onProgress) {
    this.files.toLoad = files;
    this.files.loaded = 0;
    this.files.callback = callback;
    this.files.onProgress = onProgress;
    this.files.progressFile = 100 / this.files.toLoad.length;
    files.forEach(file => {
      let loader = "";
      let extension = file.split(".");
      let filename = extension[0].split("/");
      extension = extension[extension.length - 1];
      filename = filename[filename.length - 1];
      switch (extension) {
        case "obj":
          loader = "objLoader";
          break;
        case "mtl":
          loader = "mtlLoader";
          break;
        default:
          break;
      }
      if (loader !== "" && this[loader]) {
        this[loader].load(file, this.checkFilesLoaded.bind(this, filename, extension), this.onFileProgress.bind(this));
      }
    });
  }

  checkFilesLoaded (filename, extension, file) {
    if (!this.files[extension]) {
      this.files[extension] = {};
    }
    if (extension === "mtl") {
      file.preload();
    }
    this.files[extension][filename] = file;
    this.files.loaded += 1;
    if (this.files.loaded === this.files.toLoad.length) {
      if (this.files.callback) {
        this.files.callback();
      }
    }
  }

  animate () {
    if (this.config.debug) {
      this.stats.begin();
      this.helpers.forEach(helper => {
        helper.update();
      });
    }
    if (this.config.controls) {
      const delta = this.clock.getDelta();
      this.cameraControls.update(delta);
    }
    if (this.config.callback) {
      this.config.callback();
    }
    this.renderer.render(this.scene, this.activeCamera);
    if (this.config.debug) {
      this.stats.end();
    }
    this.requestId = requestAnimationFrame(this.animate.bind(this));
  }

  stop () {
    cancelAnimationFrame(this.requestId);
  }

  resize () {
    this.size.width = window.innerWidth;
    this.size.height = window.innerHeight;
    if (this.renderer) {
      this.renderer.setSize(this.size.width, this.size.height);
    }
    if (this.activeCamera) {
      this.activeCamera.aspect = this.size.width / this.size.height;
      this.activeCamera.updateProjectionMatrix();
    }
  }
}