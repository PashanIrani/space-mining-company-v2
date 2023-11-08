import UIManager from "./UIManager";
import Resource, { AllResourcesObject, Cost, canAfford, performCostTransaction } from "./Resource";

const COST_SCALE_PER_LEVEL = 2;
export class Factory {
  private resource: Resource;
  private _level: number;
  public upgradeCost: Array<Cost>;
  public efficiency: number;
  public maxEfficiency: number;
  public active: boolean = false;
  private allowDrawing: boolean = true;
  static ALL_RESOURCES: AllResourcesObject = {};

  constructor(resource: Resource, cost: Array<Cost> = [], level: number = 0, efficiency: number = 0.01) {
    this.resource = resource;
    this.upgradeCost = cost;
    this.efficiency = 0;
    this.maxEfficiency = efficiency;
    this._level = level;
    this.beginPassiveGeneration();
    this.beginDraw();
  }

  get level() {
    return this._level;
  }

  set level(newValue: number) {
    if (this._level == newValue) {
      return;
    }

    this._level = newValue;
    this.upgradeCost = this.upgradeCost.map((cost) => {
      cost.amount *= COST_SCALE_PER_LEVEL;
      return cost;
    });
  }

  draw() {
    const factoryContainers = document.querySelectorAll(`.${this.resource.label}-factory`);

    factoryContainers.forEach((container) => {
      const upgradeButton = document.createElement("button");
      upgradeButton.innerHTML = "Upgrade";
      upgradeButton.disabled = !canAfford(this.upgradeCost);

      upgradeButton.addEventListener("click", () => {
        this.upgrade();
        this.draw();
      });

      const factoryContainer = document.createElement("div");
      factoryContainer.classList.add("factory-item-container");

      const title = document.createElement("h1");
      title.innerHTML = `${UIManager.capitalize(this.resource.label)} Factory`;

      const costsContainer = document.createElement("p");

      for (let i = 0; i < this.resource.costs.length; i++) {
        const cost = this.resource.costs[i];
        let text = `${UIManager.formatValueWithSymbol(cost.amount * this.efficiency, Factory.ALL_RESOURCES[cost.resource].unitSymbol)} ${UIManager.capitalize(
          cost.resource
        )}`;

        if (i < this.resource.costs.length - 1) {
          text += ", ";
        }

        const pEl = document.createElement("span");
        pEl.innerHTML = text;
        if (!canAfford([cost], this.efficiency)) {
          pEl.classList.add("highlight");
        }

        costsContainer.appendChild(pEl);
      }

      const description = document.createElement("p");
      description.innerHTML = `Manufactors ${UIManager.formatValueWithSymbol(this.getGenAmount(), this.resource.unitSymbol)} ${UIManager.capitalize(
        this.resource.label
      )} per sec.`;
      description.innerHTML = `${UIManager.capitalize(this.resource.label)} is generated at a rate of <b>${UIManager.formatValueWithSymbol(
        this.getGenAmount(),
        this.resource.unitSymbol
      )} per second</b> by manufacturers${this.resource.costs.length > 0 ? ` while consuming ${costsContainer.innerHTML} per second.` : "."}`;

      const costP = document.createElement("p");
      costP.innerHTML = `Upgrade Cost: ${UIManager.getCostString(this.upgradeCost)}`;

      const efficiencyP = document.createElement("p");
      efficiencyP.innerHTML = `Operational Efficiency: ${UIManager.formatValueWithSymbol((this.efficiency / this.maxEfficiency) * 100, {
        icon: "%",
        infront: false,
      })} of the current maximum ${UIManager.formatValueWithSymbol(this.maxEfficiency * 100, { icon: "%", infront: false })}`;

      const levelP = document.createElement("p");
      levelP.innerHTML = `Production Tier: ${this.level}`;

      const statusP = document.createElement("p");
      statusP.innerHTML = `Operational Status: ${this.active ? "Active" : "Idle"}`;

      const upgradeButtonContainer = document.createElement("div");
      upgradeButtonContainer.classList.add("button-container");

      upgradeButtonContainer.appendChild(upgradeButton);
      upgradeButtonContainer.appendChild(costP);

      const sliderContainer = document.createElement("div");
      sliderContainer.classList.add("slider-container");

      const utilizationSlider = document.createElement("div");
      utilizationSlider.className = "field-row";

      const volumeLabel = document.createElement("label");
      volumeLabel.textContent = "Utilization:";

      const lowLabel = document.createElement("label");
      lowLabel.textContent = "0%";

      const rangeInput = document.createElement("input");
      rangeInput.type = "range";
      rangeInput.min = "0";
      rangeInput.max = this.maxEfficiency + "";
      rangeInput.step = this.maxEfficiency / 25 + "";
      rangeInput.value = this.efficiency + "";

      rangeInput.addEventListener("input", () => {
        const sliderValue = rangeInput.value;
        this.efficiency = Number.parseFloat(sliderValue);
        this.active = this.getGenAmount() > 0;
      });

      rangeInput.addEventListener("mousedown", () => {
        this.allowDrawing = false;
      });

      rangeInput.addEventListener("mouseup", () => {
        this.allowDrawing = true;
      });

      const highLabel = document.createElement("label");
      highLabel.textContent = "100%";

      utilizationSlider.appendChild(volumeLabel);
      utilizationSlider.appendChild(lowLabel);
      utilizationSlider.appendChild(rangeInput);
      utilizationSlider.appendChild(highLabel);
      sliderContainer.appendChild(utilizationSlider);

      const infoContainer = document.createElement("div");
      infoContainer.classList.add("info-container");
      infoContainer.appendChild(levelP);
      infoContainer.appendChild(efficiencyP);
      infoContainer.appendChild(statusP);

      container.innerHTML = "";
      factoryContainer.appendChild(title);
      factoryContainer.appendChild(description);
      factoryContainer.appendChild(sliderContainer);
      factoryContainer.appendChild(infoContainer);

      factoryContainer.appendChild(upgradeButtonContainer);
      container.appendChild(factoryContainer);
    });
  }

  beginDraw() {
    this.draw();
    setInterval(() => {
      if (this.allowDrawing) this.draw();
    }, 1000);
  }

  beginPassiveGeneration() {
    setInterval(() => {
      if (!canAfford(this.resource.costs, this.efficiency / 10)) {
        return;
      }

      performCostTransaction(this.resource.costs, this.efficiency / 10);
      let genAmount = this.getGenAmount() / 10; // dividing by 10 because this will run 10 times per sec

      this.resource.amount += genAmount;
      this.active = genAmount > 0;
    }, 100);
  }

  getGenAmount() {
    return (this.resource.generateAmount * this.efficiency * (1.05 * this.level)) / (this.resource.buildTimeMs / 1000);
  }

  upgrade() {
    if (!canAfford(this.upgradeCost)) return;

    performCostTransaction(this.upgradeCost);
    this.level++;
  }
}
