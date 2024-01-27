import Resource, { AllResourcesObject } from "./Resource";

import { Store, StoreItem } from "./Store";
import { Factory } from "./Factory";
import { PacingManager } from "./PacingManager";
import { SaveManager } from "./SaveManager";
import "./Tab.js";
import UIManager from "./UIManager";
import "./styles";
import { Globals } from "./Globals";
import { StaffResource } from "./Staff";
import { AstroidResource } from "./Astroid";

const DEV = true;

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: 1,
      costs: [],
      buildTimeMs: DEV ? 10 : 1000,
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
      costs: [{ resource: "energy", amount: 1 }],
      buildTimeMs: DEV ? 100 : 10000,
      buildDescriptions: ["Analyzing Market", "Executing Plan", "Generating Funds"],
      unitSymbol: { icon: "$", infront: true },
    });
  }
}

class Dirt extends Resource {
  constructor() {
    super({
      label: "dirt",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "Dirt", infront: false },
    });
  }
}

class Gold extends Resource {
  constructor() {
    super({
      label: "gold",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "G$", infront: true },
    });
  }
}

const energy = new Energy();
const funds = new Funds();
const staff = new StaffResource();
const dirt = new Dirt();
const gold = new Gold();
const astroids = new AstroidResource({ dirt, gold }, staff);

let resources: AllResourcesObject = { energy, funds, staff, astroids, dirt, gold };
Factory.ALL_RESOURCES = resources;

let energyFactory = new Factory(energy, [], 0);

const pacingManager = new PacingManager(resources);

let store = new Store([
  {
    sortOrder: 1,
    id: "first-purchase",
    collection: "main",
    name: "OS Update",
    description: "Upgrades... Upgrades... Upgrades...",
    costs: [
      { resource: "funds", amount: 1.5 },
      { resource: "energy", amount: 10 },
    ],
    level: 0,
    maxLevel: 1,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      pacingManager.showWindow("system");
      pacingManager.showWindow("energy-upgrades");
      pacingManager.showWindow("funds-upgrades");
    },
  },
  // {
  //   sortOrder: 2,
  //   id: "cosmic-blessing-enable",
  //   collection: "main",
  //   name: "Cosmic Blessing",
  //   description: "Amplifies resource yields in accordance with cosmic alignment (Up to a 35% surge).",
  //   costs: [
  //     { resource: "funds", amount: 1000 },
  //     { resource: "energy", amount: 250 },
  //   ],
  //   level: 0,
  //   maxLevel: 1,
  //   dependsOn: [["main", "first-purchase", 0]],
  //   onPurchase: (self: StoreItem) => {
  //     Globals._maxCosmicBlessing = 0.35;
  //     pacingManager.showWindow("cosmic-stat");
  //   },
  // },
  {
    sortOrder: 3,
    id: "queue-purchase",
    collection: "main",
    name: "Queues",
    description: `Enables you to schedule up to 2 builds.`,
    costs: [
      { resource: "funds", amount: 50 },
      { resource: "energy", amount: 18 },
    ],
    level: 0,
    maxLevel: 10,
    dependsOn: [["main", "first-purchase", 0]],
    onPurchase: (self: StoreItem) => {
      // Update buildCapacities for all resources
      Object.keys(resources).forEach((resourceKey) => {
        resources[resourceKey].buildQueueCapacity += 1;
      });

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 1.75, cost.amount, true);
        return cost;
      });

      self.description = `Enables you to schedule up to ${resources["energy"].buildQueueCapacity + 1} builds.`;
    },
  },
  {
    sortOrder: 5,
    id: "astroid-purchase",
    collection: "main",
    name: "Astroid Finder",
    description: `sdfsdfsdfsf`,
    costs: [
      { resource: "funds", amount: 1 },
      { resource: "energy", amount: 1 },
    ],
    level: 0,
    maxLevel: 1,
    dependsOn: [["main", "first-purchase", 0]],
    onPurchase: (self: StoreItem) => {
      pacingManager.showWindow("astroid");
    },
  },

  {
    sortOrder: 4,
    id: "staff-purchase",
    collection: "main",
    name: "Staff Requirtment",
    description: `sdfsdfsdfsf`,
    costs: [
      { resource: "funds", amount: 1 },
      { resource: "energy", amount: 1 },
    ],
    level: 0,
    maxLevel: 1,
    dependsOn: [["main", "astroid-purchase", 0]],
    onPurchase: (self: StoreItem) => {
      pacingManager.showWindow("staff");
    },
  },
  {
    sortOrder: 1,
    id: "funds-generation",
    collection: "funds",
    name: "Funds Generation",
    description: `Increases the amount of funds generated by 100%`,
    costs: [
      { resource: "funds", amount: 1 },
      { resource: "energy", amount: 2 },
    ],
    level: 0,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      let startingLevel = 1,
        cap = 0.15,
        step = 0.025;
      startingLevel -= step * (self.level - 1); // minus by one to get last level's amount.
      startingLevel = startingLevel < cap ? cap : startingLevel; // Cap

      self.description = `Increases the amount of energy generated by ${((startingLevel - step) * 100).toFixed(2)}%`;

      let changeAmount = getChangeAmount(self.level, startingLevel, funds.generateAmount, true);
      funds.generateAmount = changeAmount;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, startingLevel * 0.3, cost.amount, true);
        return cost;
      });
    },
  },
  {
    sortOrder: 3,
    id: "energy-factory",
    collection: "energy",
    name: "Solar Fabrication",
    description: "Generates Energy Passively",
    costs: [
      { resource: "funds", amount: 450 },
      { resource: "energy", amount: 55 },
    ],
    level: 0,
    maxLevel: 1,
    dependsOn: [["energy", "energy-generation", 3]],
    onPurchase: (self: StoreItem) => {
      energyFactory.level = 1;
      pacingManager.showWindow("energy-factory");
    },
  },
  {
    sortOrder: 1,
    id: "energy-generation",
    collection: "energy",
    name: "Energy Generation",
    description: `Increases the amount of energy generated by ${(10).toFixed(2)}%`,
    costs: [
      { resource: "funds", amount: 5 },
      { resource: "energy", amount: 5 },
    ],
    level: 0,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      let startingLevel = 0.1,
        cap = 0.01,
        step = 0.0001;
      startingLevel -= (self.level - 1) * step; // minus by one to get last level's amount.
      startingLevel = startingLevel < cap ? cap : startingLevel; // Cap

      self.description = `Increases the amount of energy generated by ${((startingLevel - step) * 100).toFixed(2)}%`;

      let changeAmount = getChangeAmount(self.level, startingLevel, energy.generateAmount, true);
      energy.generateAmount = changeAmount;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, startingLevel * 1.85, cost.amount, true); // max change is 0.75, since starting level will be 0.1 as max
        return cost;
      });
    },
  },
  {
    sortOrder: 2,
    id: "energy-capacity",
    collection: "energy",
    name: "Energy Capacity",
    description: `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(getChangeAmount(1, 1, energy.capacity, true), energy.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 5 },
      { resource: "energy", amount: 9.5 },
    ],
    level: 0,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      energy.capacity = getChangeAmount(self.level, 1, energy.capacity, true);

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.95, cost.amount, true);
        return cost;
      });

      self.description = `Increase max capacity of energy to ${UIManager.formatValueWithSymbol(
        getChangeAmount(self.level, 1, energy.capacity, true),
        energy.unitSymbol
      )}`;
    },
  },
]);

// strength: 0-1 value: 1 will reduce by 50% at level 1.
// tension: controls the depth function goes to. tension of 1 will result in 0 change, while 0 will allow the strength to function without restriction.
function getChangeAmount(level: number, strength: number = 0.15, prevNumber: number, up: boolean = true) {
  if (level < 1) {
    throw new Error("Level cannot be 0");
  }

  return (prevNumber / Math.pow(up ? 1 + strength : 1 - strength, level - 1)) * Math.pow(up ? 1 + strength : 1 - strength, level);
}

new SaveManager(resources, pacingManager, store, { fundsFactory: energyFactory }, staff, astroids);

// Globals.initCosmicBlessing(resources);

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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('button[aria-label="Minimize"]').forEach((helpButton) => {
    helpButton.addEventListener("click", function () {
      // Get the target id from the data-target attribute
      var targetId = this.getAttribute("data-target");

      // Get the corresponding help text element
      var helpText = document.getElementById(targetId);

      // Toggle the visibility of the help text
      if (helpText) {
        helpText.style.display = helpText.style.display === "block" || helpText.style.display === "" ? "none" : "block";
      }
    });
  });
});
