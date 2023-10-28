import Resource, { Cost, UnitSymbolDefination } from "../models/Resource";

export default class UIManager {
  static setProgressBarToYellow(resource: Resource) {
    const elements = document.querySelectorAll<HTMLElement>(`.resource-${resource.label}-progressbar-container`);

    elements.forEach((element) => {
      element.classList.remove("error");
      element.classList.add("paused");
    });
  }

  static setProgressBarToRed(resource: Resource) {
    const elements = document.querySelectorAll<HTMLElement>(`.resource-${resource.label}-progressbar-container`);

    elements.forEach((element) => {
      element.classList.remove("paused");
      element.classList.add("error");
    });
  }

  static setProgressBarToGreen(resource: Resource) {
    const elements = document.querySelectorAll<HTMLElement>(`.resource-${resource.label}-progressbar-container`);

    elements.forEach((element) => {
      element.classList.remove("paused");
      element.classList.remove("error");
    });
  }

  static updateProgressBar(resource: Resource, isBegining: boolean = false) {
    if (!resource.capacity) return;

    const elements = document.querySelectorAll<HTMLElement>(`.resource-${resource.label}-progressbar`);

    elements.forEach((element) => {
      element.style.width = `${(resource.amount / resource.capacity) * 100}%`;
      if (resource.rate < 0) {
        element.classList.add("paused");
      } else {
        element.classList.remove("paused");
      }
    });

    if (isBegining) {
      const containers = document.querySelectorAll(`.resource-${resource.label}-progressbar-container`);

      containers.forEach((element) => {
        element.classList.add("animate");

        setTimeout(() => {
          element.classList.remove("animate");
        }, resource._buildTimeMs);
      });
    }
  }

  static displayText(className: string, text: string) {
    const elements = document.querySelectorAll(`.${className}`);

    elements.forEach((element) => {
      element.innerHTML = text;
    });
  }

  static displayValue(className: string, number: number, unitSymbol: UnitSymbolDefination) {
    let string = UIManager.formatValueWithSymbol(number, unitSymbol);
    UIManager.displayText(className, string);
  }

  static formatValueWithSymbol(number: number, unitSymbol: UnitSymbolDefination) {
    return `${unitSymbol.infront ? unitSymbol.icon : ""}${this.formatNumber(number)}${!unitSymbol.infront ? unitSymbol.icon : ""}`;
  }

  static getPrecisionOrMax(value: number, max: number, end: boolean = false): number {
    let precision = value.toString().split(".")[1]?.length || 0;
    let v = precision > max ? max : precision;

    if (end) return v;

    return this.getPrecisionOrMax(Number.parseFloat(value.toFixed(v)), max, true); // Doing this to remove cases where 0.150000001 -> 0.15000 (max: 5). This will ensure it's 0.15
  }

  static formatNumber(value: number, max: number = 4) {
    return value?.toFixed(UIManager.getPrecisionOrMax(value, max));
  }

  static getCostString(costs: Array<Cost>) {
    if (costs.length == 0) {
      return "FREE";
    }

    let costDisplayText = "";

    for (let i = 0; i < costs.length; i++) {
      const cost = costs[i];
      costDisplayText += `<span class="costs ${Resource.ALL_RESOURCES[cost.resource].amount < cost.amount ? "highlight" : ""}"><span class="resource-${
        Resource.ALL_RESOURCES[cost.resource].label
      }-amount">${UIManager.formatValueWithSymbol(
        Resource.ALL_RESOURCES[cost.resource].amount,
        Resource.ALL_RESOURCES[cost.resource].unitSymbol
      )}</span>/${UIManager.formatValueWithSymbol(cost.amount, Resource.ALL_RESOURCES[cost.resource].unitSymbol)} <span class="resource-${
        Resource.ALL_RESOURCES[cost.resource].label
      }-label">${UIManager.capitalize(Resource.ALL_RESOURCES[cost.resource].label)}</span></span>`;

      if (i < costs.length - 1) {
        costDisplayText += ", ";
      }
    }

    return costDisplayText;
  }

  static capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static convertTime(num: number): string {
    if (isNaN(num)) {
      return "Invalid Time";
    }

    if (num < 0) {
      num *= -1;
    }

    if (num < 60) {
      return `${this.formatNumber(num)}s`;
    }
    if (num < 3600) {
      const mins = Math.floor(num / 60);
      const secs = num % 60;
      return `${this.formatNumber(mins)}m ${this.formatNumber(secs)}s`;
    }
    if (num < 86400) {
      const hours = Math.floor(num / 3600);
      const mins = Math.floor((num % 3600) / 60);
      const secs = num % 60;
      return `${this.formatNumber(hours)}h ${this.formatNumber(mins)}m ${this.formatNumber(secs)}s`;
    }
    const days = Math.floor(num / 86400);
    const hours = Math.floor((num % 86400) / 3600);
    const mins = Math.floor((num % 3600) / 60);
    const secs = num % 60;
    return `${this.formatNumber(days)}d ${this.formatNumber(hours)}h ${this.formatNumber(mins)}m ${this.formatNumber(secs)}s`;
  }

  // Shows HTML element with id of `name`-window
  static showWindow(name: string) {
    const elements = document.querySelectorAll<HTMLElement>(`.${name}-window`);

    elements.forEach((element) => {
      element.style.visibility = "visible";
      element.style.opacity = "1";
      element.style.position = "static";
    });
  }
  // Hides HTML element with id of `name`-window
  static hideWindow(name: string) {
    const elements = document.querySelectorAll<HTMLElement>(`.${name}-window`);

    elements.forEach((element) => {
      element.style.visibility = "hidden";
      element.style.opacity = "0";
      element.style.position = "absolute";
    });
  }
}
