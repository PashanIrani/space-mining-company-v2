export default class UIManager {
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
