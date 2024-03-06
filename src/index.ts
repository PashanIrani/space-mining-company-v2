import Resource, { AllResourcesObject, Cost } from "./Resource";

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

const DEV = false;

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: 1,
      costs: [],
      buildTimeMs: DEV ? 10 : 100,
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
      costs: [{ resource: "energy", amount: 5 }],
      buildTimeMs: DEV ? 100 : 5000,
      buildDescriptions: ["Analyzing Market", "Executing Plan", "Generating Funds"],
      unitSymbol: { icon: "$", infront: true },
    });
  }
}

class Metals extends Resource {
  constructor() {
    super({
      label: "metals",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "lbs", infront: false },
    });
  }
}

class Water extends Resource {
  constructor() {
    super({
      label: "water",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "l", infront: true },
    });
  }
}

class CarbonCompounds extends Resource {
  constructor() {
    super({
      label: "carbonCompounds",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "cc", infront: true },
    });
  }
}

class SocialCredit extends Resource {
  constructor() {
    super({
      label: "socialcredit",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "❉", infront: false },
    });
  }
}

const energy = new Energy();
const funds = new Funds();
const staff = new StaffResource();
const metals = new Metals();
const water = new Water();
const carbonCompounds = new CarbonCompounds();
const socialcredit = new SocialCredit();
const astroids = new AstroidResource({ metals, water, carbonCompounds }, staff);

let resources: AllResourcesObject = { energy, funds, staff, astroids, metals, water, carbonCompounds, socialcredit };
Factory.ALL_RESOURCES = resources;

let energyFactory = new Factory(energy, [{ resource: "socialcredit", amount: 1 }], 0, 0.1);
let fundsFactory = new Factory(funds, [{ resource: "socialcredit", amount: 1 }], 0, 0.01);

const pacingManager = new PacingManager(resources);

let slot1MissionDetails = generateMissionNameAndCost();
let slot2MissionDetails = generateMissionNameAndCost();

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
    name: "Operation Queues",
    description: `Enables you to schedule up to 2 builds.`,
    costs: [{ resource: "funds", amount: 5 }],
    level: 0,
    maxLevel: 10,
    dependsOn: [["main", "first-purchase", 0]],
    onPurchase: (self: StoreItem) => {
      // Update buildCapacities for all resources
      Object.keys(resources).forEach((resourceKey) => {
        resources[resourceKey].buildQueueCapacity += 1;
      });

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 5.75, cost.amount, true);
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
    description: `Enables you to locate astroids.`,
    costs: [
      { resource: "funds", amount: 100 },
      { resource: "energy", amount: 15 },
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
    name: "Staff Recruitment",
    description: `Enables you to recruit staff (space miners).`,
    costs: [
      { resource: "funds", amount: 750 },
      { resource: "energy", amount: 35 },
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
      { resource: "energy", amount: 2.58 },
    ],
    level: 0,
    // maxLevel: 10,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      let startingLevel = 1,
        cap = 0.15,
        step = 0.025;
      startingLevel -= step * (self.level - 1); // minus by one to get last level's amount.
      startingLevel = startingLevel < cap ? cap : startingLevel; // Cap

      self.description = `Increases the amount of funds generated by ${((startingLevel - step) * 100).toFixed(2)}%`;

      let changeAmount = getChangeAmount(self.level, startingLevel, funds.generateAmount, true);
      funds.generateAmount = changeAmount;

      self.costs = self.costs.map((cost) => {
        if (cost.resource === "funds") {
          cost.amount = getChangeAmount(self.level, startingLevel * 1.5, cost.amount, true);
        } else {
          cost.amount = getChangeAmount(self.level, startingLevel * 0.3, cost.amount, true);
        }
        return cost;
      });
    },
  },
  {
    sortOrder: 2,
    id: "funds-factory",
    collection: "funds",
    name: "Passive Income",
    description: "Generates Funds Passively",
    costs: [
      { resource: "funds", amount: 10000 },
      { resource: "energy", amount: 55 },
    ],
    level: 0,
    maxLevel: 1,
    dependsOn: [["funds", "funds-generation", 5]],
    onPurchase: (self: StoreItem) => {
      fundsFactory.level = 1;
      pacingManager.showWindow("funds-factory");
    },
  },
  {
    sortOrder: 3,
    id: "energy-factory",
    collection: "energy",
    name: "Solar Fabrication",
    description: "Generates Energy Passively",
    costs: [
      { resource: "funds", amount: 10 },
      { resource: "energy", amount: 10 },
    ],
    level: 0,
    maxLevel: 1,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      energyFactory.level = 1;
      pacingManager.showWindow("energy-factory");
    },
  },
  // {
  //   sortOrder: 1,
  //   id: "energy-generation",
  //   collection: "energy",
  //   name: "Energy Generation",
  //   description: `Increases the amount of energy generated by ${(35).toFixed(2)}%`,
  //   costs: [
  //     { resource: "funds", amount: 5 },
  //     { resource: "energy", amount: 5 },
  //   ],
  //   level: 0,
  //   maxLevel: 55,
  //   dependsOn: [],
  //   onPurchase: (self: StoreItem) => {
  //     let startingLevel = 0.35,
  //       cap = 0.01,
  //       step = 0.0001;
  //     startingLevel -= (self.level - 1) * step; // minus by one to get last level's amount.
  //     startingLevel = startingLevel < cap ? cap : startingLevel; // Cap

  //     self.description = `Increases the amount of energy generated by ${((startingLevel - step) * 100).toFixed(2)}%`;

  //     let changeAmount = getChangeAmount(self.level, startingLevel, energy.generateAmount, true);
  //     energy.generateAmount = changeAmount;

  //     self.costs = self.costs.map((cost) => {
  //       cost.amount = getChangeAmount(self.level, startingLevel * 1.85, cost.amount, true); // max change is 0.75, since starting level will be 0.1 as max
  //       return cost;
  //     });
  //   },
  // },
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
    maxLevel: 10,
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
  {
    sortOrder: 1,
    id: "astroid-capacity",
    collection: "astroid",
    name: "Astroid Capacity",
    description: `Increase max capacity of astroid to ${UIManager.formatValueWithSymbol(getChangeAmount(1, 1, astroids.capacity, true), astroids.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 1000 },
      { resource: "energy", amount: 20 },
    ],
    level: 0,
    maxLevel: 10,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      astroids.capacity = getChangeAmount(self.level, 1, astroids.capacity, true);

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.95, cost.amount, true);
        return cost;
      });

      self.description = `Increase max capacity of astroids to ${UIManager.formatValueWithSymbol(
        getChangeAmount(self.level, 1, astroids.capacity, true),
        astroids.unitSymbol
      )}`;
    },
  },
  {
    sortOrder: 1,
    id: "staff-capacity",
    collection: "staff",
    name: "staff Capacity",
    description: `Increase max capacity of staff to ${UIManager.formatValueWithSymbol(getChangeAmount(1, 1, staff.capacity, true), staff.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 100 },
      { resource: "energy", amount: 10 },
    ],
    level: 0,
    maxLevel: 10,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      staff.capacity = getChangeAmount(self.level, 1, staff.capacity, true);

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.95, cost.amount, true);
        return cost;
      });

      self.description = `Increase max capacity of staff to ${UIManager.formatValueWithSymbol(
        getChangeAmount(self.level, 1, staff.capacity, true),
        staff.unitSymbol
      )}`;
    },
  },
  {
    sortOrder: 1,
    id: "mission-solt1",
    collection: "missions",
    name: slot1MissionDetails.missionName,
    description: `Do mission`,
    costs: slot1MissionDetails.cost,
    level: 0,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      let missionDetails = generateMissionNameAndCost();
      self.name = missionDetails.missionName;
      self.costs = missionDetails.cost;

      socialcredit.amount += 2;
    },
  },
  {
    sortOrder: 2,
    id: "mission-solt2",
    collection: "missions",
    name: slot2MissionDetails.missionName,
    description: `Do mission`,
    costs: slot2MissionDetails.cost,
    level: 0,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      let missionDetails = generateMissionNameAndCost();
      self.name = missionDetails.missionName;
      self.costs = missionDetails.cost;

      socialcredit.amount += 2;
    },
  },
]);

function generateMissionNameAndCost(): { missionName: string; cost: Cost[] } {
  const missionTypes = ["Exploration", "Extraction", "Delivery", "Rescue", "Recovery", "Research"];
  const resourceTypes = [water, metals, carbonCompounds];

  // Choose a random mission type
  const randomMissionType = missionTypes[Math.floor(Math.random() * missionTypes.length)];

  // Shuffle resource types to randomize which resources will be needed
  const shuffledResources = resourceTypes.sort(() => Math.random() - 0.5);

  // Determine how many resource types are needed (1, 2, or 3)
  const numResourcesNeeded = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3

  // Select the first `numResourcesNeeded` resources
  const resourcesNeeded = shuffledResources.slice(0, numResourcesNeeded);

  // Generate mission name based on the selected mission type and resource types
  let missionName = `${randomMissionType} Mission`;
  let cost: Cost[] = [];

  // Add resource types to the mission name and determine their costs
  resourcesNeeded.forEach((resourceType) => {
    let amount = Math.floor(Math.random() * 10) + 5; // Random amount between 5 and 14
    missionName += ` for ${resourceType.label}`;
    cost.push({ resource: resourceType.label, amount });
  });

  return { missionName, cost };
}

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
