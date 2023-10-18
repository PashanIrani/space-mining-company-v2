import Resource from "./models/Resource";
import "7.css/dist/7.css";
import "./styles/index.scss";

class Energy extends Resource {
  constructor() {
    super({
      label: "energy",
      initialAmount: 0,
      capacity: 10,
      generateAmount: 1,
      costs: [],
      buildTimeMs: 1 * 1000,
      buildDescriptions: ["A", "B", "C", "D"],
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
      buildTimeMs: 1000 * 5,
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
      buildTimeMs: 1000 * 60 * 2,
      buildDescriptions: ["Boiling water...", "Brewing coffee...", "Preparing cup...", ""],
    });
  }
}

const energy = new Energy();
const funds = new Funds();
const coffee = new Coffee();
