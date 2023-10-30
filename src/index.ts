import Resource from "./Resource";
import "7.css/dist/7.css";
import "./styles/index.scss";
import { Store, StoreItem } from "./Store";
import { Factory } from "./Factory";
import { PacingManager } from "./PacingManager";
import { SaveManager } from "./SaveManager";

const DEV = false;

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 100,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 50,
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
      generateAmount: 1,
      costs: [{ resource: "energy", amount: 15 }],
      buildTimeMs: 10 * 1000,
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
      { resource: "energy", amount: 95 },
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
    description: "lalalala",
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
    description: "lalalala",
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
    name: "Energy Gen Amount Increase",
    description: "lalalala",
    costs: [
      { resource: "funds", amount: 0.045 },
      { resource: "energy", amount: 0.23 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      energy.generateAmount *= 1.1;

      self.purchased = false;
      self.level++;
      self.name = `funds faster gen ${self.level}`;
      self.costs = self.costs.map((cost) => {
        cost.amount *= 1.25;
        return cost;
      });
    },
  },
  {
    id: "3",
    collection: "funds",
    name: "Faster generation",
    description: "Quantum Energization Module generates energy, its output finely tuned to efficiency.",
    costs: [
      { resource: "funds", amount: 1 },
      { resource: "energy", amount: 1 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      funds.buildTimeMs *= 0.5;

      self.purchased = false;
      self.level++;
      self.name = `funds faster gen ${self.level}`;
      self.costs = self.costs.map((cost) => {
        cost.amount *= 1.1;
        return cost;
      });
    },
  },
  ,
]);

new SaveManager(resources, pacingManager, store, { energyFactory });

// DEV!!!!

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
