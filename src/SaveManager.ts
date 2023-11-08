import { Factory } from "./Factory";
import { Globals } from "./Globals";
import { PacingManager } from "./PacingManager";
import Resource, { AllResourcesObject, Cost } from "./Resource";
import { Store } from "./Store";

interface loadedResource {
  _amount: number;
  buildStatus: number;
  _buildTimeMs: number;
  _capacity: number;
  _generateAmount: number;
  _buildQueueCapacity: number;
  buildQueue: Array<number>;
  _costs: Array<Cost>;
}

const SAVE_FREQ = 1000;

export class SaveManager {
  resources: AllResourcesObject;
  introducedWindows: Array<string>;
  pacingManager: PacingManager;
  store: Store;
  globals: Globals;
  factories: { [key: string]: Factory };

  constructor(resources: AllResourcesObject, pacingManager: PacingManager, store: Store, factories: { [key: string]: Factory }) {
    this.resources = resources;
    this.pacingManager = pacingManager;
    this.store = store;
    this.factories = factories;
    this.load();
    this.beginSave();
  }

  beginSave() {
    setInterval(() => {
      this.save();
    }, SAVE_FREQ);
  }

  save() {
    // Save resources
    localStorage.setItem("resources", JSON.stringify(this.resources));
    localStorage.setItem("globals", JSON.stringify({ ...Globals }));

    // Save introduced Windows
    localStorage.setItem("introducedWindows", JSON.stringify(Array.from(this.pacingManager.introducedWindows)));

    // Save factories
    localStorage.setItem("factories", JSON.stringify(this.factories));

    // Save Store items
    let purchasedItemIds: { [key: string]: Array<string> } = {};

    Object.keys(this.store.storeItems).forEach((collection) => {
      let storeItemsAsArray = Object.keys(this.store.storeItems[collection]).map((key) => this.store.storeItems[collection][key]);
      storeItemsAsArray.forEach((item) => {
        if (item.purchased) {
          if (purchasedItemIds[collection]) {
            purchasedItemIds[collection].push(item.id);
          } else {
            purchasedItemIds[collection] = [item.id];
          }
        }
      });
    });

    localStorage.setItem("purchasedStoreItems", JSON.stringify(this.store.storeItems));
  }

  load() {
    console.log("loading");

    let globalSavedValues = JSON.parse(localStorage.getItem("globals"));

    if (globalSavedValues) {
      Globals._maxCosmicBlessing = globalSavedValues._maxCosmicBlessing;
      Globals.cosmicBlessing = globalSavedValues.cosmicBlessing;
    }
    // Load windows
    if (localStorage.getItem("introducedWindows")) {
      this.pacingManager.introducedWindows = new Set(JSON.parse(localStorage.getItem("introducedWindows"))) || new Set();
      this.pacingManager.check();
    }

    // load resources
    const loadedResources = localStorage.getItem("resources");
    if (loadedResources) {
      const parsedLoadedResources: { [key: string]: loadedResource } = JSON.parse(loadedResources);

      Object.keys(this.resources).forEach((key: string) => {
        this.resources[key].amount = parsedLoadedResources[key]._amount;
        this.resources[key].buildStatus = parsedLoadedResources[key].buildStatus;
        this.resources[key].buildTimeMs = parsedLoadedResources[key]._buildTimeMs;
        this.resources[key].capacity = parsedLoadedResources[key]._capacity;
        this.resources[key].generateAmount = parsedLoadedResources[key]._generateAmount;
        this.resources[key].costs = parsedLoadedResources[key]._costs;
        this.resources[key].buildQueue = parsedLoadedResources[key].buildQueue;
        this.resources[key].buildQueueCapacity = parsedLoadedResources[key]._buildQueueCapacity;

        if (parsedLoadedResources[key].buildStatus > 0) {
          this.resources[key].beginBuilding(parsedLoadedResources[key].buildStatus);
        }
      });
    }

    // load store items
    let purchasedStoreItems = JSON.parse(localStorage.getItem("purchasedStoreItems"));
    if (purchasedStoreItems) this.store.loadSave(purchasedStoreItems);

    // Load factories
    let factories = JSON.parse(localStorage.getItem("factories"));
    if (factories) {
      Object.keys(factories).forEach((key) => {
        this.factories[key].active = factories[key].active;
        this.factories[key].level = factories[key]._level;
        this.factories[key].efficiency = factories[key].efficiency;
        this.factories[key].maxEfficiency = factories[key].maxEfficiency;
        this.factories[key].upgradeCost = factories[key].upgradeCost;
        this.factories[key].draw();
      });
    }
    console.log("loading done");
  }
}
