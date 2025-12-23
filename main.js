// CALCULATOR LOGIC
const calculatorForm = document.getElementById("calculatorForm");
const resultsContainer = document.getElementById("resultsContainer");
const errorMessage = document.getElementById("errorMessage");
const heroFixturesInput = document.getElementById("heroNumberOfFixtures");
const calculatorFixturesInput = document.getElementById("numberOfFixtures");

// STAŁE
const WATTAGE_NEW = 34.5; // LED
const COST_PER_KWH = 1; // PLN
const DAYS_PER_YEAR = 365;
const REPLACEMENT_COST_PER_FIXTURE = 150; // PLN
const SENSOR_COST = 100; // PLN za czujnik

// Synchronizuj pola liczby opraw
heroFixturesInput.addEventListener("input", function () {
  calculatorFixturesInput.value = this.value;
  updateQuickSavings();
});

calculatorFixturesInput.addEventListener("input", function () {
  heroFixturesInput.value = this.value;
  updateQuickSavings();
});

calculatorForm.addEventListener("submit", function (e) {
  e.preventDefault();
  calculateSavings();
});

// Update quick savings display
function updateQuickSavings() {
  const numberOfFixtures = parseFloat(heroFixturesInput.value) || 0;

  if (numberOfFixtures <= 0) {
    document.getElementById("quickSavingsValue").textContent = "0 PLN";
    document.getElementById("quickSavingsSubtext").textContent =
      "Wpisz liczbę opraw wyżej";
    document.getElementById("quickConsumptionOld").textContent = "0 kWh";
    document.getElementById("quickConsumptionNew").textContent = "0 kWh";
    document.getElementById("quickROI").textContent = "-";
    return;
  }

  const wattageOld = 72; // Default values
  const hoursPerDay = 12;
  const hoursPerYear = hoursPerDay * DAYS_PER_YEAR;

  const totalPowerOldKw = (numberOfFixtures * wattageOld) / 1000;
  const totalPowerNewKw = (numberOfFixtures * WATTAGE_NEW) / 1000;

  const yearlyConsumptionOld = totalPowerOldKw * hoursPerYear;
  const yearlyConsumptionNew = totalPowerNewKw * hoursPerYear;

  const yearlySavings =
    (yearlyConsumptionOld - yearlyConsumptionNew) * COST_PER_KWH;
  const totalReplacementCost = numberOfFixtures * REPLACEMENT_COST_PER_FIXTURE;
  const roiYears = totalReplacementCost / yearlySavings;
  const roiMonths = Math.round(roiYears * 12);

  document.getElementById("quickSavingsValue").textContent =
    yearlySavings.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) +
    " PLN";
  document.getElementById(
    "quickSavingsSubtext"
  ).textContent = `rocznie dla ${numberOfFixtures} opraw`;
  document.getElementById("quickConsumptionOld").textContent =
    yearlyConsumptionOld.toLocaleString("pl-PL", {
      maximumFractionDigits: 0,
    }) + " kWh";
  document.getElementById("quickConsumptionNew").textContent =
    yearlyConsumptionNew.toLocaleString("pl-PL", {
      maximumFractionDigits: 0,
    }) + " kWh";

  const roiDisplay =
    roiYears < 1 ? `${roiMonths} miesięcy` : `${roiYears.toFixed(1)} lat`;
  document.getElementById("quickROI").textContent = roiDisplay;
}

// Initial update
updateQuickSavings();

function calculateSavings() {
  // INPUT
  const numberOfFixtures = parseFloat(
    document.getElementById("numberOfFixtures").value
  );
  const wattageOld = parseFloat(document.getElementById("wattageOld").value);
  const hoursPerDay = parseFloat(document.getElementById("hoursPerDay").value);
  const numberOfSensors =
    parseFloat(document.getElementById("numberOfSensors").value) || 0;
  const sensorControlledFixtures =
    parseFloat(document.getElementById("sensorControlledFixtures").value) || 0;

  // VALIDATION
  if (!numberOfFixtures || !wattageOld || !hoursPerDay) {
    showError("Proszę wypełnić wszystkie pola");
    return;
  }

  if (numberOfFixtures <= 0 || wattageOld <= 0 || hoursPerDay <= 0) {
    showError("Wszystkie wartości muszą być większe od zera");
    return;
  }

  errorMessage.classList.add("hidden");

  // OBLICZENIA
  const hoursPerYear = hoursPerDay * DAYS_PER_YEAR;

  // Oprawy bez czujników
  const regularFixtures = numberOfFixtures - sensorControlledFixtures;
  const totalPowerOldKw = (numberOfFixtures * wattageOld) / 1000; // kW

  // Oprawy z czujnikami zużywają 50% mniej (nowe LED)
  const powerNewRegular = (regularFixtures * WATTAGE_NEW) / 1000;
  const powerNewSensor = (sensorControlledFixtures * WATTAGE_NEW * 0.5) / 1000;
  const totalPowerNewKw = powerNewRegular + powerNewSensor; // kW

  const yearlyConsumptionOld = totalPowerOldKw * hoursPerYear; // kWh
  const yearlyConsumptionNew = totalPowerNewKw * hoursPerYear; // kWh

  const yearlyCostOld = yearlyConsumptionOld * COST_PER_KWH; // PLN
  const yearlyCostNew = yearlyConsumptionNew * COST_PER_KWH; // PLN

  const yearlySavings = yearlyCostOld - yearlyCostNew; // PLN
  const totalReplacementCost =
    numberOfFixtures * REPLACEMENT_COST_PER_FIXTURE +
    numberOfSensors * SENSOR_COST; // PLN
  const roiYears = totalReplacementCost / yearlySavings;
  const roiMonths = Math.round(roiYears * 12);

  const profit1Year = yearlySavings - totalReplacementCost;
  const profit5Years = yearlySavings * 5 - totalReplacementCost;

  // DISPLAY RESULTS
  document.getElementById("resultFixtures").textContent =
    numberOfFixtures.toFixed(0);
  document.getElementById("resultHoursPerYear").textContent =
    hoursPerYear.toLocaleString("pl-PL", { maximumFractionDigits: 0 });

  document.getElementById("resultOldConsumption").textContent =
    yearlyConsumptionOld.toLocaleString("pl-PL", {
      maximumFractionDigits: 2,
    }) + " kWh";
  document.getElementById("resultOldCost").textContent =
    yearlyCostOld.toLocaleString("pl-PL", { maximumFractionDigits: 2 }) +
    " PLN";

  document.getElementById("resultNewConsumption").textContent =
    yearlyConsumptionNew.toLocaleString("pl-PL", {
      maximumFractionDigits: 2,
    }) + " kWh";
  document.getElementById("resultNewCost").textContent =
    yearlyCostNew.toLocaleString("pl-PL", { maximumFractionDigits: 2 }) +
    " PLN";

  document.getElementById("resultYearlySavings").textContent =
    yearlySavings.toLocaleString("pl-PL", { maximumFractionDigits: 2 }) +
    " PLN";
  document.getElementById("resultReplacementCost").textContent =
    totalReplacementCost.toLocaleString("pl-PL", {
      maximumFractionDigits: 2,
    }) + " PLN";

  const roiDisplay =
    roiYears < 1
      ? `${roiMonths} miesięcy`
      : `${roiYears.toFixed(2)} lat (${roiMonths} miesięcy)`;
  document.getElementById("resultROI").textContent = roiDisplay;

  document.getElementById("resultProfit1Year").textContent =
    profit1Year.toLocaleString("pl-PL", { maximumFractionDigits: 2 }) + " PLN";
  document.getElementById("resultProfit5Years").textContent =
    profit5Years.toLocaleString("pl-PL", { maximumFractionDigits: 2 }) + " PLN";

  resultsContainer.classList.remove("hidden");

  // SCROLL TO RESULTS
  setTimeout(() => {
    resultsContainer.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  resultsContainer.classList.add("hidden");
}

// ALLOW ENTER TO SUBMIT
document
  .getElementById("hoursPerDay")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      calculatorForm.dispatchEvent(new Event("submit"));
    }
  });

// Sekcje do nawigacji (u Ciebie wszystkie section są bezpośrednio w body)
const sections = Array.from(document.querySelectorAll("body > section"));

let currentIndex = 0;
let lock = false;

// Aktualizuj currentIndex na podstawie tego, co jest najbliżej góry widoku
function updateIndexFromScroll() {
  const headerH = headerEl ? headerEl.offsetHeight : 0;
  let bestIdx = 0;
  let bestDist = Infinity;

  sections.forEach((sec, i) => {
    const top = sec.getBoundingClientRect().top - headerH;
    const dist = Math.abs(top);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  });

  currentIndex = bestIdx;
}
window.addEventListener(
  "scroll",
  () => {
    if (!lock) updateIndexFromScroll();
  },
  { passive: true }
);
updateIndexFromScroll();

function isTypingTarget(target) {
  if (!target) return false;
  if (target.closest('input, textarea, select, [contenteditable="true"]'))
    return true;
  return false;
}

function goTo(idx) {
  const clamped = Math.max(0, Math.min(idx, sections.length - 1));
  currentIndex = clamped;
  lock = true;

  const targetPosition = sections[clamped].offsetTop; // bez headerHeight i bez extraPadding
  window.scrollTo({ top: targetPosition, behavior: "smooth" });

  window.setTimeout(() => {
    lock = false;
    updateIndexFromScroll();
  }, 700);
}

window.addEventListener("keydown", (e) => {
  if (isTypingTarget(e.target)) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    goTo(currentIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    goTo(currentIndex - 1);
  }
});
