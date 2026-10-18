
document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.getElementById("compare-cards");
  const table = document.getElementById("comparison-table");
  const subtitle = document.getElementById("compare-subtitle");
  const recommendation = document.getElementById("compare-recommendation");
  const chooseButton = document.getElementById("choose-recommended");

  const STORAGE_KEY = "civicSpaceCompareHalls";
  const halls = window.CIVICSPACE_HALLS || [];

  // Demo assumptions used only for the frontend comparison.
  const EXTRA_COSTS = {
    cleaning: 400,
    projector: 800,
    taxRate: 0.18,
    deposit: 2000
  };

  const savedIds = JSON.parse(
    sessionStorage.getItem(STORAGE_KEY) || "[]"
  );

  const selectedHalls = savedIds
    .map(id => window.CivicSpace.hallById(id))
    .filter(Boolean);

  function money(value) {
    return window.CivicSpace.money(value);
  }

  function safe(value) {
    return window.CivicSpace.escapeHTML(value);
  }

  function hallUrl(hall) {
    return `hall-details.html?id=${encodeURIComponent(hall.id)}`;
  }

  function totalFor(hall, duration) {
    const rental = hall.pricePerHour * duration;
    const cleaning = EXTRA_COSTS.cleaning;
    const projector = EXTRA_COSTS.projector;
    const tax = Math.round((rental + cleaning + projector) * EXTRA_COSTS.taxRate);

    return {
      rental,
      cleaning,
      projector,
      tax,
      deposit: EXTRA_COSTS.deposit,
      total: rental + cleaning + projector + tax + EXTRA_COSTS.deposit
    };
  }

  function cardTag(hall, index) {
    if (index === 0) return "Best match · 98%";
    if (hall.ecoScore >= 95) return `Greenest choice · ${hall.ecoScore} eco`;
    if (hall.capacity >= 250) return "Largest capacity";
    return `Eco score · ${hall.ecoScore}`;
  }

  function renderCards(duration) {
    cardsContainer.innerHTML = "";

    selectedHalls.forEach((hall, index) => {
      const card = document.createElement("article");
      card.className = "compare-hall-card";

      const tagClass = index === 2 ? "compare-hall-tag blue" : "compare-hall-tag";
      const cost = totalFor(hall, duration);

      card.innerHTML = `
        <img src="${safe(hall.image)}"
             alt="${safe(hall.name)}"
             loading="lazy">

        <span class="${tagClass}">
          ${safe(cardTag(hall, index))}
        </span>

        <h2>${safe(hall.name)}</h2>

        <p class="compare-hall-area">
          ${safe(hall.area)}, Pune
        </p>

        <a class="button button-green"
           href="${hallUrl(hall)}">
          Check availability
        </a>
      `;

      cardsContainer.appendChild(card);
    });
  }

  function tableRow(label, values) {
    return `
      <tr>
        <th scope="row">${safe(label)}</th>
        ${values.map(value => `<td>${value}</td>`).join("")}
      </tr>
    `;
  }

  function renderTable(duration) {
    const costs = selectedHalls.map(hall => totalFor(hall, duration));

    table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Compare features</th>
          ${selectedHalls.map(hall => `
            <th scope="col">${safe(hall.name.replace(/ (Community Hall|Garden Pavilion|Civic Centre)/, ""))}</th>
          `).join("")}
        </tr>
      </thead>

      <tbody>
        ${tableRow(
          "Seated capacity",
          selectedHalls.map(hall => `${hall.capacity} guests`)
        )}

        ${tableRow(
          "Hourly rental",
          selectedHalls.map(hall => money(hall.pricePerHour))
        )}

        ${tableRow(
          `${duration}-hour rental`,
          costs.map(cost => money(cost.rental))
        )}

        ${tableRow(
          "Projector + audio",
          selectedHalls.map((hall, index) => {
            if (hall.id === "lotus") {
              return `
                <span class="pricing-warning">
                  Pricing clarification<br>
                  ₹800/event shown as a demo estimate.
                  Final amount not yet established.
                </span>
              `;
            }
            return money(costs[index].projector) + " / event";
          })
        )}

        ${tableRow(
          "Cleaning fee",
          costs.map(cost => money(cost.cleaning))
        )}

        ${tableRow(
          "Tax · 18%",
          costs.map(cost => money(cost.tax))
        )}

        ${tableRow(
          "Refundable deposit",
          costs.map(cost => money(cost.deposit))
        )}

        ${tableRow(
          "Estimated total",
          costs.map(cost => money(cost.total))
        )}

        ${tableRow(
          "Step-free / accessible",
          selectedHalls.map(hall => {
            const facilities = hall.facilities || [];
            const accessible = facilities.some(item =>
              item.toLowerCase().includes("step-free")
            );
            return accessible ? "Yes / Yes" : "Contact venue";
          })
        )}

        ${tableRow(
          "Wi-Fi / parking",
          selectedHalls.map(hall => {
            const facilities = hall.facilities || [];
            const wifi = facilities.some(item =>
              item.toLowerCase().includes("wi-fi")
            ) ? "Yes" : "No";

            const parking = facilities.some(item =>
              item.toLowerCase().includes("parking")
            ) ? "Parking listed" : "Not listed";

            return `${wifi} / ${parking}`;
          })
        )}

        ${tableRow(
          "Air conditioning",
          selectedHalls.map(hall => {
            return hall.id === "riverside"
              ? "Yes"
              : hall.id === "lotus"
                ? "No · open pavilion"
                : "No · ventilated";
          })
        )}

        ${tableRow(
          "Eco score",
          selectedHalls.map(hall => `${hall.ecoScore} / 100`)
        )}

        ${tableRow(
          "Solar / waste sorting",
          selectedHalls.map(hall => {
            const features = hall.greenFeatures || [];
            const solar = features.some(item =>
              item.toLowerCase().includes("solar")
            ) ? "Yes" : "No";
            const waste = features.some(item =>
              item.toLowerCase().includes("waste")
            ) ? "Yes" : "No";
            return `${solar} / ${waste}`;
          })
        )}

        ${tableRow(
          "Distance from Kothrud",
          selectedHalls.map(hall => {
            const distances = {
              sahyadri: "2 km",
              lotus: "8 km",
              riverside: "9 km"
            };
            return distances[hall.id] || "Not available";
          })
        )}

        ${tableRow(
          "Morning availability",
          selectedHalls.map(() => `<span class="available">Check with venue</span>`)
        )}
      </tbody>
    `;
  }

  function renderRecommendation(duration) {
    const firstHall = selectedHalls[0];

    if (!firstHall) {
      recommendation.innerHTML = "";
      return;
    }

    recommendation.innerHTML = `
      <span class="recommendation-icon">✓</span>
      <div>
        <strong>Our recommendation: ${safe(firstHall.name)}</strong>
        <p>
          ${safe(firstHall.name)} is first in your selected shortlist.
          Review the capacity, facilities and estimated total before
          choosing. All totals are sample estimates, not confirmed charges.
        </p>
      </div>
    `;

    chooseButton.href = hallUrl(firstHall);
    chooseButton.textContent = `Choose ${firstHall.name}`;
  }

  function render() {
    if (selectedHalls.length === 0) {
      cardsContainer.innerHTML = `
        <div class="compare-empty">
          <h2>Your shortlist is empty</h2>
          <p>
            Open Smart Finder and select the halls you want to compare.
          </p>
          <a class="button button-green" href="smart-finder.html">
            Back to Smart Finder
          </a>
        </div>
      `;

      table.innerHTML = "";
      recommendation.innerHTML = "";
      chooseButton.style.display = "none";
      subtitle.textContent = "Select halls in Smart Finder to compare them.";
      return;
    }

    chooseButton.style.display = "";

    const duration = 4;

    subtitle.textContent =
      `A side-by-side view of ${selectedHalls.length} halls · ` +
      `4 hours · Sample estimates`;

    renderCards(duration);
    renderTable(duration);
    renderRecommendation(duration);
  }

  render();
});
