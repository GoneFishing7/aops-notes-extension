/// <reference path="lib/svg.min.js" />
/// <reference path="lib/svg.path.js" />

// Alcumus wrapper as of March 29, 2021
const alcMainSelectorId = "div.alc--main";

// Main alcumus wrapper
let alcMain;

// svg.js drawing thing
let draw;

let mouseDown = false;
let isFirstPoint = true;

let penMode;

console.log("Art of Problem Solving Notes Extension is running");
let checkExist = setInterval(function () {
  console.log("Searching for div.alc--main...");
  alcMain = document.querySelector("div.alc--main");
  if (alcMain) {
    clearInterval(checkExist);
    setupSvgCanvas();
    setupEventListeners();
    setupButtons();
    setPenMode("off");
    hideAll();
    rememberCurrentState();
  }
}, 500);

function setupSvgCanvas() {
  // TODO: check if everything exists
  console.log("setting up canvas");
  // For some reason, if I replace the following line with
  // a statement that uses createElement(), it doesn't
  // automatically add the neccessary SVG-related attributes
  alcMain.innerHTML += `<svg id="alc-drawing"></svg>`;
  //// alcMain.appendChild(createElement("svg", {id: "alc-drawing"}))
  draw = SVG().addTo("#alc-drawing");
  resetLine();
}

function setupButtons() {
  // Import bootstrap icons
  document.querySelector("head").appendChild(
    createElement("link", {
      href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css",
      rel: "stylesheet",
    })
  );
  let hud = alcMain.insertBefore(
    createElement("div", {
      class: "drawing-hud",
    }),
    document.getElementById("alc-drawing")
  );

  // Make sure button events don't bubble
  hud.addEventListener("mousedown", function (e) {
    e.stopPropagation();
  });
  hud.addEventListener("mouseenter", function () {
    if (mouseDown) {
      mouseDown = false;
      resetLine();
    }
  });

  let penControls = hud.appendChild(
    createElement("span", { class: "pen-controls" })
  );
  penControls.appendChild(
    createElement("button", { id: "pen-btn" }, `<i class="bi bi-pen"></i>`)
  );
  penControls.appendChild(
    createElement(
      "button",
      { id: "eraser-btn" },
      `<i class="bi bi-eraser"></i>`
    )
  );
  penControls.appendChild(
    createElement(
      "button",
      { id: "undo-btn" },
      `<i class="bi bi-arrow-return-left"></i>`
    )
  );
  penControls.appendChild(
    createElement(
      "button",
      { id: "redo-btn" },
      `<i class="bi bi-arrow-return-right"></i>`
    )
  );
  penControls.appendChild(
    createElement(
      "button",
      { id: "reset-btn" },
      `<i class="bi bi-arrow-repeat"></i>`
    )
  );
  hud.appendChild(
    createElement("button", { id: "off-btn" }, `<i class="bi bi-x-circle"></i>`)
  );
  document.getElementById("pen-btn").addEventListener("click", function () {
    showAll();
    setPenMode("pen");
  });
  document.getElementById("eraser-btn").addEventListener("click", function () {
    showAll();
    setPenMode("eraser");
    console.log(penMode);
    document.getElementsByClassName("drawing-line").forEach((l) => {
      l.addEventListener("mouseenter", function () {
        if (penMode === "eraser" && mouseDown) {
          l.remove();
          rememberCurrentState();
        }
      });
    });
  });
  document.getElementById("undo-btn").addEventListener("click", function () {
    undo();
  });
  document.getElementById("redo-btn").addEventListener("click", function () {
    redo();
  });
  document.getElementById("reset-btn").addEventListener("click", function () {
    resetNotes();
    rememberCurrentState();
  });
  document.getElementById("off-btn").addEventListener("click", function () {
    if (penMode === "off") {
      setPenMode("pen");
      showAll();
    } else {
      setPenMode("off");
      hideAll();
    }
  });
}

function setupEventListeners() {
  alcMain.addEventListener("mousedown", registerMouseDown);
  alcMain.addEventListener("mouseup", registerMouseUp);
  alcMain.addEventListener("mousemove", onMouseMove);
  alcMain.addEventListener("mouseleave", onMouseLeave);
}

function undo() {
  // TODO
}

function redo() {
  // TODO
}

function rememberCurrentState() {
  // TODO
}

function setPenMode(m) {
  penMode = m;
  document.querySelectorAll(".pen-controls button.selected").forEach((btn) => {
    btn.classList.remove("selected");
  });
  if (m === "off") {
    const offButton = document.querySelector("#off-btn i");
    offButton.classList.remove("bi-x-circle");
    offButton.classList.add("bi-journal");
    return;
  } else {
    const offButton = document.querySelector("#off-btn i");
    offButton.classList.remove("bi-journal");
    offButton.classList.add("bi-x-circle");
    //! CHANGE THE FOLLOWING LINE WHEN ADDING NEW BUTTONS !//
    document.querySelector(".alc-current-problem").style["min-height"] = "400";
  }
  try {
    document
      .querySelector(`.pen-controls button#${penMode}-btn`)
      .classList.add("selected");
  } catch {
    console.error("Button for new mode not found");
  }
}

function registerMouseDown() {
  mouseDown = true;
}

function registerMouseUp() {
  mouseDown = false;

  if (currentLineEmpty()) {
    return;
  }
  if (penMode === "pen") {
    resetLine();
    rememberCurrentState();
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
  console.log("drawing");
  console.log(line);
  if (isFirstPoint) {
    line.M(mouseX, mouseY);
    isFirstPoint = false;
  } else {
    line.L(mouseX, mouseY);
  }
}

function onMouseLeave() {
  if (!mouseDown) {
    return;
  }
  resetLine();
}

function currentLineEmpty() {
  let lines = document.querySelectorAll(".drawing-line");
  let currentLine = lines[lines.length - 1];
  return currentLine.getAttribute("d") === "M0 0 ";
}

function resetLine() {
  line = draw
    .path()
    .addClass("drawing-line")
    .fill("none")
    .stroke({ color: "#000", width: 2, linecap: "round", linejoin: "round" });
  isFirstPoint = true;
}

function resetNotes() {
  let lines = document.querySelectorAll(".drawing-line");
  lines.forEach((e) => e.remove());
  resetLine();
}

function getCanvas() {
  alcMain = document.querySelector("div.alc--main");
}

function hideAll() {
  document.querySelector("body").classList.add("hide-canvas");
}

function showAll() {
  document.querySelector("body").classList.remove("hide-canvas");
}

function createElement(type = "div", attrs = {}, inner = "") {
  let element = document.createElement(type);
  Object.keys(attrs).forEach((key) => {
    element.setAttribute(key, attrs[key]);
  });
  element.innerHTML = inner;
  return element;
}

function calculateRelativePosition(e) {
  let rect = document.getElementById("alc-drawing").getBoundingClientRect();
  return {
    mouseX: e.clientX - rect.left,
    mouseY: e.clientY - rect.top,
  };
}
