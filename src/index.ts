import Resource from "./Resource";

// import "xp.css/dist/XP.css";

import { Store, StoreItem } from "./Store";
import { Factory } from "./Factory";
import { PacingManager } from "./PacingManager";
import { SaveManager } from "./SaveManager";
import "./Tab.js";
import UIManager from "./UIManager";
import "./styles";
const DEV = false;

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: 1,
      costs: [],
      buildTimeMs: DEV ? 10 : 750,
      buildDescriptions: ["Generating Energy"],
      unitSymbol: { icon: "e", infront: false },
    });
  }
}

class Funds extends Resource {
  constructor() {
    super({
      label: "funds",
      initialAmount: 0,
      generateAmount: DEV ? 50 : 1,
      costs: [{ resource: "energy", amount: 4 }],
      buildTimeMs: DEV ? 1000 : 10 * 1000,
      buildDescriptions: ["Analyzing Market", "Executing Plan", "Generating Funds"],
      unitSymbol: { icon: "$", infront: true },
    });
  }
}

const energy = new Energy();
const funds = new Funds();

// let energyFactory = new Factory(energy, [], 0);
let fundsFactory = new Factory(funds, JSON.parse(JSON.stringify(funds.costs)), 0);
let resources = { energy, funds };

const pacingManager = new PacingManager(resources);

let store = new Store([
  {
    id: "first-purchase",
    collection: "main",
    name: "OS Update",
    description: "Upgrades... Upgrades... Upgrades...",
    costs: [
      { resource: "funds", amount: 2.99 },
      { resource: "energy", amount: 10 },
    ],
    level: 1,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      pacingManager.showWindow("system");
      pacingManager.showWindow("energy-upgrades");
      pacingManager.showWindow("funds-upgrades");
    },
  },
  {
    id: "funds-factory",
    collection: "funds",
    name: "Funds Factory",
    description: "Generates Funds Passively",
    costs: [
      { resource: "funds", amount: 10 },
      { resource: "energy", amount: 95 },
    ],
    level: 1,
    dependsOn: [["funds", "funds-generation", 4]],
    onPurchase: (self: StoreItem) => {
      fundsFactory.level = 1;
      pacingManager.showWindow("funds-factory");
    },
  },
  {
    id: "energy-generation",
    collection: "energy",
    name: "Energy Generation",
    description: `Increases the amount of energy generated from ${UIManager.formatValueWithSymbol(
      energy.generateAmount,
      energy.unitSymbol
    )} to ${UIManager.formatValueWithSymbol(getChangeAmount(2, 0.15, energy.generateAmount, true), energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 2 },
      { resource: "energy", amount: 0.25 },
    ],
    level: 1,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      self.level++;

      let changeAmount = getChangeAmount(self.level, 0.15, energy.generateAmount, true);
      energy.generateAmount = changeAmount;

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.15, cost.amount, true);
        return cost;
      });

      self.name = `Energy Generation ${self.level}`;

      self.description = `Increases the amount of energy generated from ${UIManager.formatValueWithSymbol(
        energy.generateAmount,
        energy.unitSymbol
      )} to ${UIManager.formatValueWithSymbol(getChangeAmount(self.level, 0.15, energy.generateAmount, true), energy.unitSymbol)}`;
    },
  },
  {
    id: "funds-generation",
    collection: "funds",
    name: "Funds Generation",
    description: `Increases the amount of funds generated from ${UIManager.formatValueWithSymbol(
      funds.generateAmount,
      funds.unitSymbol
    )} to ${UIManager.formatValueWithSymbol(funds.generateAmount * getChangeAmount(1, 0.15, funds.generateAmount, true), funds.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 2 },
      { resource: "energy", amount: 0.25 },
    ],
    level: 1,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      self.level++;

      let changeAmount = getChangeAmount(self.level, 0.15, funds.generateAmount, true);
      funds.generateAmount = changeAmount;

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.15, cost.amount, true);
        return cost;
      });

      self.name = `Funds Generation ${self.level}`;

      self.description = `Increases the amount of funds generated from ${UIManager.formatValueWithSymbol(
        funds.generateAmount,
        funds.unitSymbol
      )} to ${UIManager.formatValueWithSymbol(getChangeAmount(self.level, 0.15, funds.generateAmount, true), funds.unitSymbol)}`;
    },
  },
  {
    id: "energy-capacity",
    collection: "energy",
    name: "Energy Capacity",
    description: `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(getChangeAmount(1, 1, energy.capacity, true), energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 10 },
      { resource: "energy", amount: 10 },
    ],
    level: 1,
    dependsOn: [["energy", "energy-generation", 10]],
    onPurchase: (self: StoreItem) => {
      self.level++;
      energy.capacity = getChangeAmount(self.level, 1, energy.capacity, true);

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 1, cost.amount, true);
        return cost;
      });

      self.name = `Energy Capacity ${self.level}`;
      self.description = `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(
        getChangeAmount(self.level, 1, energy.capacity, true),
        energy.unitSymbol
      )}`;
    },
  },
  {
    id: "3",
    collection: "funds",
    name: `Funds Build Time`,
    description: `Decreases the amount of time it takes to generate funds by ${UIManager.formatValueWithSymbol(funds.buildTimeMs / 1000, {
      icon: "s",
      infront: false,
    })} to ${UIManager.formatValueWithSymbol(getChangeAmount(1, 0.15, funds.buildTimeMs, false), { icon: "s", infront: false })}`,
    costs: [
      { resource: "funds", amount: 20 },
      { resource: "energy", amount: 12.55 },
    ],
    level: 1,
    dependsOn: [["energy", "energy-generation", 10]],
    onPurchase: (self: StoreItem) => {
      self.level++;

      funds.buildTimeMs = getChangeAmount(self.level, 0.15, funds.buildTimeMs, false);

      if (funds.buildTimeMs <= 100) return;

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.15, cost.amount, true);
        return cost;
      });

      self.name = `Funds Build Time ${self.level}`;
      self.description = `Decreases the amount of time it takes to generate funds from ${UIManager.formatValueWithSymbol(funds.buildTimeMs / 1000, {
        icon: "s",
        infront: false,
      })} to ${UIManager.formatValueWithSymbol(getChangeAmount(self.level, 0.15, funds.buildTimeMs, true), { icon: "s", infront: false })}`;
    },
  },
  ,
]);

// strength: 0-1 value: 1 will reduce by 50% at level 1.
// tension: controls the depth function goes to. tension of 1 will result in 0 change, while 0 will allow the strength to function without restriction.
function getChangeAmount(level: number, strength: number = 0.15, prevNumber: number, up: boolean = true) {
  if (level < 1) {
    throw new Error("Level cannot be 0");
  }
  console.log(`level: ${level}, strength: ${strength}, prevNumber: ${prevNumber}`);

  return (prevNumber / Math.pow(up ? 1 + strength : 1 - strength, level - 1)) * Math.pow(up ? 1 + strength : 1 - strength, level);
}

new SaveManager(resources, pacingManager, store, { fundsFactory });

// DEV!!!! ---------------------------------------------------------------
let clickCount = 0;
let lastClickTime = 0;

document.getElementById("dev-hard-reset").addEventListener("click", function () {
  const currentTime = new Date().getTime();

  // Check if it's a triple click within 1 second
  if (currentTime - lastClickTime < 1000) {
    clickCount++;
    if (clickCount === 3) {
      localStorage.clear();

      // Reload the page
      location.reload();
    }
  } else {
    clickCount = 1;
  }

  lastClickTime = currentTime;
});
