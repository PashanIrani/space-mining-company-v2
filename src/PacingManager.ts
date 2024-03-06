import Resource, { AllResourcesObject } from "./Resource";
import UIManager from "./UIManager";

export class PacingManager {
  introducedWindows: Set<string> = new Set(["energy"]);
  resources: AllResourcesObject;
  initiallyHiddenWindows = ["funds", "store", "miners"];

  constructor(resources: AllResourcesObject) {
    this.resources = resources;

    UIManager.hideWindow("initially-hidden");

    this.check();

    setInterval(() => {
      this.check();
    }, 1000);
  }

  check() {
    if (this.resources["energy"].amount >= 2) {
      this.introducedWindows.add("funds");
    }

    if (this.resources["funds"].amount >= 1) {
      this.introducedWindows.add("store");
    }

    this.introducedWindows.forEach((windowName) => {
      this.showWindow(windowName);
    });
  }

  showWindow(name: string) {
    UIManager.showWindow(name);
    if (this.introducedWindows.has(name)) return;
    this.introducedWindows.add(name);
  }
}
