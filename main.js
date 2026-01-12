// CALCULATOR LOGIC
const calculatorForm = document.getElementById("calculatorForm");
const resultsContainer = document.getElementById("resultsContainer");
const errorMessage = document.getElementById("errorMessage");
const heroFixturesInput = document.getElementById("heroNumberOfFixtures");
const calculatorFixturesInput = document.getElementById("numberOfFixtures");

// STAŁE
const WATTAGE_NEW = 34.5; // LED
const COST_PER_KWH_DEFAULT = 1.11; // PLN
const DAYS_PER_YEAR = 365;
const REPLACEMENT_COST_PER_FIXTURE_DEFAULT = 149; // PLN
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

  const quickSavingsEl = document.getElementById("quickSavingsValue");
  const quickReplacementEl = document.getElementById("quickReplacementCost");
  const quickRoiEl = document.getElementById("quickROI");
  const quickProfit5El = document.getElementById("quickProfit5Years");

  if (!quickSavingsEl) return;

  // Jeśli tych pól nie ma na stronie, po prostu nie aktualizuj (bez błędów)
  const hasExtras = quickReplacementEl && quickRoiEl && quickProfit5El;

  if (numberOfFixtures <= 0) {
    quickSavingsEl.textContent = "0 PLN";
    if (hasExtras) {
      quickReplacementEl.textContent = "0 PLN";
      quickRoiEl.textContent = "-";
      quickProfit5El.textContent = "0 PLN";
    }
    return;
  }

  // Założenia jak w Twoim szybkim podglądzie
  const wattageOld = 72;
  const hoursPerDay = 12;
  const hoursPerYear = hoursPerDay * DAYS_PER_YEAR;

  const totalPowerOldKw = (numberOfFixtures * wattageOld) / 1000;
  const totalPowerNewKw = (numberOfFixtures * WATTAGE_NEW) / 1000;

  const yearlyConsumptionOld = totalPowerOldKw * hoursPerYear;
  const yearlyConsumptionNew = totalPowerNewKw * hoursPerYear;

  const yearlySavings =
    (yearlyConsumptionOld - yearlyConsumptionNew) * COST_PER_KWH_DEFAULT;

  quickSavingsEl.textContent =
    yearlySavings.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) +
    " PLN";

  if (!hasExtras) return;

  // Koszt wymiany (w podglądzie przyjmujemy brak czujników, więc tylko oprawy)
  const totalReplacementCost =
    numberOfFixtures * REPLACEMENT_COST_PER_FIXTURE_DEFAULT;

  quickReplacementEl.textContent =
    totalReplacementCost.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) +
    " PLN";

  // ROI
  if (yearlySavings > 0) {
    const roiYears = totalReplacementCost / yearlySavings;
    const roiMonths = Math.round(roiYears * 12);
    const roiDisplay =
      roiYears < 1
        ? `${roiMonths} miesięcy`
        : `${roiYears.toFixed(2)} lat (${roiMonths} miesięcy)`;

    quickRoiEl.textContent = roiDisplay;
  } else {
    quickRoiEl.textContent = "-";
  }

  // Zysk po 5 latach
  const profit5Years = yearlySavings * 5 - totalReplacementCost;
  quickProfit5El.textContent =
    profit5Years.toLocaleString("pl-PL", { maximumFractionDigits: 0 }) + " PLN";
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
  const costPerKwh =
    parseFloat(document.getElementById("costPerKwh").value) ||
    COST_PER_KWH_DEFAULT;
  const fixtureTypeCost =
    parseFloat(document.getElementById("fixtureType").value) ||
    REPLACEMENT_COST_PER_FIXTURE_DEFAULT;

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

  const yearlyCostOld = yearlyConsumptionOld * costPerKwh; // PLN
  const yearlyCostNew = yearlyConsumptionNew * costPerKwh; // PLN

  const yearlySavings = yearlyCostOld - yearlyCostNew; // PLN
  const totalReplacementCost =
    numberOfFixtures * fixtureTypeCost + numberOfSensors * SENSOR_COST; // PLN
  const roiYears = totalReplacementCost / yearlySavings;
  const roiMonths = Math.round(roiYears * 12);

  const profit1Year = yearlySavings - totalReplacementCost;
  const profit5Years = yearlySavings * 5 - totalReplacementCost;

  // DISPLAY RESULTS

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

  document.getElementById("resultProfit5Years").textContent =
    profit5Years.toLocaleString("pl-PL", { maximumFractionDigits: 2 }) + " PLN";

  resultsContainer.classList.remove("hidden");

  requestAnimationFrame(() => {
    pulseResultsBox();
  });
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
/* ANIMACJA PULSOWANIA WYNIKÓW PO KALKULACJI */
function pulseResultsBox() {
  const box = document.querySelector("#resultsContainer .results");
  if (!box) return;

  box.classList.remove("is-pulsing");
  void box.offsetWidth; // wymusza reflow, żeby animacja mogła odpalić ponownie
  box.classList.add("is-pulsing");
}

/* SLIDER */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("qsTrack");
  const prevBtn = document.querySelector(".qs-arrow--left");
  const nextBtn = document.querySelector(".qs-arrow--right");

  if (!track || !prevBtn || !nextBtn) return;

  const slides = Array.from(track.querySelectorAll(".savings-card"));
  if (slides.length === 0) return;

  // start: 2. slajd (jeśli istnieje)
  let index = slides.length > 1 ? 1 : 0;

  track.style.transition = "transform 300ms ease";
  track.style.willChange = "transform";

  // Mapowanie etykiet po data-slide (left/center/right)
  const labelsBySlideKey = {
    left: {
      html: "Jestem Właścicielem.<br />Pokaż moje korzyści",
      aria: "Jestem Właścicielem. Pokaż moje korzyści",
    },
    center: {
      html: "Podgląd oszczędności",
      aria: "Podgląd oszczędności",
    },
    right: {
      html: "Jestem Najemcą.<br />Pokaż moje korzyści",
      aria: "Jestem Najemcą. Pokaż moje korzyści",
    },
  };

  function getLabelForSlide(i) {
    const key = slides[i]?.dataset?.slide; // "left" | "center" | "right"
    return labelsBySlideKey[key] || { html: "Dalej", aria: "Dalej" };
  }

  function setBtnLabel(btn, label) {
    btn.innerHTML = label.html;
    btn.setAttribute("aria-label", label.aria);
  }

  // Ustaw teksty tak, by mówiły dokąd przewinie kliknięcie
  function updateNavLabels() {
    if (slides.length < 2) return;

    const prevIndex = (index - 1 + slides.length) % slides.length;
    const nextIndex = (index + 1) % slides.length;

    setBtnLabel(prevBtn, getLabelForSlide(prevIndex));
    setBtnLabel(nextBtn, getLabelForSlide(nextIndex));
  }

  function render() {
    track.scrollTo({ left: slides[index].offsetLeft, behavior: "smooth" });
    updateNavLabels();
  }

  function next() {
    index = (index + 1) % slides.length;
    render();
  }

  function prev() {
    index = (index - 1 + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // (Opcjonalnie) jeśli user może przesuwać palcem/myszą track:
  let scrollTimeout = null;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const currentLeft = track.scrollLeft;
      let closest = 0;
      let bestDist = Infinity;

      for (let i = 0; i < slides.length; i++) {
        const dist = Math.abs(slides[i].offsetLeft - currentLeft);
        if (dist < bestDist) {
          bestDist = dist;
          closest = i;
        }
      }

      if (closest !== index) {
        index = closest;
        updateNavLabels();
      }
    }, 80);
  });

  render();
  window.addEventListener("resize", render);
});

/* SKAKANIE STRZALKAMI */

(() => {
  // Zbierz wszystkie sekcje (tylko te, które faktycznie mają wysokość)
  const getSections = () =>
    Array.from(document.querySelectorAll("section")).filter(
      (s) => s.offsetHeight > 0
    );

  const isTyping = () => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      el.isContentEditable
    );
  };

  const headerOffset = () => {
    const header = document.querySelector("header");
    return header ? header.getBoundingClientRect().height : 0;
  };

  const currentIndex = (sections) => {
    const y = window.scrollY + headerOffset() + 8; // 8px bufor
    let idx = 0;

    for (let i = 0; i < sections.length; i++) {
      const top = sections[i].offsetTop;
      if (top <= y) idx = i;
      else break;
    }
    return idx;
  };

  const scrollToSection = (section) => {
    if (!section) return;

    // Dokładnie od początku sekcji (bez kompensacji headera)
    const y = section.offsetTop;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  window.addEventListener(
    "keydown",
    (e) => {
      // Nie przeszkadzaj w formularzu i nie przechwytuj skrótów typu Ctrl/Alt/Meta
      if (isTyping()) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const sections = getSections();
      if (sections.length === 0) return;

      const key = e.key;

      const goNext = key === "ArrowDown" || key === "PageDown";
      const goPrev = key === "ArrowUp" || key === "PageUp";
      const goHome = key === "Home";
      const goEnd = key === "End";

      if (!(goNext || goPrev || goHome || goEnd)) return;

      e.preventDefault();

      const idx = currentIndex(sections);

      if (goHome) return scrollToSection(sections[0]);
      if (goEnd) return scrollToSection(sections[sections.length - 1]);

      const nextIdx = goNext
        ? Math.min(sections.length - 1, idx + 1)
        : Math.max(0, idx - 1);
      scrollToSection(sections[nextIdx]);
    },
    { passive: false }
  );
})();
