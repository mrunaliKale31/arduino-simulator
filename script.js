let simulationRunning = false;


const DIGITAL_PINS = [2,3,4,5,6,7,8,9,10,11,12,13];

function getUsedPins(except = null) {
  return Object.values(circuit.components)
    .filter(c => c !== except)
    .map(c => c.pin);
}

function getAvailablePins(except = null) {
  const used = getUsedPins(except);
  return DIGITAL_PINS.filter(p => !used.includes(p));
}


// -------- CIRCUIT MODEL --------
const circuit = {
  board: null,
  components: {}
};

// Track dragged component type
let draggedType = null;

// -------- DRAG FROM PALETTE --------
document.querySelectorAll(".component").forEach(item => {
  item.addEventListener("dragstart", (e) => {
    draggedType = e.target.dataset.type;
  });
});

// -------- CANVAS DROP --------
const boardArea = document.getElementById("board-area");

boardArea.addEventListener("dragover", (e) => {
  e.preventDefault(); // allow drop
});

boardArea.addEventListener("drop", (e) => {
  e.preventDefault();

  if (draggedType === "arduino") placeArduino();
  if (draggedType === "led") placeLED();
  if (draggedType === "button") placeButton();

});

function placeArduino() {
  if (circuit.board) {
    alert("Arduino already placed!");
    return;
  }

  const arduino = document.createElement("div");
  arduino.className = "arduino";
  arduino.style.left = "50%";
  arduino.style.top = "50%";
  arduino.style.transform = "translate(-50%, -50%)";

  arduino.innerHTML = `
  <img 
    src="arduino.png"
    class="arduino-img"
    draggable="false"
  />
`;

  boardArea.appendChild(arduino);
  makeDraggable(arduino);

  circuit.board = {
    type: "arduino-uno",
    pins: [2,3,4,5,6,7,8,9,10,11,12,13]
  };

  console.log("Arduino placed", circuit);


}

function placeLED() {
  if (!circuit.board) {
    alert("Place Arduino first");
    return;
  }

  if (circuit.components.led) {
    alert("LED already placed");
    return;
  }

  const led = document.createElement("div");
  led.className = "led";
  led.style.left = "20%";
  led.style.top = "20%";

  const pinSelect = document.createElement("select");

  DIGITAL_PINS.forEach(pin => {
    const opt = document.createElement("option");
    opt.value = pin;
    opt.text = "D" + pin;
    if (pin === 10) opt.selected = true;
    pinSelect.appendChild(opt);
  });

  led.innerHTML = `<strong>LED</strong><br>`;
  led.appendChild(pinSelect);

  boardArea.appendChild(led);
  makeDraggable(led);

  const ledObj = {
    type: "led",
    pin: 10,
    state: "OFF",
    element: led
  };

  circuit.components.led = ledObj;

  pinSelect.addEventListener("change", () => {
    const newPin = Number(pinSelect.value);
    const available = getAvailablePins(ledObj);

    if (!available.includes(newPin)) {
      alert("Pin already in use!");
      pinSelect.value = ledObj.pin;
      return;
    }

    ledObj.pin = newPin;
    refreshPinOptions();
    generateArduinoCode();


  });

  refreshPinOptions();
  generateArduinoCode();


}


function placeButton() {
  if (!circuit.board) {
    alert("Place Arduino first");
    return;
  }

  if (circuit.components.button) {
    alert("Button already placed");
    return;
  }

  const btn = document.createElement("div");
  btn.className = "button";
  btn.style.left = "20%";
  btn.style.top = "50%";

  const pinSelect = document.createElement("select");

  DIGITAL_PINS.forEach(pin => {
    const opt = document.createElement("option");
    opt.value = pin;
    opt.text = "D" + pin;
    if (pin === 2) opt.selected = true;
    pinSelect.appendChild(opt);
  });

  btn.innerHTML = `<strong>Button</strong><br>`;
  btn.appendChild(pinSelect);

  boardArea.appendChild(btn);
  makeDraggable(btn);

  const btnObj = {
    type: "button",
    pin: 2,
    pressed: false,
    element: btn
  };

  btn.addEventListener("mousedown", () => {
  if (!simulationRunning) return;

  btnObj.pressed = true;
  btn.classList.add("pressed");

  const led = circuit.components.led;
  if (led) {
    led.element.classList.add("on");
  }

  generateArduinoCode("Button PRESSED → LED ON");
});

btn.addEventListener("mouseup", () => {
  if (!simulationRunning) return;

  btnObj.pressed = false;
  btn.classList.remove("pressed");

  const led = circuit.components.led;
  if (led) {
    led.element.classList.remove("on");
  }

  generateArduinoCode("Button RELEASED → LED OFF");
});


  circuit.components.button = btnObj;

  btn.addEventListener("mousedown", () => {
  if (!simulationRunning) return;

  btnObj.pressed = true;
  btn.classList.add("pressed");

  const led = circuit.components.led;
  if (led && led.pin === btnObj.pin) {
    led.element.classList.add("on");
  }
});

btn.addEventListener("mouseup", () => {
  if (!simulationRunning) return;

  btnObj.pressed = false;
  btn.classList.remove("pressed");

  const led = circuit.components.led;
  if (led) {
    led.element.classList.remove("on");
  }
});

  btn.addEventListener("mousedown", () => {
    if (!simulationRunning) return;

    btnObj.pressed = true;
    btn.classList.add("pressed");

    const led = circuit.components.led;
    if (led) {
      led.element.classList.add("on");
    }
  });

  btn.addEventListener("mouseup", () => {
    if (!simulationRunning) return;

    btnObj.pressed = false;
    btn.classList.remove("pressed");

    const led = circuit.components.led;
    if (led) {
      led.element.classList.remove("on");
    }
  });

  pinSelect.addEventListener("change", () => {
    const newPin = Number(pinSelect.value);
    const available = getAvailablePins(btnObj);

    if (!available.includes(newPin)) {
      alert("Pin already in use!");
      pinSelect.value = btnObj.pin;
      return;
    }

    btnObj.pin = newPin;
    refreshPinOptions();
    generateArduinoCode();


  });

  refreshPinOptions();
  generateArduinoCode();

}


function refreshPinOptions() {
  Object.values(circuit.components).forEach(component => {
    const select = component.element.querySelector("select");
    const available = getAvailablePins(component);

    Array.from(select.options).forEach(opt => {
      opt.disabled = !available.includes(Number(opt.value)) &&
                     Number(opt.value) !== component.pin;
    });
  });
}

let activeElement = null;
let offsetX = 0;
let offsetY = 0;

function makeDraggable(element) {
  element.classList.add("draggable");

  element.addEventListener("mousedown", (e) => {
    activeElement = element;
    const rect = element.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  });
}

function drag(e) {
  if (!activeElement) return;

  const boardRect = boardArea.getBoundingClientRect();

  let x = e.clientX - boardRect.left - offsetX;
  let y = e.clientY - boardRect.top - offsetY;

  // keep inside board
  x = Math.max(0, Math.min(x, boardRect.width - activeElement.offsetWidth));
  y = Math.max(0, Math.min(y, boardRect.height - activeElement.offsetHeight));

  activeElement.style.left = x + "px";
  activeElement.style.top = y + "px";

  drawWires();
}

function stopDrag() {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
  activeElement = null;
}

function generateArduinoCode() {
  const led = circuit.components.led;
  const button = circuit.components.button;

  if (!led || !button) {
    document.getElementById("code").textContent =
      "// Place Arduino, LED and Button to generate code";
    return;
  }

  const code = `
int LED_PIN = ${led.pin};
int BUTTON_PIN = ${button.pin};

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);

  if (buttonState == HIGH) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}
`.trim();

  document.getElementById("code").textContent = code;
}

document.getElementById("startBtn").addEventListener("click", () => {
  simulationRunning = true;
  alert("Simulation started");
});

document.getElementById("stopBtn").addEventListener("click", () => {
  simulationRunning = false;

  const led = circuit.components.led;
  const button = circuit.components.button;

  if (led) led.element.classList.remove("on");
  if (button) button.element.classList.remove("pressed");

  alert("Simulation stopped");
});

function getCenter(el) {
  const rect = el.getBoundingClientRect();
  const boardRect = boardArea.getBoundingClientRect();

  return {
    x: rect.left - boardRect.left + rect.width / 2,
    y: rect.top - boardRect.top + rect.height / 2
  };
}

function generateArduinoCode(extraComment = "") {
  const led = circuit.components.led;
  const btn = circuit.components.button;

  let code = `// Auto-generated Arduino Code\n\n`;

  if (!simulationRunning) {
    code += `\n\n`;
  }

  if (led) {
    code += `const int LED_PIN = ${led.pin};\n`;
  }
  if (btn) {
    code += `const int BUTTON_PIN = ${btn.pin};\n`;
  }

  code += `\nvoid setup() {\n`;

  if (led) code += `  pinMode(LED_PIN, OUTPUT);\n`;
  if (btn) code += `  pinMode(BUTTON_PIN, INPUT);\n`;

  code += `}\n\nvoid loop() {\n`;

  if (led && btn) {
    code += `  int buttonState = digitalRead(BUTTON_PIN);\n\n`;
    code += `  if (buttonState == HIGH) {\n`;
    code += `    digitalWrite(LED_PIN, HIGH);\n`;
    code += `  } else {\n`;
    code += `    digitalWrite(LED_PIN, LOW);\n`;
    code += `  }\n`;
  }

  if (extraComment) {
    code += `\n  // ${extraComment}\n`;
  }

  code += `}\n`;

  document.getElementById("code").textContent = code;
}
