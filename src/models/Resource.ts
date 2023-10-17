import UIManager from "../controllers/UIManager";
import { registerResourceButton, updateResourceButtonState } from "../controllers/Button";

export interface Cost {
  resource: string;
  amount: number;
}

let ALL_RESOURCES: { [key: string]: Resource } = {};

export default abstract class Resource {
  private _label: string;
  private _amount: number;
  private _capacity: number;
  private _generateAmount: number;
  private _costs: Array<Cost> = [];
  _buildTimeMs: number;
  public buildStatus: number = 0;

  constructor(label: string, amount: number, capacity: number | null, generateAmount: number, costs: Array<Cost>, buildTimeMs: number) {
    this.label = label.toLowerCase();
    this.capacity = capacity;
    this.generateAmount = generateAmount;
    this.costs = costs;
    this._buildTimeMs = buildTimeMs;
    this.amount = amount;

    registerResourceButton(this, () => this.generate());

    ALL_RESOURCES[this.label] = this;
  }

  generate(): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.canAfford()) {
        res();
        return;
      }

      this.performCostTransaction();

      this.buildStatus = 0;
      const totalTimeMs = this._buildTimeMs;

      let buildPercentageInterval = setInterval(() => {
        UIManager.displayText(`resource-${this.label}-buildStatus`, this.buildStatus.toFixed(2) + "%");
        this.buildStatus += 1;
      }, totalTimeMs / 100);

      setTimeout(() => {
        const newAmount = this.generateAmount + this.amount;
        if (this.capacity) {
          this.amount = newAmount > this.capacity ? this.capacity : newAmount;
        } else {
          this.amount = newAmount;
        }

        clearInterval(buildPercentageInterval);
        this.buildStatus = 0;

        UIManager.displayText(`resource-${this.label}-buildStatus`, "");
        res();
      }, totalTimeMs);
    });
  }

  canAfford() {
    for (let i = 0; i < this.costs.length; i++) {
      const cost = this.costs[i];
      if (ALL_RESOURCES[cost.resource].amount < cost.amount) {
        return false;
      }
    }

    return true;
  }

  performCostTransaction() {
    for (let i = 0; i < this.costs.length; i++) {
      const cost = this.costs[i];
      ALL_RESOURCES[cost.resource].amount -= cost.amount;
    }
  }

  get label() {
    return this._label;
  }

  set label(newValue: string) {
    this._label = newValue;
    UIManager.displayText(`resource-${this.label}-label`, this.label.charAt(0).toUpperCase() + this.label.slice(1));
  }

  get amount() {
    return this._amount;
  }

  set amount(newValue: number) {
    this._amount = newValue;
    UIManager.displayValue(`resource-${this.label}-amount`, this.amount);
    updateResourceButtonState(this);
  }

  get capacity() {
    return this._capacity;
  }

  set capacity(newValue: number) {
    this._capacity = newValue;
    UIManager.displayValue(`resource-${this.label}-capacity`, this.capacity);
  }

  get generateAmount() {
    return this._generateAmount;
  }

  set generateAmount(newValue: number) {
    this._generateAmount = newValue;
    UIManager.displayValue(`resource-${this.label}-generateAmount`, this._generateAmount);
  }

  get costs() {
    return this._costs;
  }

  set costs(newValue: Array<Cost>) {
    this._costs = newValue;

    let className = `resource-${this.label}-costs`;
    if (this.costs.length == 0) {
      UIManager.displayText(className, "FREE");
    }

    let costDisplayText = "";

    for (let i = 0; i < this.costs.length; i++) {
      const cost = this.costs[i];
      costDisplayText += `<span class="resource-${ALL_RESOURCES[cost.resource].label}-label">${
        ALL_RESOURCES[cost.resource].label
      }</span>: <span class="resource-${ALL_RESOURCES[cost.resource].label}-amount">${ALL_RESOURCES[cost.resource].amount}</span> / ${cost.amount}`;
    }

    UIManager.displayText(className, costDisplayText);
  }

  // re-runs all sets to update UI
  touch() {
    this.label = this.label;
    this.amount = this.amount;
    this.capacity = this.capacity;
    this.generateAmount = this.generateAmount;
    this.costs = this.costs;
  }
}
