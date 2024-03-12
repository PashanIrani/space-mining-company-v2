import { femaleNames, lastNames, maleNames } from "./Names";
import Resource, { Cost, UnitSymbolDefination, canAfford, performCostTransaction } from "./Resource";
import { StaffMember, StaffResource } from "./Staff";
import UIManager from "./UIManager";
import config from "./config";

interface AstroidResourceDetails {
  label: string;
  amount: number;
  unitSymbol: UnitSymbolDefination;
}

export class Astroid {
  name: string;
  resources: AstroidResourceDetails[];
  assignedStaff: string[] = [];

  constructor(name: string, resources: AstroidResourceDetails[], assignedStaff: string[]) {
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

export class AstroidResource extends Resource {
  private _astroids: Astroid[] = [];
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

  public get astroids(): Astroid[] {
    return this._astroids;
  }

  public set astroids(value: Astroid[]) {
    this._astroids = value;
    this.amount = value.length;
    this.draw();
  }

  constructor(resources: { [key: string]: Resource }, staff: StaffResource) {
    super({
      label: "astroid",
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

    document.querySelectorAll(".resource-astroid-beginMining").forEach((button: HTMLButtonElement) => {
      button.addEventListener("click", () => {
        this.beginMining();
        button.disabled = true;
      });
    });
  }

  generate(): Promise<void> {
    super.generate();

    this.amount = this.astroids.length;
    return;
  }

  afterGenerateCallback() {
    let resources: AstroidResourceDetails[] = [];
    Object.values(this._resources).forEach((resource) => {
      resources.push({
        label: resource.label,
        amount: Math.random() * 100,
        unitSymbol: resource.unitSymbol,
      });
    });

    let asteroidName = Astroid.generateAsteroidName();
    this.astroids.push(new Astroid(asteroidName, resources, []));
    this.draw();
  }

  draw() {
    const astroidListContainer = document.querySelectorAll(`.astroid-list-container`);

    document.querySelectorAll(".resource-astroid-beginMining").forEach((button: HTMLButtonElement) => {
      button.disabled = this.astroids.length == 0;
    });

    astroidListContainer.forEach((container) => {
      container.innerHTML = "";

      if (this.astroids.length == 0) {
        const message = document.createElement("div");
        message.innerHTML = "<p>No astroids.</p>";
        container.appendChild(message);
      } else {
        this.astroids.forEach((astroid) => {
          const astroidContainer = document.createElement("div");
          astroidContainer.classList.add("astroid-container");

          // const picContainer = document.createElement("div");
          // picContainer.classList.add("astroid-face-pic-container");
          const nameContainer = document.createElement("div");
          nameContainer.classList.add("astroid-name-container");

          const resourcesContainer = document.createElement("div");
          resourcesContainer.classList.add("astroid-resources-container");
          // picContainer.innerHTML = astroid.facePic;
          nameContainer.innerHTML = `${astroid.name} (${astroid.assignedStaff.length} assigned.)`;
          resourcesContainer.innerHTML = `Contains <span>${astroid.resources
            .map((resource) => {
              return `${UIManager.formatValueWithSymbol(resource.amount, resource.unitSymbol)}`;
            })
            .join(", ")}</span>`;

          // astroidastroidContainer.appendChild(picContainer);
          astroidContainer.appendChild(nameContainer);
          astroidContainer.appendChild(resourcesContainer);

          container.appendChild(astroidContainer);
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
    this.setStaffAssignedAstroid();
    this.staff.draw();
  }

  clearJunkAstroids(astroids: Astroid[]) {
    let res = astroids.filter((astroid) => {
      let res = !astroid.isEmpty();
      return res;
    });

    this.setStaffAssignedAstroid();

    return res;
  }

  beginMining() {
    this.astroids = this.clearJunkAstroids(this.astroids);

    const staffCount = this.staff.members.length;
    const astroidCount = this.astroids.length;

    if (staffCount === 0 || astroidCount === 0) {
      console.log("Error: No staff or asteroids available.");
      return;
    }

    let staffIndex = 0;

    this.astroids.forEach((astroid) => {
      astroid.assignedStaff = [];
    });

    // Loop through each staff member and assign an asteroid
    this.staff.members.forEach((staffMember) => {
      const currentAsteroidAssignment = this.astroids[staffIndex % astroidCount];
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
      this.astroids.forEach((astroid) => {
        let amount = 0;

        // 1 unit per sec devided amongst all resources
        // and filter if staff doesn't exist anymore
        astroid.assignedStaff = astroid.assignedStaff.filter((staffId) => {
          let staffMember = this.staff.getById(staffId);
          if (!staffMember) {
            return false;
          }

          amount += (1 / getNonZeroResourceCount(astroid)) * staffMember.efficiency;
          staffMember.efficiency *= 0.9999;
          return true;
        });

        astroid.resources.forEach((resource) => {
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

    function getNonZeroResourceCount(astroid: Astroid) {
      let count = 0;
      for (let i = 0; i < astroid.resources.length; ++i) {
        if (astroid.resources[i].amount > 0) {
          count++;
        }
      }
      return count;
    }
  }

  setStaffAssignedAstroid() {
    this.staff.members.forEach((staff) => {
      let isAssigned = false;

      this.astroids.forEach((astroid) => {
        if (astroid.assignedStaff.includes(staff.id)) {
          staff.currentAssignedAstroid = astroid.name;
          isAssigned = true;
        }
      });

      if (!isAssigned) {
        staff.currentAssignedAstroid = "";
      }
    });
  }
}
