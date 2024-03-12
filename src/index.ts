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
import { getChangeAmount } from "./Helpers";
import { generateMissionNameAndCost } from "./Helpers";
import config from "./config";

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: config.DEV ? 100 : 1,
      costs: [],
      buildTimeMs: config.DEV ? 10 : 500,
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
      generateAmount: config.DEV ? 100000 : 1,
      costs: [{ resource: "energy", amount: 5 }],
      buildTimeMs: config.DEV ? 100 : 4000,
      buildDescriptions: ["Analyzing Market", "Executing Plan", "Generating Funds"],
      unitSymbol: { icon: "$", infront: true },
    });
  }
}

class RawMetals extends Resource {
  constructor() {
    super({
      label: "raw_metals",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "🔗", infront: false },
    });
  }
}

class WaterIce extends Resource {
  constructor() {
    super({
      label: "water_ice",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "💧", infront: false },
    });
  }
}

class CarbonaceousMaterial extends Resource {
  constructor() {
    super({
      label: "carbonaceous_material",
      initialAmount: 0,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 10000,
      buildDescriptions: [],
      unitSymbol: { icon: "🌿", infront: false },
    });
  }
}

class SocialCredit extends Resource {
  constructor() {
    super({
      label: "social_credit",
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
export const rawMetals = new RawMetals();
export const waterIce = new WaterIce();
export const carbonaceousMaterial = new CarbonaceousMaterial();
const socialcredit = new SocialCredit();
const astroids = new AstroidResource({ raw_metals: rawMetals, water_ice: waterIce, carbonaceous_material: carbonaceousMaterial }, staff);

let resources: AllResourcesObject = {
  energy,
  funds,
  staff,
  astroids,
  raw_metals: rawMetals,
  water_ice: waterIce,
  carbonaceous_material: carbonaceousMaterial,
  socialcredit,
};
Factory.ALL_RESOURCES = resources;

let energyFactory = new Factory(energy, [{ resource: "social_credit", amount: 1 }], 0, 0.1);
let fundsFactory = new Factory(funds, [{ resource: "social_credit", amount: 1 }], 0, 0.01);

const pacingManager = new PacingManager(resources);

let slot1MissionDetails = generateMissionNameAndCost();
let slot2MissionReward = Math.round(Math.random() * 4 + 1);
let slot2MissionDetails = generateMissionNameAndCost(slot2MissionReward);
let slot2FundReward = JSON.parse(localStorage.getItem("slot2FundReward")) || 0;

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
      { resource: "funds", amount: 200 },
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
  {
    sortOrder: 1,
    id: "astroid-capacity",
    collection: "astroid",
    name: "Astroid Capacity",
    description: `Increase max capacity of astroid to ${UIManager.formatValueWithSymbol(getChangeAmount(1, 1, astroids.capacity, true), astroids.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 1000 },
      { resource: "energy", amount: 40 },
    ],
    level: 0,
    maxLevel: 10,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      astroids.capacity += 1;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.05, cost.amount, true);
        return cost;
      });

      self.description = `Increase max capacity of astroids to ${UIManager.formatValueWithSymbol(astroids.capacity + 1, astroids.unitSymbol)}`;
    },
  },
  {
    sortOrder: 1,
    id: "staff-capacity",
    collection: "staff",
    name: "Staff Capacity",
    description: `Increase max capacity of staff to ${UIManager.formatValueWithSymbol(getChangeAmount(1, 1, staff.capacity, true), staff.unitSymbol)}`,
    costs: [
      { resource: "funds", amount: 321 },
      { resource: "energy", amount: 20 },
    ],
    level: 0,
    dependsOn: [],
    onPurchase: (self: StoreItem) => {
      staff.capacity += 1;

      self.costs = self.costs.map((cost) => {
        cost.amount = getChangeAmount(self.level, 0.02, cost.amount, true);
        return cost;
      });

      self.description = `Increase max capacity of staff to ${UIManager.formatValueWithSymbol(staff.capacity + 1, staff.unitSymbol)}`;
    },
  },
  {
    sortOrder: 1,
    id: "mission-solt1",
    collection: "missions",
    name: slot1MissionDetails.missionName,
    description: `Reward: 1 Social Credit`,
    costs: slot1MissionDetails.cost,
    level: 0,
    dependsOn: [],
    missionFormat: true,
    onPurchase: (self: StoreItem) => {
      let missionDetails = generateMissionNameAndCost();
      self.name = missionDetails.missionName;
      self.costs = missionDetails.cost;

      socialcredit.amount += 1;
    },
  },
  {
    sortOrder: 2,
    id: "mission-solt2",
    collection: "missions",
    name: slot2MissionDetails.missionName,
    description: `Reward: ${slot2MissionReward} Social Credit`,
    costs: slot2MissionDetails.cost,
    level: 0,
    dependsOn: [],
    missionFormat: true,
    onPurchase: (self: StoreItem) => {
      let reward = Math.round(Math.random() * 4 + 1);

      let missionDetails = generateMissionNameAndCost(reward);
      self.name = missionDetails.missionName;
      self.costs = missionDetails.cost;

      socialcredit.amount += reward;
      funds.amount += slot2FundReward;

      if (Math.random() <= 0.62) {
        slot2FundReward = Math.random() * funds.generateAmount * funds.buildQueueCapacity * reward;

        localStorage.setItem("slot2FundReward", slot2FundReward + "");
        self.description = `Reward: ${reward} Social Credit, ${UIManager.formatValueWithSymbol(slot2FundReward, funds.unitSymbol)} Funds`;
      } else {
        slot2FundReward = 0;
        self.description = `Reward: ${reward} Social Credit`;
      }
    },
  },
]);

new SaveManager(resources, pacingManager, store, { fundsFactory: energyFactory }, staff, astroids);

// config.DEV!!!! ---------------------------------------------------------------
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
