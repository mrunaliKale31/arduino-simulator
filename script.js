let usedPins = { LED: [], BUTTON: [] };
let ledPins = [];
let buttonPins = [];
let arduinoAdded = false;

const canvas = document.getElementById("canvas");
const codeBlock = document.getElementById("codeBlock");

/* COMPONENT ADDING */

document.getElementById("add-arduino").onclick = () => {
  if (arduinoAdded) return alert("Only one Arduino allowed");
  addArduino();
  arduinoAdded = true;
};

document.getElementById("add-led").onclick = () => addComponent("LED", 10);
document.getElementById("add-button").onclick = () => addComponent("Push Button", 2);

function addArduino() {
  const div = document.createElement("div");
  div.className = "placed-component";
  div.innerText = "Arduino Uno";
  canvas.appendChild(div);
}

function addComponent(name, defaultPin) {
  const div = document.createElement("div");
  div.className = "placed-component";

  const label = document.createElement("span");
  label.innerText = name;

  const select = document.createElement("select");

  for (let pin = 2; pin <= 13; pin++) {
    if (!usedPins.LED.includes(pin) && !usedPins.BUTTON.includes(pin) || pin === defaultPin) {
      const opt = document.createElement("option");
      opt.value = pin;
      opt.innerText = "D" + pin;
      if (pin === defaultPin) opt.selected = true;
      select.appendChild(opt);
    }
  }

  trackPin(name, defaultPin);

  select.onchange = () => {
    updatePin(name, defaultPin, parseInt(select.value));
    defaultPin = parseInt(select.value);
    refreshDropdowns();
    generateCode();
  };

  div.append(label, select);
  canvas.appendChild(div);
  generateCode();
}

/* PIN LOGIC */

function trackPin(name, pin) {
  if (name === "LED") { usedPins.LED.push(pin); ledPins.push(pin); }
  if (name === "Push Button") { usedPins.BUTTON.push(pin); buttonPins.push(pin); }
}

function updatePin(name, oldPin, newPin) {
  usedPins.LED = usedPins.LED.filter(p => p !== oldPin);
  usedPins.BUTTON = usedPins.BUTTON.filter(p => p !== oldPin);
  trackPin(name, newPin);
}

function refreshDropdowns() {
  document.querySelectorAll("select").forEach(sel => {
    const current = parseInt(sel.value);
    sel.innerHTML = "";
    for (let p = 2; p <= 13; p++) {
      if (!usedPins.LED.includes(p) && !usedPins.BUTTON.includes(p) || p === current) {
        const o = document.createElement("option");
        o.value = p;
        o.innerText = "D" + p;
        if (p === current) o.selected = true;
        sel.appendChild(o);
      }
    }
  });
}

/* CODE GENERATION */

function generateCode() {
  if (!ledPins.length || !buttonPins.length) return;
  codeBlock.innerText = `
int ledPin = ${ledPins[0]};
int buttonPin = ${buttonPins[0]};

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);
}

void loop() {
  int state = digitalRead(buttonPin);
  digitalWrite(ledPin, state);
}
`.trim();
}

/* CODE VIEW */

const toggleBtn = document.getElementById("toggleView");
const codeView = document.getElementById("codeView");

toggleBtn.onclick = () => {
  codeView.style.display = codeView.style.display === "none" ? "block" : "none";
};

/* SIMULATION */

let running = false, pressed = false;
const simBtn = document.getElementById("simButton");
const simLED = document.getElementById("simLED");

document.getElementById("startSim").onclick = () => {
  running = true;
  simBtn.disabled = false;
};

document.getElementById("stopSim").onclick = () => {
  running = false;
  pressed = false;
  simBtn.disabled = true;
  simLED.innerText = "LED OFF";
  simLED.style.background = "red";
};

simBtn.onclick = () => {
  if (!running) return;
  pressed = !pressed;
  simLED.innerText = pressed ? "LED ON" : "LED OFF";
  simLED.style.background = pressed ? "green" : "red";
};

