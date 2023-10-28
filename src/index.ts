import Resource from "./models/Resource";
import "7.css/dist/7.css";
import "./styles/index.scss";
import { Store, StoreItem } from "./models/Store";
import { Factory } from "./models/Factory";
import { PacingManager } from "./controllers/PacingManager";

const DEV = true;

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: 0.25,
      costs: [],
      buildTimeMs: DEV ? 100 : 1 * 1000,
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
      buildTimeMs: DEV ? 100 : 1 * 5000,
      buildDescriptions: ["Analyzing Market", "Executing Plan", "Generating Funds"],
      unitSymbol: { icon: "$", infront: true },
    });
  }
}

const energy = new Energy();
const funds = new Funds();

let energyFactor;

new Store([
  {
    id: "1",
    collection: "main",
    name: "Hand-Crank Generator",
    description: "Manual power source: Rotating handle generates energy.",
    costs: [
      { resource: "funds", amount: 10 },
      { resource: "energy", amount: 10 },
    ],
    level: 1,
    onPurchase: (self: StoreItem) => {
      energyFactor = new Factory(energy, [], 1);
    },
  },
]);

const pm = new PacingManager({ energy, funds });
