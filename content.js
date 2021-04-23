/// <reference path="lib/svg.min.js" />
/// <reference path="lib/svg.path.js" />

// Alcumus wrapper as of March 29, 2021
const alcMainSelectorId = "div.alc--main";

// Main alcumus wrapper
let alcMain;

// svg.js drawing thing
let draw;

let currentLine;

let mouseDown = false;
let isFirstPoint = true;

let penMode = "pen";

console.log("Art of Problem Solving Notes Extension is running");
let checkExist = setInterval(function () {
  console.log("Searching for div.alc--main...");
  alcMain = document.querySelector("div.alc--main");
  if (alcMain) {
    clearInterval(checkExist);
    setupSvgCanvas();
    setupEventListeners();
    setupButtons();
  }
}, 500);

function setupSvgCanvas() {
  // TODO: check if everything exists
  console.log("setting up canvas");
  alcMain.innerHTML += `<svg id="alc-drawing"></svg>`;
  draw = SVG().addTo("#alc-drawing");
  resetLine();
}

function setupButtons() {
  let hud = alcMain.insertBefore(
    document.createElement("div"),
    document.getElementById("alc-drawing")
  );
  hud.className = "drawing-hud";
  hud.innerHTML += `<button id="pen-btn">⬛</button>`;
  hud.innerHTML += `<button id="eraser-btn">💊</button>`;
  document.getElementById("pen-btn").addEventListener("click", function () {
    penMode = "pen";
    console.log(penMode);
  });
  document.getElementById("eraser-btn").addEventListener("click", function () {
    penMode = "eraser";
    console.log(penMode);
    document.getElementsByClassName("drawing-line").forEach((l) => {
      l.addEventListener("mouseenter", function (e) {
        console.log({
          isEraser: penMode,
          mouseDown,
        });
        if (penMode === "eraser" && mouseDown) {
          l.setAttribute("d", "");
        }
      });
    });
  });
}

function setupEventListeners() {
  document.addEventListener("mousedown", registerMouseDown);
  document.addEventListener("mouseup", registerMouseUp);
  alcMain.addEventListener("mousemove", onMouseMove);
  alcMain.addEventListener("mouseleave", resetLine);
}

function registerMouseDown() {
  mouseDown = true;
}

function registerMouseUp() {
  mouseDown = false;
  if (penMode === "pen") {
    resetLine();
  }
}

function onMouseMove(e) {
  if (!mouseDown || penMode !== "pen") {
    return;
  }
  getCanvas();
  let { mouseX, mouseY } = calculateRelativePosition(e);
  if (
    mouseX < 0 ||
    mouseX > alcMain.clientWidth ||
    mouseY < 0 ||
    mouseY > alcMain.clientHeight
  ) {
    return;
  }
  if (isFirstPoint) {
    line.M(mouseX, mouseY);
    isFirstPoint = false;
  } else {
    line.L(mouseX, mouseY);
  }
}

function resetLine() {
  line = draw
    .path()
    .addClass("drawing-line")
    .fill("none")
    .stroke({ color: "#000", width: 3, linecap: "round", linejoin: "round" });
  isFirstPoint = true;
}

function getCanvas() {
  alcMain = document.querySelector("div.alc--main");
}

function calculateRelativePosition(e) {
  let rect = document.getElementById("alc-drawing").getBoundingClientRect();
  return {
    mouseX: e.clientX - rect.left,
    mouseY: e.clientY - rect.top,
  };
}
