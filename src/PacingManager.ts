import Resource, { AllResourcesObject } from "./Resource";
import UIManager from "./UIManager";

export class PacingManager {
  introducedWindows: Set<string> = new Set();
  resources: AllResourcesObject;
  initiallyHiddenWindows = ["funds", "store"];

  constructor(resources: AllResourcesObject) {
    this.resources = resources;

    this.initiallyHiddenWindows.forEach((windowName) => {
      UIManager.hideWindow(windowName);
    });

    setInterval(() => {
      this.check();
    }, 1000);
  }

  check() {
    this.introducedWindows.forEach((windowName) => {
      this.showWindow(windowName);
    });

    if (this.resources["energy"].amount >= 1) {
      this.introducedWindows.add("funds");
    }

    if (this.resources["funds"].amount >= 5) {
      this.introducedWindows.add("store");
    }
  }

  showWindow(name: string) {
    UIManager.showWindow(name);
    if (this.introducedWindows.has(name)) return;
    this.introducedWindows.add(name);
  }
}