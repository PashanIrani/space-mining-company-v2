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
}
