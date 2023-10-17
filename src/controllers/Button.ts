function registerButton(className: string, callback: () => Promise<void>) {
  const buttons = document.querySelectorAll(`.${className}`);

  buttons.forEach((button: HTMLButtonElement) => {
    button.addEventListener("click", () => {
      button.disabled = true;
      callback().then(() => {
        button.disabled = false;
      });
    });
  });
}

export { registerButton };
