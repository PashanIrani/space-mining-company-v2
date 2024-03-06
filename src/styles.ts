const link = document.getElementById("styleLink") as HTMLLinkElement;
link.href = "scripts/styles/xp.css";
const progressBarlink = document.createElement("link");
progressBarlink.rel = "stylesheet";
progressBarlink.href = "scripts/styles/xpProgressBar.css";
document.head.appendChild(progressBarlink);

document.body.classList.add("theme-xp");

import "./styles/index.scss";
