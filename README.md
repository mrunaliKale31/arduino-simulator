# Arduino Logic Simulator (Web-Based)

## Project Overview
This project is a **web-based Arduino logic simulator** designed to demonstrate the core concepts of **pin mapping, input/output interaction, and Arduino code generation** without requiring physical hardware.

The simulator allows users to add components such as an **Arduino Uno, LEDs, and Push Buttons**, assign digital pins, and observe how inputs affect outputs logically — similar to how real Arduino programs behave.

This project focuses on **educational clarity and logical correctness**, rather than electrical or voltage-level simulation.

---

## Objectives
- Understand Arduino **digital pin usage (D2–D13)**
- Simulate **input (Push Button)** and **output (LED)** behavior
- Prevent pin conflicts using logical constraints
- Automatically generate corresponding **Arduino C/C++ code**
- Provide a simple, browser-based environment for beginners

---

## Features
- Add **only one Arduino Uno** (constraint enforced)
- Add multiple LEDs and Push Buttons
- Assign digital pins using dropdowns
- Prevent duplicate pin assignments
- Toggle between **Circuit View** and **Code View**
- Generate valid Arduino code dynamically
- Simple simulation of button press → LED ON/OFF behavior

---

## How It Works
- Push Buttons simulate `digitalRead()`
- LEDs simulate `digitalWrite()`
- Pin assignments update the generated Arduino sketch
- Logic is handled using JavaScript state management

This abstraction helps beginners understand **how software controls hardware logic** before working with real components.

---

## Tech Stack
- HTML
- CSS
- JavaScript (Vanilla)

---

## How to Run
1. Clone the repository:
   ```bash
   git clone <repository-url>
