import Resource from "./models/Resource";

class Money extends Resource {
  constructor() {
    super("money", 0, 100, 1, [], 100);
  }
}

class Coal extends Resource {
  constructor() {
    super("coal", 0, 1000, 1, [{ resource: "money", amount: 2 }], 2 * 1000);
  }
}

class Coal2 extends Resource {
  constructor() {
    super(
      "coal2",
      0,
      1000,
      1,
      [
        { resource: "money", amount: 2 },
        { resource: "coal", amount: 4 },
      ],
      1 * 1000
    );
  }
}
const money = new Money();
const coal = new Coal();
const coal2 = new Coal2();
