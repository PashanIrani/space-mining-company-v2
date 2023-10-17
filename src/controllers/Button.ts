import Resource from "../models/Resource";

function registerResourceButton(resource: Resource, callback: () => Promise<void>) {
  const buttons = document.querySelectorAll(`.resource-${resource.label}-generateButton`);

  buttons.forEach((button: HTMLButtonElement) => {
    button.addEventListener("click", () => {
      button.disabled = true;
      callback().then(() => {
        button.disabled = false;
      });
    });
  });
}

function updateResourceButtonState(resource: Resource) {
  let disabled = resource.amount == resource.capacity || !resource.canAfford() || resource.buildStatus > 0;

  const buttons = document.querySelectorAll(`.resource-${resource.label}-generateButton`);

  buttons.forEach((button: HTMLButtonElement) => {
    button.disabled = disabled;
  });
}

export { registerResourceButton, updateResourceButtonState };
