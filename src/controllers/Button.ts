import Resource from "../models/Resource";

function registerResourceButton(resource: Resource, callback: () => Promise<void>) {
  const buttons = document.querySelectorAll(`.resource-${resource.label}-generateButton`);

  buttons.forEach((button: HTMLButtonElement) => {
    button.addEventListener("click", () => {
      callback().then(() => {
        updateResourceButtonState(resource);
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
