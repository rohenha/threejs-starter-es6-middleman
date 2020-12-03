import { ready } from "./utils/utils";
import { ThreeInstance } from "./organisms/three";

ready(() => {
  const threeInstance = ThreeInstance;
  threeInstance.init(document.querySelector("#js-three-container"));
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const cube = new THREE.Mesh( geometry, material );
  // const camera = new THREE.PerspectiveCamera(
  //   45, window.innerWidth / window.innerHeight, 3, 100
  // );
  // camera.position.set(-3, 6, -3);
  // camera.lookAt(0, 0, 0);

  // const pointLight = new THREE.PointLight(0xffffff, 0.5);
  // pointLight.castShadow = true;
  // pointLight.shadow.camera.near = 0.7;
  // pointLight.shadow.camera.far = 10;
  // // pointLight.position.set(0, 10, 0);
  // pointLight.lookAt(0, 0, 0);

  // const callbackAnimate = () => {
  //   // camera.position.x += 0.01;
  // };
  // const loader = new LoaderNew(document.querySelector("#js-three-container"), {
  //   controls: true,
  //   grid: true,
  //   debug: true,
  //   shadowMap: true,
  //   background: new THREE.Color(0xFF0000),
  //   callback: callbackAnimate
  // });

  // loader.scene.add(cube);
  // loader.scene.add(camera);
  // loader.debugCamera(camera);
  // // const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  // // loader.scene.add(ambientLight);
  // // loader.debugLight(ambientLight)
  // camera.add(pointLight);
  // // loader.scene.add(pointLight);
  // loader.debugLight(pointLight, "PointLightHelper");
});