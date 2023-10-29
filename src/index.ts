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
      buildTimeMs: DEV ? 100 : 1 * 5000,
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
      costs: [{ resource: "energy", amount: 0.2 }],
      buildTimeMs: DEV ? 100 : 20 * 1000,
      buildDescriptions: ["Analyzing Market", "Executing Plan", "Generating Funds"],
      unitSymbol: { icon: "$", infront: true },
    });
  }
}

const energy = new Energy();
const funds = new Funds();

let energyFactory = new Factory(energy, [], 0);
let resources = { energy, funds };
const pacingManager = new PacingManager(resources);

let store = new Store([
  {
    id: "1",
    collection: "main",
    name: "OS Update",
    description: "Upgrades... Upgrades... Upgrades...",
    costs: [
      { resource: "funds", amount: 5 },
      { resource: "energy", amount: 10 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      pacingManager.showWindow("energy-upgrades");
    },
  },
  {
    id: "2",
    collection: "energy",
    name: "Quantum Energization Module",
    description: "Quantum Energization Module generates energy, its output finely tuned to efficiency.",
    costs: [
      { resource: "funds", amount: 5 },
      { resource: "energy", amount: 10 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      energyFactory.level = 1;
      pacingManager.showWindow("energy-factory");
    },
  },
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
