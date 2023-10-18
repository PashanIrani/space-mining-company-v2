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
      buildTimeMs: 10 * 1000,
      buildDescriptions: ["Boiling water...", "Brewing coffee...", "Preparing cup...", "Ingesting coffee..."],
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

const energy = new Energy();
const funds = new Funds();

setInterval(() => {
  energy.amount += 0.01;
}, 100);
