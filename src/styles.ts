const dropdown = document.getElementById("css-dropdown") as HTMLSelectElement;
if (localStorage.getItem("theme")) {
  dropdown.value = localStorage.getItem("theme");
}
// Event listener for changes in the dropdown selection
dropdown.addEventListener("change", function () {
  const selectedValue = dropdown.options[dropdown.selectedIndex].value;
  localStorage.setItem("theme", selectedValue);
  location.reload();
});

if (localStorage.getItem("theme") === "7") {
  const link = document.getElementById("styleLink") as HTMLLinkElement;
  link.href = "scripts/styles/7.css";

  document.body.classList.add("theme-7");
} else {
  const link = document.getElementById("styleLink") as HTMLLinkElement;
  link.href = "scripts/styles/xp.css";
  const progressBarlink = document.createElement("link");
  progressBarlink.rel = "stylesheet";
  progressBarlink.href = "scripts/styles/xpProgressBar.css";
  document.head.appendChild(progressBarlink);

  document.body.classList.add("theme-xp");
}

import "./styles/index.scss";
