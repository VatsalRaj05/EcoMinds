// EcoSmart Dashboard JS

let heaterOn = false;
let heaterStart = null;
let acOn = false;
let lightOn = false;

let lightAutoOnDone = false;
let lightAutoOffDone = false;
const startTime = Date.now();

function updateStatus(id, state) {
  const element = document.getElementById(id);
  element.innerText = state ? "ON" : "OFF";
  element.style.backgroundColor = state ? "#dcfce7" : "#fef2f2";
  element.style.color = state ? "#16a34a" : "#dc2626";
}

function log(msg) {
  const logBox = document.getElementById("serial-log");
  logBox.textContent += msg + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}

function updateTemp(val, device) {
  const temp = parseInt(val);
  document.getElementById(device + "-temp").innerText = temp;

  if (device === "heater") {
    if (heaterOn && (temp >= 60 || Date.now() - heaterStart >= 15000)) {
      heaterOn = false;
      log("Heater auto OFF (Temp ≥ 60°C or time ≥ 15s).");
      updateStatus("heater-status", false);
    }
  }

  if (device === "ac") {
    if (!acOn && temp >= 26) {
      acOn = true;
      log("AC turned ON (Temp ≥ 26°C).");
      updateStatus("ac-status", true);
    } else if (acOn && temp <= 23) {
      acOn = false;
      log("AC turned OFF (Temp ≤ 23°C).");
      updateStatus("ac-status", false);
    }
  }
}

function checkLightAuto() {
  const elapsed = Date.now() - startTime;
  if (!lightAutoOnDone && elapsed >= 30000 && elapsed <= 60000) {
    lightOn = true;
    lightAutoOnDone = true;
    log("Light auto ON (Simulated 5 PM).\n");
    updateStatus("light-status", true);
  }
  if (!lightAutoOffDone && elapsed >= 60000) {
    lightOn = false;
    lightAutoOffDone = true;
    log("Light auto OFF (Simulated 11 PM).\n");
    updateStatus("light-status", false);
  }
}

function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");
  clock.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function setDarkMode(enabled) {
  const body = document.body;
  const btn = document.getElementById('dark-mode-toggle');
  if (enabled) {
    body.classList.add('dark-mode');
    btn.textContent = '☀️';
    btn.title = 'Switch to light mode';
    localStorage.setItem('darkMode', 'true');
  } else {
    body.classList.remove('dark-mode');
    btn.textContent = '🌙';
    btn.title = 'Switch to dark mode';
    localStorage.setItem('darkMode', 'false');
  }
}

document.addEventListener("DOMContentLoaded", function() {
  // Heater toggle
  document.getElementById("toggle-heater-btn").addEventListener("click", function() {
    if (!heaterOn) {
      heaterOn = true;
      heaterStart = Date.now();
      log("Heater turned ON.");
    } else {
      heaterOn = false;
      log("Heater manually turned OFF.");
    }
    updateStatus("heater-status", heaterOn);
  });

  // Light toggle
  document.getElementById("toggle-light-btn").addEventListener("click", function() {
    lightOn = !lightOn;
    log("Light " + (lightOn ? "turned ON" : "turned OFF") + " manually.");
    updateStatus("light-status", lightOn);
  });

  // Heater temp slider
  document.getElementById("heater-temp-slider").addEventListener("input", function(e) {
    updateTemp(e.target.value, "heater");
  });

  // AC temp slider
  document.getElementById("ac-temp-slider").addEventListener("input", function(e) {
    updateTemp(e.target.value, "ac");
  });

  // Tooltips (native via title attribute, so nothing needed)

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Start light auto check
  setInterval(checkLightAuto, 1000);

  // Dark mode toggle
  const darkModeBtn = document.getElementById('dark-mode-toggle');
  const darkPref = localStorage.getItem('darkMode') === 'true';
  setDarkMode(darkPref);
  darkModeBtn.addEventListener('click', function() {
    setDarkMode(!document.body.classList.contains('dark-mode'));
  });
}); 