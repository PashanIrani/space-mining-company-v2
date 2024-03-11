// strength: 0-1 value: 1 will reduce by 50% at level 1.

import { waterIce, rawMetals, carbonaceousMaterial } from ".";

import { Cost } from "./Resource";

// tension: controls the depth function goes to. tension of 1 will result in 0 change, while 0 will allow the strength to function without restriction.
export function getChangeAmount(level: number, strength: number = 0.15, prevNumber: number, up: boolean = true) {
  if (level < 1) {
    throw new Error("Level cannot be 0");
  }

  return (prevNumber / Math.pow(up ? 1 + strength : 1 - strength, level - 1)) * Math.pow(up ? 1 + strength : 1 - strength, level);
}
export function generateMissionNameAndCost(): { missionName: string; cost: Cost[] } {
  const missionTypes = ["Endeavor", "Venture", "Initiative", "Assignment", "Mission", "Operation", "Scheme", "Project"];
  const resourceTypes = [waterIce, rawMetals, carbonaceousMaterial];

  // Choose a random mission type
  const randomMissionType = missionTypes[Math.floor(Math.random() * missionTypes.length)];

  // Shuffle resource types to randomize which resources will be needed
  const shuffledResources = resourceTypes.sort(() => Math.random() - 0.5);

  // Determine how many resource types are needed (1, 2, or 3)
  const numResourcesNeeded = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3

  // Select the first `numResourcesNeeded` resources
  const resourcesNeeded = shuffledResources.slice(0, numResourcesNeeded);

  // Generate mission name based on the selected mission type and resource types
  let missionName = `${randomMissionType}`;
  let cost: Cost[] = [];

  // Add resource types to the mission name and determine their costs
  resourcesNeeded.forEach((resourceType) => {
    let amount = Math.floor(Math.random() * 10) + 5; // Random amount between 5 and 14
    cost.push({ resource: resourceType.label, amount });
  });

  return { missionName, cost };
}
