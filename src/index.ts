import Resource from "./Resource";
import "../node_modules/xp.css/dist/xp.css";
import "./styles/index.scss";
import { Store, StoreItem } from "./Store";
import { Factory } from "./Factory";
import { PacingManager } from "./PacingManager";
import { SaveManager } from "./SaveManager";
import "./Tab.js";
import UIManager from "./UIManager";

const DEV = false;

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 100,
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
      costs: [{ resource: "energy", amount: 5 }],
      buildTimeMs: DEV ? 1000 : 10 * 1000,
      buildDescriptions: ["Analyzing Market", "Executing Plan", "Generating Funds"],
      unitSymbol: { icon: "$", infront: true },
    });
  }
}

const energy = new Energy();
const funds = new Funds();

let energyFactory = new Factory(energy, [], 0);
let fundsFactory = new Factory(funds, [{ resource: "energy", amount: 15 }], 0);
let resources = { energy, funds };
const pacingManager = new PacingManager(resources);

let store = new Store([
  {
    id: "1",
    collection: "main",
    name: "OS Update",
    description: "Upgrades... Upgrades... Upgrades...",
    costs: [
      { resource: "funds", amount: 4.99 },
      { resource: "energy", amount: 100 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      pacingManager.showWindow("energy-upgrades");
      pacingManager.showWindow("funds-upgrades");
    },
  },
  {
    id: "2",
    collection: "funds",
    name: "Funds Factory",
    description: "Generates <u><b>Funds<b></u> Passively",
    costs: [
      { resource: "funds", amount: 3 },
      { resource: "energy", amount: 100 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      fundsFactory.level = 1;
      pacingManager.showWindow("funds-factory");
    },
  },

  {
    id: "2-1",
    collection: "energy",
    name: "Energy Factory",
    description: "Generates Energy Passively",
    costs: [
      { resource: "funds", amount: 3 },
      { resource: "energy", amount: 100 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      energyFactory.level = 1;
      pacingManager.showWindow("energy-factory");
    },
  },

  {
    id: "2-1",
    collection: "energy",
    name: "Energy Generation",
    description: `Increases the amount of energy generated from ${UIManager.formatValueWithSymbol(
      energy.generateAmount,
      energy.unitSymbol
    )} to ${UIManager.formatValueWithSymbol(energy.generateAmount * 1.1, energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 0.045 },
      { resource: "energy", amount: 0.23 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      energy.generateAmount *= 1.1;

      self.purchased = false;
      self.level++;
      self.name = `Energy Generation ${self.level}`;
      self.description = `Increases the amount of energy generated from ${UIManager.formatValueWithSymbol(
        energy.generateAmount,
        energy.unitSymbol
      )} to ${UIManager.formatValueWithSymbol(energy.generateAmount * 1.1, energy.unitSymbol)}`;
      self.costs = self.costs.map((cost) => {
        cost.amount *= 1.25;
        return cost;
      });
    },
  },
  {
    id: "2-2",
    collection: "energy",
    name: "Energy Capacity",
    description: `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(energy.capacity * 2.25, energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 50 },
      { resource: "energy", amount: 100 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      energy.capacity *= 2.25;

      self.purchased = false;
      self.level++;
      self.name = `Energy Capacity ${self.level}`;
      self.description = `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(energy.capacity * 2.25, energy.unitSymbol)}`;
      self.costs = self.costs.map((cost) => {
        cost.amount *= 2.25;
        return cost;
      });
    },
  },
  {
    id: "3",
    collection: "funds",
    name: `Funds Build Time`,
    description: `Decreases the amount of time it takes to generate funds from ${UIManager.formatValueWithSymbol(funds.buildTimeMs / 1000, {
      icon: "s",
      infront: false,
    })} to ${UIManager.formatValueWithSymbol((funds.buildTimeMs * getDiminisingReturnsAmount(2, 0.95, 0.8)) / 1000, { icon: "s", infront: false })}`,
    costs: [
      { resource: "funds", amount: 0.1 },
      { resource: "energy", amount: 11 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      funds.buildTimeMs *= getDiminisingReturnsAmount(self.level, 0.95, 0.8);

      if (funds.buildTimeMs <= 100) return;

      self.purchased = false;
      self.level++;
      self.name = `Funds Build Time ${self.level}`;
      self.description = `Decreases the amount of time it takes to generate funds from ${UIManager.formatValueWithSymbol(funds.buildTimeMs / 1000, {
        icon: "s",
        infront: false,
      })} to ${UIManager.formatValueWithSymbol((funds.buildTimeMs * getDiminisingReturnsAmount(self.level, 0.95, 0.8)) / 1000, { icon: "s", infront: false })}`;

      self.costs = self.costs.map((cost) => {
        cost.amount *= 1 / getDiminisingReturnsAmount(self.level, 0.95, 0.8);
        return cost;
      });
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

// function getDiminisingIncreaseReturns(level: number, strength: number, tension: number) {
//   //=1/ROW(C1)
//   const levelEffect = 1 / (level + 1); // will get smaller as level increases

//   //=(0.9 * (1 - C1)) + ((1 - (0.9 * (1 - C1))) * 0.95)
//   return strength * (1 - levelEffect) + (1 - strength * (1 - levelEffect)) * tension;
// }

new SaveManager(resources, pacingManager, store, { energyFactory });

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
