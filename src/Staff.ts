import { femaleNames, lastNames, maleNames } from "./Names";
import Resource, { Cost, canAfford, performCostTransaction } from "./Resource";

enum StaffGender {
  MALE,
  FEMALE,
  OTHER,
}

export class StaffMember {
  private _gender: StaffGender;

  private _firstName: string;

  private _lastName: string;

  private _facePic: string;

  constructor(gender: StaffGender, firstName: string, lastName: string, facePic: string) {
    this.gender = gender;
    this.firstName = firstName || StaffMember.genFirstName(this.gender);
    this.lastName = lastName || StaffMember.genLastName();
    this.facePic = facePic;
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
  private _members: StaffMember[] = [];

  constructor() {
    super({
      label: "staffmember",
      initialAmount: 0,
      capacity: 2,
      generateAmount: 1,
      costs: [
        { resource: "funds", amount: 2 },
        { resource: "energy", amount: 2 },
      ],
      buildTimeMs: 2000,
      buildDescriptions: ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B", "C", "D"],
      unitSymbol: { icon: "🧍‍♂️", infront: false },
    });
  }

  public get members(): StaffMember[] {
    return this._members;
  }

  public set members(value: StaffMember[]) {
    this._members = value;
    this.draw();
  }

  generate(): Promise<void> {
    let gender = StaffMember.genGender();
    let firstName = StaffMember.genFirstName(gender);

    super.generate().then(() => {
      this.members.push(new StaffMember(gender, firstName, StaffMember.genLastName(), StaffMember.generateRandomLennyFace()));
      this.draw();
    });

    return;
  }

  draw() {
    const staffListContainers = document.querySelectorAll(`.staff-list-container`);

    staffListContainers.forEach((container) => {
      container.innerHTML = "";

      if (this.members.length == 0) {
        const message = document.createElement("div");
        message.innerHTML = "<p>No Staff Hired.</p>";
        container.appendChild(message);
      } else {
        this.members.forEach((member) => {
          const staffMemberContainer = document.createElement("div");
          staffMemberContainer.classList.add("staff-member-container");

          const facePicContainer = document.createElement("div");
          facePicContainer.classList.add("staff-face-pic-container");
          const nameContainer = document.createElement("div");
          nameContainer.classList.add("staff-name-container");
          const genderContainer = document.createElement("div");
          genderContainer.classList.add("staff-gender-container");

          facePicContainer.innerHTML = member.facePic;
          nameContainer.innerHTML = `${member.firstName} ${member.lastName}`;
          genderContainer.innerHTML = `${member.gender == StaffGender.MALE ? "♂" : member.gender == StaffGender.FEMALE ? "♀" : "⚥"}`;

          staffMemberContainer.appendChild(facePicContainer);
          staffMemberContainer.appendChild(nameContainer);
          staffMemberContainer.appendChild(genderContainer);

          container.appendChild(staffMemberContainer);
        });
      }
    });
  }
}
