import UIManager from "../controllers/UIManager";
import { registerResourceButton, updateResourceButtonState } from "../controllers/Button";

export interface Cost {
  resource: string;
  amount: number;
}

let ALL_RESOURCES: { [key: string]: Resource } = {};
let RESOURCES_UPDATE_DEPS: { [key: string]: Set<string> } = {};

function addResource(resource: Resource) {
  ALL_RESOURCES[resource.label] = resource;

  for (let i = 0; i < resource.costs.length; i++) {
    const cost = resource.costs[i];

    if (!RESOURCES_UPDATE_DEPS[cost.resource]) {
      RESOURCES_UPDATE_DEPS[cost.resource] = new Set();
    }

    RESOURCES_UPDATE_DEPS[cost.resource].add(resource.label);
  }
}

export interface ResourceDescription {
  label: string;
  initialAmount: number;
  capacity?: number;
  generateAmount: number;
  costs: Array<Cost>;
  buildTimeMs: number;
  buildDescriptions: Array<string>;
}

export default abstract class Resource {
  private _label: string;
  private _amount: number;
  private _capacity: number;
  private _generateAmount: number;
  private _costs: Array<Cost> = [];
  _buildTimeMs: number;
  public buildStatus: number = 0;
  private _buildDescriptions: Array<string> = [];
  public rate: number;

  constructor(desc: ResourceDescription) {
    this.label = desc.label.toLowerCase();
    this.capacity = desc.capacity || null;
    this.generateAmount = desc.generateAmount;
    this.costs = desc.costs;
    this._buildTimeMs = desc.buildTimeMs;
    this.amount = desc.initialAmount;
    this._buildDescriptions = desc.buildDescriptions;

    UIManager.displayText(`resource-${this.label}-buildDescription`, this.getBuildDescription());
    registerResourceButton(this, () => this.generate());
    addResource(this);
    this.beginCalculatingRate();
  }

  getBuildDescription() {
    if (this.buildStatus == 0) return `-/${this._buildDescriptions.length}: Idle`;

    let index = Math.floor((this.buildStatus / 100) * this._buildDescriptions.length);
    let currentBuildDescription = this._buildDescriptions[index];
    let bs = (this.buildStatus / 100 - index * (1 / this._buildDescriptions.length)) / (1 / this._buildDescriptions.length);

    let countText = "";

    if (this._buildDescriptions.length > 1) {
      countText = `${index + 1}/${this._buildDescriptions.length}`;
    }

    return `${countText}: ${currentBuildDescription} (${Math.round(bs * 100) + "%"})`;
  }

  generate(): Promise<void> {
    const calculateProgressPrecision = (totalTime: number) => {
      const minIntervalDuration = 10;
      const totalIncrements = Math.ceil(totalTime / minIntervalDuration);
      const incrementAmount = 100 / totalIncrements;
      const intervalDuration = totalTime / totalIncrements;
      const precision = UIManager.getPrecisionOrMax(incrementAmount, 10);
      return { intervalDuration, incrementAmount, precision };
    };

    return new Promise((res, rej) => {
      if (!this.canAfford()) {
        res();
        return;
      }

      this.performCostTransaction();

      this.buildStatus = 0;

      const totalTimeMs = this._buildTimeMs;

      const { intervalDuration, incrementAmount, precision } = calculateProgressPrecision(totalTimeMs);

      let perBuildPercentageTick = () => {
        UIManager.displayText(`resource-${this.label}-buildStatus`, Math.round(this.buildStatus) + "%");
        UIManager.displayText(`resource-${this.label}-buildStatusSpinner`, `<span class="loader animate" aria-label="Processing your request"></span>`);
        this.buildStatus += incrementAmount;

        let index = Math.floor((this.buildStatus / 100) * this._buildDescriptions.length);
        let currentBuildDescription = this._buildDescriptions[index];
        let bs = (this.buildStatus / 100 - index * (1 / this._buildDescriptions.length)) / (1 / this._buildDescriptions.length);

        let countText = "";

        if (this._buildDescriptions.length > 1) {
          countText = `${index + 1}/${this._buildDescriptions.length}`;
        }

        UIManager.displayText(`resource-${this.label}-buildDescription`, this.getBuildDescription());

        this.touch();
      };

      perBuildPercentageTick();
      let buildPercentageInterval = setInterval(perBuildPercentageTick, intervalDuration);

      UIManager.updateProgressBar(this, true);
      setTimeout(() => {
        this.amount += this.generateAmount;

        clearInterval(buildPercentageInterval);
        this.buildStatus = 0;

        UIManager.displayText(`resource-${this.label}-buildStatus`, "");
        UIManager.displayText(`resource-${this.label}-buildStatusSpinner`, "");
        UIManager.displayText(`resource-${this.label}-buildDescription`, this.getBuildDescription());

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
    if (this.capacity) {
      this._amount = newValue > this.capacity ? this.capacity : newValue;
    } else {
      this._amount = newValue;
    }

    UIManager.displayValue(`resource-${this.label}-amount`, this.amount);
    UIManager.updateProgressBar(this);

    this.touch();
    RESOURCES_UPDATE_DEPS[this.label]?.forEach((l) => {
      ALL_RESOURCES[l].touch();
    });
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
      costDisplayText += `<span class="costs ${ALL_RESOURCES[cost.resource].amount < cost.amount ? "highlight" : ""}"><span class="resource-${
        ALL_RESOURCES[cost.resource].label
      }-amount">${UIManager.formatNumber(ALL_RESOURCES[cost.resource].amount)}</span> / ${cost.amount} <span class="resource-${
        ALL_RESOURCES[cost.resource].label
      }-label">${ALL_RESOURCES[cost.resource].label}</span></span>`;

      if (i < this.costs.length - 1) {
        costDisplayText += ", ";
      }
    }

    UIManager.displayText(className, costDisplayText);
  }

  // re-runs all sets to update UI
  touch() {
    this.costs = this.costs;
    updateResourceButtonState(this);
  }

  beginCalculatingRate() {
    let lastValue = this.amount;
    let lastValueFast = this.amount;

    setInterval(() => {
      this.rate = this.amount - lastValue;
      lastValue = this.amount;

      UIManager.displayText(`resource-${this.label}-rate`, `${UIManager.formatNumber(this.rate)}/s`);
    }, 1000);

    setInterval(() => {
      let rate = this.amount - lastValueFast;
      lastValueFast = this.amount;

      if (this.buildStatus > 0) {
        UIManager.setProgressBarToGreen(this);
      } else {
        if (rate == 0) {
          UIManager.setProgressBarToYellow(this);
        } else if (rate < 0) {
          UIManager.setProgressBarToRed(this);
        } else {
          UIManager.setProgressBarToGreen(this);
        }
      }
    }, 100);
  }
}
