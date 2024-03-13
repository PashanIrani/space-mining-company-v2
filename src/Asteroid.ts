import { femaleNames, lastNames, maleNames } from "./Names";
import Resource, { Cost, UnitSymbolDefination, canAfford, performCostTransaction } from "./Resource";
import { StaffMember, StaffResource } from "./Staff";
import UIManager from "./UIManager";
import config from "./config";

interface AsteroidResourceDetails {
  label: string;
  amount: number;
  unitSymbol: UnitSymbolDefination;
}

export class Asteroid {
  name: string;
  resources: AsteroidResourceDetails[];
  assignedStaff: string[] = [];

  constructor(name: string, resources: AsteroidResourceDetails[], assignedStaff: string[]) {
    this.name = name;
    this.resources = resources;
    this.assignedStaff = assignedStaff;
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

  isEmpty() {
    for (let i = 0; i < this.resources.length; i++) {
      const resource = this.resources[i];

      if (resource.amount > 0) {
        return false;
      }
    }

    return true;
  }
}

export class AsteroidResource extends Resource {
  private _asteroids: Asteroid[] = [];
  private _resources: { [key: string]: Resource } = {};
  private _staff: StaffResource;
  tickInterval: NodeJS.Timeout;

  public get staff(): StaffResource {
    return this._staff;
  }
  public set staff(value: StaffResource) {
    this._staff = value;
  }

  public get resources(): { [key: string]: Resource } {
    return this._resources;
  }
  public set resources(value: { [key: string]: Resource }) {
    this._resources = value;
  }

  public get asteroids(): Asteroid[] {
    return this._asteroids;
  }

  public set asteroids(value: Asteroid[]) {
    this._asteroids = value;
    this.amount = value.length;
    this.draw();
  }

  constructor(resources: { [key: string]: Resource }, staff: StaffResource) {
    super({
      label: "asteroid",
      initialAmount: 0,
      capacity: 2,
      generateAmount: 1,
      costs: [
        { resource: "funds", amount: 750 },
        { resource: "energy", amount: 20 },
      ],
      buildTimeMs: config.DEV ? 1000 : 40 * 1000,
      buildDescriptions: [
        "Scanning the Sky",
        "Identifying Celestial Objects",
        "Recording Orbital Parameters",
        "Calculating Trajectories",
        "Confirming Potential Asteroids",
        "Cross-referencing with Known Objects",
        "Continued Surveillance",
        "Monitoring Orbital Movements",
        "Estimating Future Positions",
        "Validating Asteroid Presence",
        "Notifying Relevant Authorities",
      ],
      unitSymbol: { icon: "☄️", infront: false },
    });

    this.resources = resources;

    this.staff = staff;

    document.querySelectorAll(".resource-asteroid-beginMining").forEach((button: HTMLButtonElement) => {
      button.addEventListener("click", () => {
        this.beginMining();
        button.disabled = true;
      });
    });
  }

  generate(): Promise<void> {
    super.generate();

    this.amount = this.asteroids.length;
    return;
  }

  afterGenerateCallback() {
    let resources: AsteroidResourceDetails[] = [];
    Object.values(this._resources).forEach((resource) => {
      resources.push({
        label: resource.label,
        amount: Math.random() * 100,
        unitSymbol: resource.unitSymbol,
      });
    });

    let asteroidName = Asteroid.generateAsteroidName();
    this.asteroids.push(new Asteroid(asteroidName, resources, []));
    this.draw();
  }

  draw() {
    const asteroidListContainer = document.querySelectorAll(`.asteroid-list-container`);

    document.querySelectorAll(".resource-asteroid-beginMining").forEach((button: HTMLButtonElement) => {
      button.disabled = this.asteroids.length == 0;
    });

    asteroidListContainer.forEach((container) => {
      container.innerHTML = "";

      if (this.asteroids.length == 0) {
        const message = document.createElement("div");
        message.innerHTML = "<p>No asteroids.</p>";
        container.appendChild(message);
      } else {
        this.asteroids.forEach((asteroid) => {
          const asteroidContainer = document.createElement("div");
          asteroidContainer.classList.add("asteroid-container");

          // const picContainer = document.createElement("div");
          // picContainer.classList.add("asteroid-face-pic-container");
          const nameContainer = document.createElement("div");
          nameContainer.classList.add("asteroid-name-container");

          const resourcesContainer = document.createElement("div");
          resourcesContainer.classList.add("asteroid-resources-container");
          // picContainer.innerHTML = asteroid.facePic;
          nameContainer.innerHTML = `${asteroid.name} (${asteroid.assignedStaff.length} assigned.)`;
          resourcesContainer.innerHTML = `Contains <span>${asteroid.resources
            .map((resource) => {
              return `${UIManager.formatValueWithSymbol(resource.amount, resource.unitSymbol)}`;
            })
            .join(", ")}</span>`;

          // asteroidasteroidContainer.appendChild(picContainer);
          asteroidContainer.appendChild(nameContainer);
          asteroidContainer.appendChild(resourcesContainer);

          container.appendChild(asteroidContainer);
        });
      }
    });

    document.querySelectorAll(".resources-minable-resources").forEach((container) => {
      container.innerHTML = "";

      Object.keys(this.resources).forEach((resourceKey) => {
        let resource = this.resources[resourceKey];
        container.innerHTML += `<div>${UIManager.capitalize(UIManager.removeUnderscore(resource.label))}: ${UIManager.formatValueWithSymbol(
          resource.amount,
          resource.unitSymbol
        )}</div>`;
      });
    });
    this.setStaffAssignedAsteroid();
    this.staff.draw();
  }

  clearJunkAsteroids(asteroids: Asteroid[]) {
    let res = asteroids.filter((asteroid) => {
      let res = !asteroid.isEmpty();
      return res;
    });

    this.setStaffAssignedAsteroid();

    return res;
  }

  beginMining() {
    this.asteroids = this.clearJunkAsteroids(this.asteroids);

    const staffCount = this.staff.members.length;
    const asteroidCount = this.asteroids.length;

    if (staffCount === 0 || asteroidCount === 0) {
      console.log("Error: No staff or asteroids available.");
      return;
    }

    let staffIndex = 0;

    this.asteroids.forEach((asteroid) => {
      asteroid.assignedStaff = [];
    });

    // Loop through each staff member and assign an asteroid
    this.staff.members.forEach((staffMember) => {
      const currentAsteroidAssignment = this.asteroids[staffIndex % asteroidCount];
      currentAsteroidAssignment.assignedStaff.push(staffMember.id);
      staffIndex++;
    });

    this.beginTicking();
  }

  beginTicking() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }

    this.tickInterval = setInterval(() => {
      this.asteroids.forEach((asteroid) => {
        let amount = 0;

        // 1 unit per sec devided amongst all resources
        // and filter if staff doesn't exist anymore
        asteroid.assignedStaff = asteroid.assignedStaff.filter((staffId) => {
          let staffMember = this.staff.getById(staffId);
          if (!staffMember) {
            return false;
          }

          amount += (1 / getNonZeroResourceCount(asteroid)) * staffMember.efficiency;

          if (getNonZeroResourceCount(asteroid) > 0) staffMember.efficiency *= 0.999;
          return true;
        });

        asteroid.resources.forEach((resource) => {
          let amountToDeduct = amount;
          if (resource.amount < amount) {
            amountToDeduct = resource.amount;
          }

          resource.amount -= amountToDeduct;
          this.resources[resource.label].amount += amountToDeduct;
        });
      });

      this.draw();
    }, 1000);

    function getNonZeroResourceCount(asteroid: Asteroid) {
      let count = 0;
      for (let i = 0; i < asteroid.resources.length; ++i) {
        if (asteroid.resources[i].amount > 0) {
          count++;
        }
      }
      return count;
    }
  }

  setStaffAssignedAsteroid() {
    this.staff.members.forEach((staff) => {
      let isAssigned = false;

      this.asteroids.forEach((asteroid) => {
        if (asteroid.assignedStaff.includes(staff.id)) {
          staff.currentAssignedAsteroid = asteroid.name;
          isAssigned = true;
        }
      });

      if (!isAssigned) {
        staff.currentAssignedAsteroid = "";
      }
    });
  }
}
