import Resource, { Cost } from "../models/Resource";

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

  static displayValue(className: string, number: number) {
    UIManager.displayText(className, this.formatNumber(number) + "");
  }

  static getPrecisionOrMax(value: number, max: number, end: boolean = false): number {
    let precision = value.toString().split(".")[1]?.length || 0;
    let v = precision > max ? max : precision;

    if (end) return v;

    return this.getPrecisionOrMax(Number.parseFloat(value.toFixed(v)), max, true); // Doing this to remove cases where 0.150000001 -> 0.15000 (max: 5). This will ensure it's 0.15
  }

  static formatNumber(value: number) {
    return value?.toFixed(UIManager.getPrecisionOrMax(value, 6));
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
      }-amount">${UIManager.formatNumber(Resource.ALL_RESOURCES[cost.resource].amount)}</span> / ${UIManager.formatNumber(cost.amount)} <span class="resource-${
        Resource.ALL_RESOURCES[cost.resource].label
      }-label">${Resource.ALL_RESOURCES[cost.resource].label}</span></span>`;

      if (i < costs.length - 1) {
        costDisplayText += ", ";
      }
    }

    return costDisplayText;
  }

  static capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
