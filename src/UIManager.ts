import Resource, { Cost, UnitSymbolDefination } from "./Resource";

export default class UIManager {
  static removeUnderscore(label: string): string {
    return label.replace(/_/g, " ");
  }

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
        }, resource.buildTimeMs);
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
    // return value?.toFixed(UIManager.getPrecisionOrMax(value, max));
    if (isNaN(value) || value == null) return "NaN";

    const abbreviations = [
      { value: 1e3, symbol: "K" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "Q" },
      { value: 1e18, symbol: "Qi" },
      { value: 1e21, symbol: "Sx" },
      { value: 1e24, symbol: "Sp" },
      { value: 1e27, symbol: "Oc" },
      { value: 1e30, symbol: "Nn" },
      { value: 1e33, symbol: "Dc" },
      { value: 1e36, symbol: "Ut" },
      { value: 1e39, symbol: "Dt" },
      { value: 1e42, symbol: "Tdt" },
      { value: 1e45, symbol: "Qddt" },
      { value: 1e48, symbol: "Qint" },
      { value: 1e51, symbol: "Sxdt" },
      { value: 1e54, symbol: "Sndt" },
      { value: 1e57, symbol: "Ocdt" },
      { value: 1e60, symbol: "Nndt" },
      { value: 1e63, symbol: "Vgt" },
      { value: 1e66, symbol: "Uvgt" },
      { value: 1e69, symbol: "Dvgt" },
      { value: 1e72, symbol: "Ttvgt" },
      { value: 1e75, symbol: "Qtvgt" },
      { value: 1e78, symbol: "Qivgt" },
      { value: 1e81, symbol: "Sxvgt" },
      { value: 1e84, symbol: "Snvgt" },
      { value: 1e87, symbol: "Ocvgt" },
      { value: 1e90, symbol: "Nnvgt" },
      { value: 1e93, symbol: "Trgt" },
      { value: 1e96, symbol: "Utrgt" },
      { value: 1e99, symbol: "Dtrgt" },
      { value: 1e100, symbol: "Googol" },
      { value: 1e130, symbol: "Skewer's" },
    ];

    for (let i = abbreviations.length - 1; i >= 0; i--) {
      if (Math.abs(value) >= abbreviations[i].value) {
        return (value / abbreviations[i].value).toFixed(2) + abbreviations[i].symbol;
      }
    }

    const formattedValue = value?.toFixed(2);
    const parts = formattedValue.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
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
      }-label">${UIManager.capitalize(UIManager.removeUnderscore(Resource.ALL_RESOURCES[cost.resource].label))}</span></span>`;

      if (i < costs.length - 1) {
        costDisplayText += ", ";
      }
    }

    return costDisplayText;
  }

  static capitalize(str: string) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  static convertTime(seconds: number): string {
    if (isNaN(seconds)) {
      return "Invalid Time";
    }

    if (seconds < 0) {
      seconds *= -1;
    }

    if (seconds < 60) {
      return `${this.formatNumber(seconds)}s`;
    }
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${this.formatNumber(mins)}m ${this.formatNumber(secs)}s`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${this.formatNumber(hours)}h ${this.formatNumber(mins)}m ${this.formatNumber(secs)}s`;
    }
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
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
