import Resource from "./models/Resource";
import "./styles/index.scss";

class Energy extends Resource {
  constructor() {
    super("energy", 100, 100, 1, [], 5 * 1000);
  }
}

class Gold extends Resource {
  constructor() {
    super("gold", 0, null, 0.01, [{ resource: "energy", amount: 1 }], 500);
  }
}

new Energy();

new Gold();
