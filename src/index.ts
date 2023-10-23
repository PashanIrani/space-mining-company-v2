import Resource from "./models/Resource";
import "7.css/dist/7.css";
import "./styles/index.scss";
import { Store, StoreItem } from "./models/Store";

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 1 * 100,
      buildDescriptions: ["Generating Energy..."],
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
      buildTimeMs: 500,
      buildDescriptions: ["Analyzing market...", "Executing plan...", "Generating funds..."],
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
    });
  }
}

const energy = new Energy();
const funds = new Funds();
const coffee = new Coffee();

new Store([
  {
    id: "1",
    collection: "energy",
    name: "Drink Coffee",
    description: "Drink le coffee",
    costs: [{ resource: "funds", amount: 1 }],
    level: 1,
    onPurchase: (self: StoreItem) => {
      console.log("PURCHASED!");
      if (energy.passiveGenAmount == 0) {
        energy.passiveGenAmount = 0.1;
      } else {
        energy.passiveGenAmount *= 1.1;
      }

      self.purchased = false;
      self.level++;
      self.name = `Drink Cofee ${self.level}`;
      self.costs = self.costs.map((cost) => {
        cost.amount *= 1.1;
        return cost;
      });
    },
  },
]);
