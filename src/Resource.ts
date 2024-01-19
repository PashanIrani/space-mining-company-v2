import UIManager from "./UIManager";
import { registerResourceButton, updateResourceButtonState } from "./Button";
import { Globals } from "./Globals";

export interface Cost {
  resource: string;
  amount: number;
}

export interface UnitSymbolDefination {
  icon: string;
  infront: boolean;
}

export interface ResourceDescription {
  label: string;
  initialAmount: number;
  capacity?: number;
  generateAmount: number;
  costs: Array<Cost>;
  buildTimeMs: number;
  buildDescriptions: Array<string>;
  unitSymbol?: UnitSymbolDefination;
}

export interface AllResourcesObject {
  [key: string]: Resource;
}

export default abstract class Resource {
  private _label: string;
  private _amount: number;
  private _capacity: number;
  private _generateAmount: number;
  private _costs: Array<Cost> = [];
  private _buildTimeMs: number;
  public buildStatus: number = 0;
  private _buildDescriptions: Array<string> = [];
  public rate: number;
  public static ALL_RESOURCES: AllResourcesObject = {};
  public static RESOURCES_UPDATE_DEPS: { [key: string]: Set<string> } = {};
  public unitSymbol: UnitSymbolDefination;
  public buildQueue: Array<number>;
  private _buildQueueCapacity: number;

  constructor(desc: ResourceDescription) {
    this.unitSymbol = desc.unitSymbol || { icon: "", infront: false };
    this.label = desc.label.toLowerCase();
    this.capacity = desc.capacity || null;
    this.generateAmount = desc.generateAmount;
    this.costs = desc.costs;
    this.buildTimeMs = desc.buildTimeMs;
    this.amount = desc.initialAmount;
    this._buildDescriptions = desc.buildDescriptions;
    this.buildQueue = [];
    this._buildQueueCapacity = 1;

    UIManager.displayText(`resource-${this.label}-buildDescription`, this.getBuildDescription());
    registerResourceButton(this, () => this.generate());
    this.addResource(this);
    this.beginCalculatingRate();
  }

  addResource(resource: Resource) {
    Resource.ALL_RESOURCES[resource.label] = resource;

    for (let i = 0; i < resource.costs.length; i++) {
      const cost = resource.costs[i];

      if (!Resource.RESOURCES_UPDATE_DEPS[cost.resource]) {
        Resource.RESOURCES_UPDATE_DEPS[cost.resource] = new Set();
      }

      Resource.RESOURCES_UPDATE_DEPS[cost.resource].add(resource.label);
    }
  }

  getBuildDescription() {
    if (this.buildStatus == 0 && this._buildDescriptions.length > 1) return `-/${this._buildDescriptions.length}: Idle`;
    if (this.buildStatus == 0 && this._buildDescriptions.length == 1) return `Idle`;

    let index = Math.floor((this.buildStatus / 100) * this._buildDescriptions.length);
    let currentBuildDescription = this._buildDescriptions[index];
    let bs = (this.buildStatus / 100 - index * (1 / this._buildDescriptions.length)) / (1 / this._buildDescriptions.length);

    let countText = "";

    if (this._buildDescriptions.length > 1) {
      countText = `${index + 1}/${this._buildDescriptions.length}: `;
    }

    return `${countText}${currentBuildDescription} (${Math.round(bs * 100) + "%"})`;
  }

  generate(): Promise<void> {
    return new Promise((res, rej) => {
      if (!canAfford(this.costs)) {
        res();
        return;
      }

      performCostTransaction(this.costs);
      this.buildQueue.push(this.generateAmount);
      this.setQueueString();
      if (this.buildQueue.length > 1) {
        res();
        return;
      }

      return this.beginBuilding(0).then(() => res());
    });
  }

  sumOfQueuedBuilds(): number {
    return this.buildQueue?.reduce((sum, currentValue) => sum + currentValue, 0);
  }

  setQueueString() {
    if (this.buildQueueCapacity < 2) return;

    let timeLeft = UIManager.convertTime(this.buildQueue.length * (this.buildTimeMs / 1000) - (this.buildStatus / 100) * (this.buildTimeMs / 1000));
    let totalWorth = UIManager.formatValueWithSymbol(this.sumOfQueuedBuilds(), this.unitSymbol);
    let queueString = this.buildQueue.length > 0 ? ` (+${totalWorth}) [Q: ${this.buildQueue.length}/${this.buildQueueCapacity}] - ${timeLeft} until idle` : "";

    UIManager.displayText(`resource-${this.label}-nextAdditionIndicator`, queueString);
  }

  beginBuilding(buildStatus: number): Promise<void> {
    return new Promise((res) => {
      const calculateProgressPrecision = (totalTime: number) => {
        const minIntervalDuration = 10;
        const totalIncrements = Math.ceil(totalTime / minIntervalDuration);
        const incrementAmount = (100 * (1 - buildStatus / 100)) / totalIncrements;
        const intervalDuration = Math.ceil(totalTime / totalIncrements);
        const precision = UIManager.getPrecisionOrMax(incrementAmount, 10);
        return { intervalDuration, incrementAmount, precision };
      };

      const generateAmount = this.buildQueue[0];
      this.buildStatus = buildStatus;

      const totalTimeMs = this.buildTimeMs * (1 - buildStatus / 100);

      const { intervalDuration, incrementAmount, precision } = calculateProgressPrecision(totalTimeMs);

      UIManager.displayText(`resource-${this.label}-nextAdditionIndicator`, `  (+${UIManager.formatValueWithSymbol(generateAmount, this.unitSymbol)})`);
      this.setQueueString();

      let perBuildPercentageTick = () => {
        UIManager.displayText(`resource-${this.label}-buildStatus`, Math.round(this.buildStatus) + "%");
        UIManager.displayText(`resource-${this.label}-buildStatusSpinner`, `<span class="loader animate" aria-label="Processing your request"></span>`);
        this.buildStatus += incrementAmount;

        UIManager.displayText(`resource-${this.label}-buildDescription`, this.getBuildDescription());

        this.setQueueString();
        this.touch();
      };

      perBuildPercentageTick();
      let buildPercentageInterval = setInterval(perBuildPercentageTick, intervalDuration);

      UIManager.updateProgressBar(this, true);

      setTimeout(() => {
        UIManager.displayText(`resource-${this.label}-buildStatus`, "");
        UIManager.displayText(`resource-${this.label}-buildStatusSpinner`, "");
        UIManager.displayText(`resource-${this.label}-nextAdditionIndicator`, "");

        this.amount += generateAmount;
        this.buildQueue.shift();
        clearInterval(buildPercentageInterval);
        this.buildStatus = 0;

        UIManager.displayText(`resource-${this.label}-buildDescription`, this.getBuildDescription());

        if (this.buildQueue.length > 0) {
          this.beginBuilding(0);
        }

        this.touch();

        res();
      }, totalTimeMs);
    });
  }

  get label() {
    return this._label;
  }

  set label(newValue: string) {
    this._label = newValue;
    UIManager.displayText(`resource-${this.label}-label`, UIManager.capitalize(this.label));
  }

  get buildTimeMs() {
    return this._buildTimeMs;
  }

  set buildTimeMs(newValue: number) {
    this._buildTimeMs = newValue;
    UIManager.displayText(`resource-${this.label}-buildTimeMs`, UIManager.convertTime(this.buildTimeMs / 1000));
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

    // this._amount = parseFloat(this._amount.toFixed(2));
    UIManager.displayValue(`resource-${this.label}-amount`, this.amount, this.unitSymbol);
    UIManager.updateProgressBar(this);

    this.touch();
    Resource.RESOURCES_UPDATE_DEPS[this.label]?.forEach((l) => {
      Resource.ALL_RESOURCES[l].touch();
    });
  }

  get capacity() {
    return this._capacity;
  }

  set capacity(newValue: number) {
    this._capacity = newValue;
    UIManager.displayValue(`resource-${this.label}-capacity`, this.capacity, this.unitSymbol);
  }

  get generateAmount() {
    return this._generateAmount * (1 + Globals.cosmicBlessing);
  }

  set generateAmount(newValue: number) {
    this._generateAmount = newValue;
    UIManager.displayValue(`resource-${this.label}-generateAmount`, this.generateAmount, this.unitSymbol);
  }

  get buildQueueCapacity() {
    return this._buildQueueCapacity;
  }

  set buildQueueCapacity(newValue: number) {
    this._buildQueueCapacity = newValue;
  }

  get costs() {
    return this._costs;
  }

  set costs(newValue: Array<Cost>) {
    this._costs = newValue;
    let className = `resource-${this.label}-costs`;
    let costDisplayText = UIManager.getCostString(this.costs);
    UIManager.displayText(className, costDisplayText);
  }

  // re-runs all sets to update UI
  touch() {
    this.costs = this.costs;
    updateResourceButtonState(this);
  }

  reDraw() {
    UIManager.displayValue(`resource-${this.label}-generateAmount`, this.generateAmount, this.unitSymbol);
  }

  beginCalculatingRate() {
    this.capacity = this.capacity; // to re-render if symbol is undefined
    let lastValue = this.amount;
    let lastValueFast = this.amount;

    setInterval(() => {
      this.rate = this.amount - lastValue;
      lastValue = this.amount;

      let timeLeftText = null;
      if (this.rate < 0) {
        timeLeftText = `${UIManager.convertTime(this.amount / (this.rate * -1))} till empty`;
      }

      if (this.rate > 0 && this.capacity) {
        timeLeftText = `${UIManager.convertTime((this.capacity - this.amount) / this.rate)} till full`;
      }

      UIManager.displayText(
        `resource-${this.label}-rate`,
        `${UIManager.formatValueWithSymbol(this.rate, this.unitSymbol)}/s${timeLeftText != null ? ` (${timeLeftText})` : ""}`
      );
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

export function canAfford(costs: Array<Cost>, percentageAmount: number = 1) {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    if (Resource.ALL_RESOURCES[cost.resource].amount < cost.amount * percentageAmount) {
      return false;
    }
  }

  return true;
}

export function performCostTransaction(costs: Array<Cost>, percentageAmount: number = 1) {
  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    Resource.ALL_RESOURCES[cost.resource].amount -= cost.amount * percentageAmount;
  }
}
