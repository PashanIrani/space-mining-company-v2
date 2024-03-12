import { container } from "webpack";
import UIManager from "./UIManager";
import Resource, { Cost, canAfford, performCostTransaction } from "./Resource";

type onPurchaseFunction = (storeItem: StoreItem) => void;
export type StoreItemDependsOn = Array<[string, string, number]>;

export interface StoreItemDescription {
  id: string;
  collection: string; // groups items
  name: string; // name of item
  description: string; // describes store item
  costs: Array<Cost>;
  level: number;
  maxLevel?: number;
  dependsOn: StoreItemDependsOn;
  sortOrder: number;
  onPurchase: onPurchaseFunction;
  missionFormat?: boolean;
}

export class StoreItem {
  purchased: boolean;
  name: string;
  id: string;
  costs: Array<Cost>;
  description: string;
  dependsOn: StoreItemDependsOn;
  level: number;
  maxLevel: number;
  sortOrder: number;
  onPurchase: onPurchaseFunction;
  missionFormat?: boolean;

  constructor(desc: StoreItemDescription) {
    this.purchased = false;
    this.name = desc.name;
    this.costs = desc.costs;
    this.id = desc.id;
    this.description = desc.description;
    this.dependsOn = desc.dependsOn;
    this.level = desc.level;
    this.maxLevel = desc.maxLevel || -1;
    this.onPurchase = desc.onPurchase;
    this.missionFormat = desc.missionFormat;
  }
}

export class Store {
  storeItems: { [key: string]: { [key: string]: StoreItem } } = {};

  constructor(storeDesc: Array<StoreItemDescription>) {
    storeDesc.forEach((desc) => {
      if (!this.storeItems[desc.collection]) {
        this.storeItems[desc.collection] = {};
      }

      this.storeItems[desc.collection][desc.id] = new StoreItem(desc);
    });

    // Done to update costs strings every sec
    this.drawStore();

    setInterval(() => {
      this.drawStore();
    }, 1000);
  }

  purchase(storeItem: StoreItem) {
    if (!canAfford(storeItem.costs)) return;

    performCostTransaction(storeItem.costs);

    storeItem.level++;
    storeItem.onPurchase(storeItem);

    if (storeItem.level >= storeItem.maxLevel && storeItem.maxLevel != -1) {
      storeItem.purchased = true;
    }

    this.drawStore();
  }

  drawStore(): void {
    Object.keys(this.storeItems).forEach((collection) => {
      const storeContainers = document.querySelectorAll(`.${collection}-store`);

      // setup containers
      storeContainers.forEach((container) => {
        container.innerHTML = "";

        // if (collection !== "main") {
        //   const storeTitle = document.createElement("legend");
        //   storeTitle.innerHTML = `${UIManager.capitalize(collection)} Upgrades`;
        //   container.appendChild(storeTitle);
        // }
      });

      let storeItemsAsArray = Object.keys(this.storeItems[collection]).map((key) => this.storeItems[collection][key]);
      // loop each collection and add items to their respective stores
      if (storeItemsAsArray.length > 0) {
        storeItemsAsArray = storeItemsAsArray.slice().sort((a, b) => a.sortOrder - b.sortOrder);
        storeItemsAsArray.forEach((storeItem: StoreItem) => {
          if (!this.meetsDependency(storeItem)) return;

          const storeContainers = document.querySelectorAll(`.${collection}-store`);

          storeContainers.forEach((container) => {
            const storeItemContainer = document.createElement("div");
            storeItemContainer.classList.add("store-item-container");

            if (storeItem.purchased) storeItemContainer.classList.add("store-item-purchased");
            else if (!canAfford(storeItem.costs)) storeItemContainer.classList.add("store-item-cant-afford");

            const infoContainer = document.createElement("div");
            infoContainer.classList.add("info-container");

            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");

            const headerText = document.createElement("h1");
            let levelText =
              storeItem.maxLevel == 1 || storeItem.level == 0 ? "" : `[${storeItem.level}${storeItem.maxLevel > 1 ? `/${storeItem.maxLevel}` : ""}]`;

            if (storeItem.missionFormat) {
              levelText = "";
            }

            headerText.innerHTML = `${storeItem.name} ${levelText}`;

            const descriptionText = document.createElement("h2");
            descriptionText.innerHTML = storeItem.description;

            const costP = document.createElement("p");

            costP.innerHTML = storeItem.purchased ? (storeItem.level > 1 ? "Max Level Reached." : "") : `Cost: ${UIManager.getCostString(storeItem.costs)}`;

            if (storeItem.missionFormat) {
              costP.innerHTML = `<p>Requires:</p><div class="needs-container">`;

              storeItem.costs.forEach((cost) => {
                costP.innerHTML += `<div class="need-resource-container"><div class="needs-progressbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="40"
            class="resource-dummy-progressbar-container">
            <div class="resource-dummy-progressbar progressbar" style="width: ${(Resource.ALL_RESOURCES[cost.resource].amount / cost.amount) * 100}%"></div>
          </div><span class="costs ${Resource.ALL_RESOURCES[cost.resource].amount < cost.amount ? "highlight" : ""}"><span class="resource-${
                  Resource.ALL_RESOURCES[cost.resource].label
                }-amount">${UIManager.formatValueWithSymbol(
                  Resource.ALL_RESOURCES[cost.resource].amount,
                  Resource.ALL_RESOURCES[cost.resource].unitSymbol
                )}</span>/${UIManager.formatValueWithSymbol(cost.amount, Resource.ALL_RESOURCES[cost.resource].unitSymbol)}</span></div>`;

                costP.innerHTML += ``;
              });

              costP.innerHTML += "</div>";
            }
            costP.classList.add("costs");
            const button = document.createElement("button");
            button.innerHTML = `Buy`;

            button.disabled = !canAfford(storeItem.costs);

            if (storeItem.purchased) button.disabled = true;
            button.addEventListener("click", () => {
              this.purchase(storeItem);
            });

            infoContainer.appendChild(headerText);
            infoContainer.appendChild(descriptionText);
            infoContainer.appendChild(costP);

            buttonContainer.appendChild(button);

            storeItemContainer.appendChild(infoContainer);

            if (!storeItem.purchased) storeItemContainer.appendChild(buttonContainer);
            container.appendChild(storeItemContainer);
          });
        });
      } else {
        const storeContainers = document.querySelectorAll(`.${collection}-store`);

        storeContainers.forEach((container) => {
          container.innerHTML = "No Stock";
        });
      }
    });
  }

  meetsDependency(storeItem: StoreItem): boolean {
    // if (storeItem.purchased) return false;

    for (let i = 0; i < storeItem.dependsOn.length; i++) {
      const dependsOnDesc = storeItem.dependsOn[i];
      if (dependsOnDesc[2] == 0 && !this.storeItems[dependsOnDesc[0]][dependsOnDesc[1]].purchased) return false;
      if (this.storeItems[dependsOnDesc[0]][dependsOnDesc[1]].level < dependsOnDesc[2]) return false;
    }

    return true;
  }

  isAllPurchased(items: StoreItem[]) {
    for (let i = 0; i < items.length; i++) {
      const element = items[i];
      if (!element.purchased) return false;
    }

    return true;
  }

  loadSave(purchasedStoreItems: any) {
    Object.keys(purchasedStoreItems).forEach((collection) => {
      Object.keys(purchasedStoreItems[collection]).forEach((itemKey) => {
        let item = purchasedStoreItems[collection][itemKey];
        this.storeItems[collection][itemKey].costs = item.costs;
        this.storeItems[collection][itemKey].description = item.description;
        this.storeItems[collection][itemKey].level = item.level;
        this.storeItems[collection][itemKey].purchased = item.purchased;
        this.storeItems[collection][itemKey].name = item.name;
      });
    });

    this.drawStore();
  }
}
