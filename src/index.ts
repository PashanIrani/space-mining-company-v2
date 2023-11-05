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
      generateAmount: DEV ? 50 : 1,
      costs: [],
      buildTimeMs: 100,
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
    id: "1",
    collection: "main",
    name: "OS Update",
    description: "Upgrades... Upgrades... Upgrades...",
    costs: [
      { resource: "funds", amount: 2.99 },
      { resource: "energy", amount: 10 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      pacingManager.showWindow("system");
      pacingManager.showWindow("energy-upgrades");
      pacingManager.showWindow("funds-upgrades");
    },
  },
  {
    id: "2",
    collection: "funds",
    name: "Funds Factory",
    description: "Generates Funds Passively",
    costs: [
      { resource: "funds", amount: 1000 },
      { resource: "energy", amount: 250 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      fundsFactory.level = 1;
      pacingManager.showWindow("funds-factory");
    },
  },

  // {
  //   id: "2-1",
  //   collection: "energy",
  //   name: "Energy Factory",
  //   description: "Generates Energy Passively",
  //   costs: [
  //     { resource: "funds", amount: 50 },
  //     { resource: "energy", amount: 100 },
  //   ],
  //   level: 1,
  //   onPurchase: (self: StoreItem) => {
  //     // energyFactory.level = 1;
  //     // pacingManager.showWindow("energy-factory");
  //   },
  // },

  {
    id: "2-1",
    collection: "energy",
    name: "Energy Generation",
    description: `Increases the amount of energy generated from ${UIManager.formatValueWithSymbol(
      energy.generateAmount,
      energy.unitSymbol
    )} to ${UIManager.formatValueWithSymbol(energy.generateAmount * (1 / getDiminisingReturnsAmount(1, 0.9, 0.6)), energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 2 },
      { resource: "energy", amount: 0.25 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      let changeAmount = 1 / getDiminisingReturnsAmount(self.level, 0.9, 0.6);
      energy.generateAmount *= changeAmount;

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount *= 1 / getDiminisingReturnsAmount(self.level, 0.9, 0.7);
        return cost;
      });

      self.level++;

      self.name = `Energy Generation ${self.level}`;

      self.description = `Increases the amount of energy generated from ${UIManager.formatValueWithSymbol(
        energy.generateAmount,
        energy.unitSymbol
      )} to ${UIManager.formatValueWithSymbol(energy.generateAmount * (1 / getDiminisingReturnsAmount(self.level, 0.9, 0.6)), energy.unitSymbol)}`;
    },
  },
  {
    id: "2-1-yttr",
    collection: "funds",
    name: "Funds Generation",
    description: `Increases the amount of funds generated from ${UIManager.formatValueWithSymbol(
      funds.generateAmount,
      funds.unitSymbol
    )} to ${UIManager.formatValueWithSymbol(funds.generateAmount * (1 / getDiminisingReturnsAmount(1, 0.9, 0.3)), energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 2 },
      { resource: "energy", amount: 0.25 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      let changeAmount = 1 / getDiminisingReturnsAmount(self.level, 0.9, 0.3);
      funds.generateAmount *= changeAmount;

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount *= 1 / getDiminisingReturnsAmount(self.level, 0.9, 0.65);
        return cost;
      });

      self.level++;

      self.name = `Funds Generation ${self.level}`;

      self.description = `Increases the amount of funds generated from ${UIManager.formatValueWithSymbol(
        funds.generateAmount,
        funds.unitSymbol
      )} to ${UIManager.formatValueWithSymbol(funds.generateAmount * (1 / getDiminisingReturnsAmount(self.level, 0.9, 0.3)), funds.unitSymbol)}`;
    },
  },
  {
    id: "2-2",
    collection: "energy",
    name: "Energy Capacity",
    description: `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(energy.capacity * 10, energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 100 },
      { resource: "energy", amount: 10 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      energy.capacity *= 10;

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount *= 10;
        return cost;
      });

      self.level++;
      self.name = `Energy Capacity ${self.level}`;
      self.description = `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(energy.capacity * 10, energy.unitSymbol)}`;
    },
  },
  {
    id: "3",
    collection: "funds",
    name: `Funds Build Time`,
    description: `Decreases the amount of time it takes to generate funds by ${UIManager.formatValueWithSymbol(funds.buildTimeMs / 1000, {
      icon: "s",
      infront: false,
    })} to ${UIManager.formatValueWithSymbol((funds.buildTimeMs * getDiminisingReturnsAmount(2, 0.95, 0.8)) / 1000, { icon: "s", infront: false })}`,
    costs: [
      { resource: "funds", amount: 20 },
      { resource: "energy", amount: 12.55 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      funds.buildTimeMs *= getDiminisingReturnsAmount(self.level, 0.95, 0.8);

      if (funds.buildTimeMs <= 100) return;

      self.purchased = false;

      self.costs = self.costs.map((cost) => {
        cost.amount *= 1 / getDiminisingReturnsAmount(self.level, 0.95, 0.8);
        return cost;
      });

      self.level++;

      self.name = `Funds Build Time ${self.level}`;
      self.description = `Decreases the amount of time it takes to generate funds from ${UIManager.formatValueWithSymbol(funds.buildTimeMs / 1000, {
        icon: "s",
        infront: false,
      })} to ${UIManager.formatValueWithSymbol((funds.buildTimeMs * getDiminisingReturnsAmount(self.level, 0.95, 0.8)) / 1000, { icon: "s", infront: false })}`;
    },
  },
  ,
]);

// strength: 0-1 value: 1 will reduce by 50% at level 1.
// tension: controls the depth function goes to. tension of 1 will result in 0 change, while 0 will allow the strength to function without restriction.
function getDiminisingReturnsAmount(level: number, strength: number, tension: number) {
  //=1/ROW(C1)
  const levelEffect = 1 / (level + 1); // will get smaller as level increases

  //=(0.9 * (1 - C1)) + ((1 - (0.9 * (1 - C1))) * 0.95)
  return strength * (1 - levelEffect) + (1 - strength * (1 - levelEffect)) * tension;
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
