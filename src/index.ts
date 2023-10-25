import Resource from "./models/Resource";
import "7.css/dist/7.css";
import "./styles/index.scss";
import { Store, StoreItem } from "./models/Store";
import { Factory } from "./models/Factory";

const DEV = true;

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: 1,
      costs: [],
      buildTimeMs: DEV ? 100 : 1 * 900,
      buildDescriptions: ["Generating Energy..."],
      symbol: "e",
      symbolLeftSide: false,
    });
  }
}

class Funds extends Resource {
  constructor() {
    super({
      label: "funds",
      initialAmount: 0,
      generateAmount: 1,
      costs: [{ resource: "energy", amount: 10 }],
      buildTimeMs: DEV ? 1000 : 1000 * 15,
      buildDescriptions: ["Analyzing market...", "Executing plan...", "Generating funds..."],
      symbol: "$",
      symbolLeftSide: true,
    });
  }
}

class Coffee extends Resource {
  constructor() {
    super({
      label: "coffee",
      initialAmount: 0,
      generateAmount: 1,
      capacity: 3,
      costs: [
        { resource: "energy", amount: 2 },
        { resource: "funds", amount: 4 },
      ],
      buildTimeMs: 1000,
      buildDescriptions: ["Boiling water...", "Brewing coffee...", "Preparing cup...", "AYO"],
      symbol: "",
      symbolLeftSide: false,
    });
  }
}

const energy = new Energy();
const funds = new Funds();
const coffee = new Coffee();

// Hand-Crank Generator
// Thermoelectric generator
new Store([
  {
    id: "1",
    collection: "energy",
    name: "Hand-Crank Generator",
    description: "Manual power source: Rotating handle generates energy.",
    costs: [
      { resource: "funds", amount: 0.01 },
      { resource: "energy", amount: 0.1 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      self.purchased = false; // set false so this can show up again
      self.level++;
      self.name = `Hand-Crank Generator ${self.level}`;

      self.costs = self.costs.map((cost) => {
        if (cost.resource == "energy") return cost;

        cost.amount *= 1.1;
        return cost;
      });
    },
  },
  {
    id: "2",
    collection: "energy",
    name: "HEHE",
    description: "Manual power e energy.",
    costs: [
      { resource: "funds", amount: 0.01 },
      { resource: "energy", amount: 0.1 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      self.purchased = false; // set false so this can show up again
      self.level++;
      self.name = `dsd ${self.level}`;

      self.costs = self.costs.map((cost) => {
        cost.amount *= 1.1;
        return cost;
      });
    },
  },
]);

new Factory(energy, [{ resource: "energy", amount: 0.1 }]);
new Factory(coffee, []);
