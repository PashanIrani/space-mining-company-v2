import Resource from "./models/Resource";
import "./styles/index.scss";

class Credits extends Resource {
  constructor() {
    super("credits", 0, 100, 1, [], 1 * 1000);
  }
}

class Quantum extends Resource {
  constructor() {
    super("quantum", 0, 100, 1, [{ resource: "credits", amount: 2 }], 2 * 1000);
  }
}

class Dark extends Resource {
  constructor() {
    super(
      "dark",
      0,
      100,
      1,
      [
        { resource: "credits", amount: 2 },
        { resource: "quantum", amount: 3 },
      ],
      3 * 1000
    );
  }
}

class Stellar extends Resource {
  constructor() {
    super(
      "stellar",
      0,
      100,
      1,
      [
        { resource: "dark", amount: 5 },
        { resource: "credits", amount: 5 },
        { resource: "quantum", amount: 3 },
      ],
      40 * 1000
    );
  }
}

new Credits();
new Quantum();
new Dark();
new Stellar();
