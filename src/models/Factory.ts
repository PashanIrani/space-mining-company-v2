import UIManager from "../controllers/UIManager";
import Resource, { Cost, canAfford, performCostTransaction } from "./Resource";

export class Factory {
  private resource: Resource;
  private _level: number;
  private upgradeCost: Array<Cost>;
  private efficiency: number;
  public active: boolean = false;

  constructor(resource: Resource, cost: Array<Cost> = [], level: number = 0, efficiency: number = 0.01) {
    this.resource = resource;
    this.upgradeCost = cost;
    this.efficiency = efficiency;
    this.level = level;
    this.beginPassiveGeneration();
    this.beginDraw();
  }

  get level() {
    return this._level;
  }

  set level(newValue: number) {
    this._level = newValue;
    this.upgradeCost = this.upgradeCost.map((cost) => {
      cost.amount *= 1.1;
      return cost;
    });
  }

  draw() {
    const factoryContainers = document.querySelectorAll(`.factory-${this.resource.label}`);
    console.log(`.factory-${this.resource.label}`, factoryContainers);

    factoryContainers.forEach((container) => {
      const factoryContainer = document.createElement("div");
      factoryContainer.classList.add("factory-item-container");

      const buttonContainer = document.createElement("div");

      const activeButton = document.createElement("button");
      activeButton.innerHTML = this.active ? "OFF" : "ON";
      activeButton.addEventListener("click", () => {
        this.active = !this.active;
        this.draw();
      });

      const infoContainer = document.createElement("div");
      infoContainer.classList.add("info-container");

      const title = document.createElement("h1");
      title.innerHTML = `${UIManager.capitalize(this.resource.label)} Factory`;

      const costP = document.createElement("p");
      costP.innerHTML = `Cost: ${UIManager.getCostString(this.upgradeCost)}`;

      const levelP = document.createElement("p");
      levelP.innerHTML = `Level: ${this.level}`;

      infoContainer.appendChild(activeButton);
      infoContainer.appendChild(title);
      infoContainer.appendChild(costP);
      infoContainer.appendChild(levelP);

      const costsContainer = document.createElement("div");

      for (let i = 0; i < this.resource.costs.length; i++) {
        const cost = this.resource.costs[i];
        let text = `${UIManager.capitalize(cost.resource)}: -${cost.amount * this.efficiency}/s`;
        const pEl = document.createElement("p");
        pEl.innerHTML = text;
        costsContainer.appendChild(pEl);
      }

      infoContainer.appendChild(costsContainer);
      const upgradeButton = document.createElement("button");
      upgradeButton.innerHTML = "Upgrade";
      upgradeButton.disabled = !canAfford(this.upgradeCost);

      upgradeButton.addEventListener("click", () => {
        this.upgrade();
        this.draw();
      });

      container.innerHTML = "";
      factoryContainer.appendChild(infoContainer);
      factoryContainer.appendChild(upgradeButton);
      container.appendChild(factoryContainer);
    });
  }

  beginDraw() {
    setInterval(() => {
      this.draw();
    }, 1000);
  }

  beginPassiveGeneration() {
    setInterval(() => {
      if (!this.active) return;

      if (!canAfford(this.resource.costs, this.efficiency / 10)) {
        return;
      }

      performCostTransaction(this.resource.costs, this.efficiency / 10);

      let genAmount = (this.resource.generateAmount * this.efficiency) / 10; // dividing by 10 because this will run 10 times per sec
      this.resource.amount += genAmount * (1.05 * this.level);
    }, 100);
  }

  upgrade() {
    if (!canAfford(this.upgradeCost)) return;

    performCostTransaction(this.upgradeCost);

    this.level++;
  }
}
