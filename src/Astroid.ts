import { femaleNames, lastNames, maleNames } from "./Names";
import Resource, { Cost, canAfford, performCostTransaction } from "./Resource";

export class Astroid {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  static generateAsteroidName(): string {
    // Generate a random year between 1900 and the current year
    const randomYear = Math.floor(Math.random() * (new Date().getFullYear() - 1900 + 1)) + 1900;

    // Assuming a sequential number based on some counter or random generation
    const sequentialNumber = Math.floor(Math.random() * 1000) + 1;

    // Generate three random uppercase letters for the provisional designation
    const provisionalDesignation = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");

    // Format the name: YYYY ABC123
    const asteroidName = `${randomYear} ${provisionalDesignation}${sequentialNumber}`;

    return asteroidName;
  }
}

export class AstroidResource extends Resource {
  private _astroids: Astroid[] = [];

  public get astroids(): Astroid[] {
    return this._astroids;
  }

  public set astroids(value: Astroid[]) {
    this._astroids = value;
    this.draw();
  }

  constructor(resources: { [key: string]: Resource }) {
    super({
      label: "astroid",
      initialAmount: 0,
      capacity: 20,
      generateAmount: 1,
      costs: [
        { resource: "funds", amount: 2 },
        { resource: "energy", amount: 2 },
      ],
      buildTimeMs: 2000,
      buildDescriptions: ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"],
      unitSymbol: { icon: "a", infront: false },
    });
  }

  generate(): Promise<void> {
    super.generate().then(() => {
      let asteroidName = Astroid.generateAsteroidName();
      this.astroids.push(new Astroid(asteroidName));
      this.draw();
    });

    return;
  }

  draw() {
    const astroidListContainer = document.querySelectorAll(`.astroid-list-container`);

    astroidListContainer.forEach((container) => {
      container.innerHTML = "";

      if (this.astroids.length == 0) {
        const message = document.createElement("div");
        message.innerHTML = "<p>No astroids.</p>";
        container.appendChild(message);
      } else {
        this.astroids.forEach((astroid) => {
          const astroidastroidContainer = document.createElement("div");
          astroidastroidContainer.classList.add("astroid-astroid-container");

          // const picContainer = document.createElement("div");
          // picContainer.classList.add("astroid-face-pic-container");
          const nameContainer = document.createElement("div");
          nameContainer.classList.add("astroid-name-container");

          const genderContainer = document.createElement("div");
          genderContainer.classList.add("astroid-gender-container");

          // picContainer.innerHTML = astroid.facePic;
          nameContainer.innerHTML = `${astroid.name}`;

          // astroidastroidContainer.appendChild(picContainer);
          astroidastroidContainer.appendChild(nameContainer);
          astroidastroidContainer.appendChild(genderContainer);

          container.appendChild(astroidastroidContainer);
        });
      }
    });
  }
}
