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
export function generateMissionNameAndCost(level: number = 1): { missionName: string; cost: Cost[] } {
  // TODO: Extract this in a another file to allow expansion
  const missionTypes = [
    "Water Purification",
    "Steel Production",
    "Hydroponic Farming",
    "Greenhouse Gas Sequestration",
    "Spacecraft Propulsion",
    "Biofuel Production",
    "Construction of Habitats on Other Planets",
    "Manufacture of Carbon Fiber",
    "Water Recycling Systems",
    "Desalination",
    "Geothermal Energy Extraction",
    "Carbon Capture and Storage (CCS)",
    "Hydroelectric Power Generation",
    "Space Agriculture Research",
    "Aquaponics Systems",
    "Metal Recycling",
    "Graphene Production",
    "Ice Sculpting and Art",
    "Carbon Nanotube Synthesis",
    "Metalworking and Fabrication",
    "Hydrothermal Vent Exploration",
    "Algae Biofuel Cultivation",
    "Metal Alloy Development",
    "Water Filtration Systems",
    "Thermal Energy Storage Systems",
    "Carbon Sequestration in Soils",
    "Iron Ore Smelting",
    "Hydrogen Production from Water",
    "Space Station Life Support Systems",
    "Organic Waste Composting",
    "Titanium Extraction from Ores",
    "Geopolymer Concrete Production",
    "Biogas Generation from Organic Waste",
    "Aluminum Recycling",
    "Nuclear Reactor Coolant Systems",
    "Biochar Production for Soil Amendment",
    "Titanium Alloy Manufacturing",
    "Aquifer Recharge Projects",
    "Ceramic Materials Synthesis",
    "Tidal Energy Conversion Systems",
    "Hydrocarbon Refining Processes",
    "Microbial Fuel Cell Development",
    "Sustainable Forest Management",
    "Wastewater Treatment Facilities",
    "Rare Earth Element Extraction",
    "Hydrogen Storage Technologies",
    "Algal Bloom Remediation Strategies",
    "Iron Casting and Forging",
    "Bio-based Plastic Production",
    "Methane Digestion from Landfills",
  ];

  const resourceTypes = [waterIce, rawMetals, carbonaceousMaterial];

  const randomMissionType = missionTypes[Math.floor(Math.random() * missionTypes.length)];
  const shuffledResources = resourceTypes.sort(() => Math.random() - 0.5);
  const numResourcesNeeded = Math.floor(Math.random() * 3) + 1;
  const resourcesNeeded = shuffledResources.slice(0, numResourcesNeeded);

  // Generate mission name based on the selected mission type and resource types
  let missionName = `${randomMissionType}`;
  let cost: Cost[] = [];

  // Add resource types to the mission name and determine their costs
  resourcesNeeded.forEach((resourceType) => {
    let amount = (Math.floor(Math.random() * 10) + 5) * level; // Random amount between 5 and 14
    cost.push({ resource: resourceType.label, amount });
  });

  return { missionName, cost };
}
