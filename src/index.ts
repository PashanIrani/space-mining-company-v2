import Resource from "./models/Resource";
import "7.css/dist/7.css";
import "./styles/index.scss";

class Energy extends Resource {
  constructor() {
    super("energy", 0, null, 1, [], 1 * 100);
  }
}

new Energy();
