import { Astroid, AstroidResource } from "./Astroid";
import { femaleNames, lastNames, maleNames } from "./Names";
import Resource, { Cost, canAfford, performCostTransaction } from "./Resource";
import UIManager from "./UIManager";
import config from "./config";

enum StaffGender {
  MALE,
  FEMALE,
  OTHER,
}

export class StaffMember {
  // TODO: use up eneregy as they mine
  private _gender: StaffGender;

  private _firstName: string;

  private _lastName: string;

  private _facePic: string;
  public id: string;
  public efficiency: number;
  currentAssignedAstroid: any;

  constructor({
    gender,
    firstName,
    lastName,
    facePic,
    id,
    efficiency,
  }: {
    gender: StaffGender;
    firstName: string;
    lastName: string;
    facePic: string;
    id: string;
    efficiency: number;
  }) {
    this.gender = gender;
    this.firstName = firstName || StaffMember.genFirstName(this.gender);
    this.lastName = lastName || StaffMember.genLastName();
    this.facePic = facePic;
    this.id = id;
    this.efficiency = efficiency;
  }

  public get gender(): StaffGender {
    return this._gender;
  }

  public set gender(value: StaffGender) {
    this._gender = value;
  }

  public get firstName(): string {
    return this._firstName;
  }

  public set firstName(value: string) {
    this._firstName = value;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public set lastName(value: string) {
    this._lastName = value;
  }

  public get facePic(): string {
    return this._facePic;
  }

  public set facePic(value: string) {
    this._facePic = value;
  }

  static genGender() {
    const prob = Math.random();

    let gender = StaffGender.MALE; // Male
    if (prob >= 0.4) gender = StaffGender.FEMALE; // Female
    if (prob >= 0.8) gender = StaffGender.FEMALE; // Other

    return gender;
  }

  static genId() {
    return `S${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  static genFirstName(gender: StaffGender) {
    const prob = Math.random();

    if (gender == StaffGender.MALE || (prob < 0.5 && gender == StaffGender.OTHER)) {
      return maleNames[Math.floor(Math.random() * maleNames.length)];
    }

    if (gender == StaffGender.FEMALE || (prob >= 0.5 && gender == StaffGender.OTHER)) {
      return femaleNames[Math.floor(Math.random() * femaleNames.length)];
    }

    return "";
  }

  static genLastName() {
    return lastNames[Math.floor(Math.random() * lastNames.length)];
  }

  static generateRandomLennyFace() {
    const eyes = [
      "⊙ ⊙",
      "◉ ◉",
      "◕ ◕",
      "• •",
      "o o",
      "° °",
      "¬ ¬",
      "ಠ ಠ",
      "ʘ ʘ",
      " ͡°  ͡°",
      "⩾ ⩽",
      "•̀ •́",
      "⸟ ⸟",
      "⟃ ⟃",
      "ᵔ ᵔ",
      "⌐■ ■",
      "￣ ￣",
      "* *",
      "ó ò",
      "ꗞ ꗞ",
      "⇀ ↼",
      "ȍ ȍ",
      "⩹ ⩺",
      "❍ ❍",
      "` `",
      "ⱺ ⱺ",
      "☉ ☉",
      "꘠ ꘠",
      "^ ^",
      "´• •`",
      "⏓ ⏓",
      "$ $",
      "Ꝋ Ꝋ",
      " > > ",
      "ᗒ ᗕ",
      "⩿ ⪀",
      "⚆ ⚆",
      "@@",
    ];
    const mouth = ["‿", "︿", "▽", "◡", "ω", "Д", "∀", "з", "ε", "¯", "´", ".", "^", "﹀", "⌔", "ᗨ", "⋃", "⩌", "ᗝ", "෴", "﹏"];

    const randomEyes = eyes[Math.floor(Math.random() * eyes.length)];
    const randomMouth = mouth[Math.floor(Math.random() * mouth.length)];

    return randomEyes + "<br />" + randomMouth;
  }
}

export class StaffResource extends Resource {
  getById(staffId: string): StaffMember {
    for (let i = 0; i < this._members.length; ++i) {
      if (this._members[i].id === staffId) {
        return this._members[i];
      }
    }
  }

  private _members: StaffMember[] = [];

  constructor() {
    super({
      label: "staffmember",
      initialAmount: 0,
      capacity: 1,
      generateAmount: 1,
      costs: [
        { resource: "funds", amount: 325 },
        { resource: "energy", amount: 10 },
      ],
      buildTimeMs: config.DEV ? 1000 : 20 * 1000,
      buildDescriptions: [
        "Recruitment: Advertising",
        "Recruitment: Receiving",
        "Recruitment: Reviewing",
        "Screening: Assessing",
        "Screening: Evaluating",
        "Screening: Shortlisting",
        "Interview: Questioning",
        "Interview: Engaging",
        "Interview: Assessing",
        "Evaluate: Analyzing",
        "Evaluate: Comparing",
        "Evaluate: Selecting",
        "Negotiate: Discussing",
        "Negotiate: Bargaining",
        "Negotiate: Finalizing",
        "Onboard: Welcoming",
        "Onboard: Orienting",
        "Onboard: Integrating",
      ],
      unitSymbol: { icon: "🙋‍♂️", infront: false },
    });
  }

  public get members(): StaffMember[] {
    return this._members;
  }

  public set members(value: StaffMember[]) {
    this._members = value;
    this.amount = value.length;
    this.draw();
  }

  generate(): Promise<void> {
    super.generate();

    return;
  }

  afterGenerateCallback() {
    let gender = StaffMember.genGender();
    let firstName = StaffMember.genFirstName(gender);

    this.members.push(
      new StaffMember({
        gender,
        firstName,
        lastName: StaffMember.genLastName(),
        facePic: StaffMember.generateRandomLennyFace(),
        id: StaffMember.genId(),
        efficiency: Math.random(),
      })
    );
    this.draw();
  }

  draw() {
    const staffListContainers = document.querySelectorAll(`.staff-list-container`);

    let idleCount = 0;

    staffListContainers.forEach((container) => {
      container.innerHTML = "";

      if (this.members.length == 0) {
        const message = document.createElement("div");
        message.innerHTML = "<p>No Staff Hired.</p>";
        container.appendChild(message);
      } else {
        this.members.forEach((member) => {
          if (member.currentAssignedAstroid == "") {
            idleCount++;
          }

          UIManager.displayText("idle-staff-count", idleCount > 0 ? `${idleCount} idle staff members...` : "");

          const staffMemberContainer = document.createElement("div");
          staffMemberContainer.classList.add("staff-member-container");

          const facePicContainer = document.createElement("div");
          facePicContainer.classList.add("staff-face-pic-container");

          const infoContainer = document.createElement("div");
          infoContainer.classList.add("staff-info-container");

          const nameContainer = document.createElement("div");
          nameContainer.classList.add("staff-name-container");
          const efficiencyContainer = document.createElement("div");
          efficiencyContainer.classList.add("staff-efficiency-container");

          const currentAstroidContainer = document.createElement("div");
          currentAstroidContainer.classList.add("staff-site-container");

          facePicContainer.innerHTML = member.facePic;
          nameContainer.innerHTML = `${member.firstName} ${member.lastName} ${
            member.gender == StaffGender.MALE ? "♂" : member.gender == StaffGender.FEMALE ? "♀" : "⚥"
          }`;
          efficiencyContainer.innerHTML = `[${UIManager.formatValueWithSymbol(member.efficiency * 100, {
            icon: "%",
            infront: false,
          })} Efficiency]`;
          currentAstroidContainer.innerHTML = `${member.currentAssignedAstroid === "" ? "Home" : member.currentAssignedAstroid}`;

          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");

          const button = document.createElement("button");
          button.innerHTML = `Fire`;

          button.addEventListener("click", () => {
            this.fire(member.id);
          });

          staffMemberContainer.appendChild(facePicContainer);
          infoContainer.appendChild(nameContainer);
          infoContainer.appendChild(efficiencyContainer);
          infoContainer.appendChild(currentAstroidContainer);
          buttonContainer.appendChild(button);
          staffMemberContainer.appendChild(infoContainer);
          staffMemberContainer.appendChild(buttonContainer);

          container.appendChild(staffMemberContainer);
        });
      }
    });
  }
  fire(id: string) {
    this.members = this.members.filter((member) => member.id !== id);
    this.draw();
  }
}
