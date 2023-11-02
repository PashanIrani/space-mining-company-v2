import { container } from "webpack";
import UIManager from "./UIManager";
import Resource, { Cost, canAfford, performCostTransaction } from "./Resource";

type onPurchaseFunction = (storeItem: StoreItem) => void;
export interface StoreItemDescription {
  id: string;
  collection: string; // groups items
  name: string; // name of item
  description: string; // describes store item
  costs: Array<Cost>;
  level: number;
  onPurchase: onPurchaseFunction;
}

export class StoreItem {
  purchased: boolean;
  name: string;
  id: string;
  costs: Array<Cost>;
  description: string;
  level: number;
  onPurchase: onPurchaseFunction;

  constructor(desc: StoreItemDescription) {
    this.purchased = false;
    this.name = desc.name;
    this.costs = desc.costs;
    this.id = desc.id;
    this.description = desc.description;
    this.level = desc.level;
    this.onPurchase = desc.onPurchase;
  }
}

export class Store {
  storeItems: { [key: string]: Array<StoreItem> } = {};

  constructor(storeDesc: Array<StoreItemDescription>) {
    storeDesc.forEach((desc) => {
      if (this.storeItems[desc.collection]) {
        this.storeItems[desc.collection].push(new StoreItem(desc));
      } else {
        this.storeItems[desc.collection] = [new StoreItem(desc)];
      }
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

    storeItem.purchased = true;
    storeItem.onPurchase(storeItem);
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

      // loop each collection and add items to their respective stores
      if (!this.isAllPurchased(this.storeItems[collection])) {
        this.storeItems[collection].forEach((storeItem: StoreItem) => {
          if (storeItem.purchased) return;

          const storeContainers = document.querySelectorAll(`.${collection}-store`);

          storeContainers.forEach((container) => {
            const storeItemContainer = document.createElement("div");
            storeItemContainer.classList.add("store-item-container");

            const infoContainer = document.createElement("div");
            infoContainer.classList.add("info-container");

            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");

            const headerText = document.createElement("h1");
            headerText.innerHTML = storeItem.name;

            const descriptionText = document.createElement("h2");
            descriptionText.innerHTML = storeItem.description;

            const costP = document.createElement("p");
            costP.innerHTML = `Cost: ${UIManager.getCostString(storeItem.costs)}`;

            const button = document.createElement("button");
            button.innerHTML = `Buy`;

            button.disabled = !canAfford(storeItem.costs);
            button.addEventListener("click", () => {
              this.purchase(storeItem);
            });

            infoContainer.appendChild(headerText);
            infoContainer.appendChild(descriptionText);
            infoContainer.appendChild(costP);

            buttonContainer.appendChild(button);

            storeItemContainer.appendChild(infoContainer);
            storeItemContainer.appendChild(buttonContainer);
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

  isAllPurchased(items: StoreItem[]) {
    for (let i = 0; i < items.length; i++) {
      const element = items[i];
      if (!element.purchased) return false;
    }

    return true;
  }

  loadSave(purchasedStoreItems: any) {
    Object.keys(purchasedStoreItems).forEach((collection) => {
      for (let i = 0; i < purchasedStoreItems[collection].length; i++) {
        const item = purchasedStoreItems[collection][i];
        this.storeItems[collection][i].costs = item.costs;
        this.storeItems[collection][i].description = item.description;
        this.storeItems[collection][i].level = item.level;
        this.storeItems[collection][i].purchased = item.purchased;
        this.storeItems[collection][i].name = item.name;
      }
    });

    this.drawStore();
  }
}
