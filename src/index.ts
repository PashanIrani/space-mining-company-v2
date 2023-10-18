import Resource from "./models/Resource";
import "7.css/dist/7.css";
import "./styles/index.scss";

class Energy extends Resource {
  constructor() {
    super("energy", 0, 50, 1, [], 200);
  }
}

class Funds extends Resource {
  constructor() {
    super("funds", 0, null, 1, [{ resource: "energy", amount: 1 }], 1000 * 5);
  }
}

const energy = new Energy();
const funds = new Funds();

setInterval(() => {
  funds.amount += Math.random();
}, 100);
