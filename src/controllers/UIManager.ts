import Resource from "../models/Resource";

export default class UIManager {
  static updateProgressBar(resource: Resource, isBegining: boolean = false) {
    if (!resource.capacity) return;

    const elements = document.querySelectorAll<HTMLElement>(`.resource-${resource.label}-progressbar`);

    elements.forEach((element) => {
      element.style.width = `${(resource.amount / resource.capacity) * 100}%`;
      element.style.transition = `width ${resource._buildTimeMs / 1000}s linear`;
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
    UIManager.displayText(className, number?.toFixed(2) + "");
  }

  static getPrecisionOrMax(value: number, max: number, end: boolean = false): number {
    let precision = value.toString().split(".")[1]?.length || 0;
    let v = precision > max ? max : precision;

    if (end) return v;

    return this.getPrecisionOrMax(Number.parseFloat(value.toFixed(v)), max, true); // Doing this to remove cases where 0.150000001 -> 0.15000 (max: 5). This will ensure it's 0.15
  }
}
