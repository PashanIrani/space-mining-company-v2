import { AllResourcesObject } from "./Resource";
import UIManager from "./UIManager";

export class Globals {
  static cosmicBlessing = 0;

  static _maxCosmicBlessing = 0;

  static initCosmicBlessing(resources: AllResourcesObject) {
    let x = 0;
    let cosmicBlessing = 0;

    let logic = () => {
      const f = 2.2; // introduced chaos to sine wave
      cosmicBlessing = (Globals._maxCosmicBlessing * Math.abs((f / 2) * Math.sin(x) + Math.sin(f * x))) / f;
      UIManager.displayValue("cosmic-boost-value", cosmicBlessing * 100, { icon: "%", infront: false });

      x += Math.PI / 6000;
      if (x >= Math.PI * 2) {
        x = 0;
      }

      Globals.cosmicBlessing = cosmicBlessing;

      Object.keys(resources).forEach((resourceKey) => {
        resources[resourceKey].reDraw();
      });
    };
    logic();
    setInterval(logic, 100);
  }
}
