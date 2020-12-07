import { ready } from "./utils/utils";
import { ThreeInstance } from "./organisms/three";

ready(() => {
  const threeInstance = ThreeInstance;
  threeInstance.init(document.querySelector("#js-three-container"));
});