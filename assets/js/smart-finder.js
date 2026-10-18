
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("smart-finder-form");
  const resultsContainer = document.getElementById("smart-results");
  const countHeading = document.getElementById("recommendation-count");
  const dateHeading = document.getElementById("recommendation-date");

  const halls = window.CIVICSPACE_HALLS || [];
  const COMPARE_KEY = "civicSpaceCompareHalls";

  const areaDistances = {
    sahyadri: 2,
    lotus: 8,
    riverside: 9
  };

  // Read the saved shortlist safely.
  function getSelectedCompareIds() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(COMPARE_KEY) || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  // Save shortlist and synchronize all button labels.
  function saveCompareIds(selectedIds) {
    sessionStorage.setItem(
      COMPARE_KEY,
      JSON.stringify(selectedIds)
    );

    restoreCompareButtons();
    updateCompareLink();
  }

  // Restore buttons after returning from Compare or rerendering.
  function restoreCompareButtons() {
    const selectedIds = getSelectedCompareIds();

    document.querySelectorAll(".compare-button").forEach(button => {
      const hallId = button.dataset.hallId;
      const isSelected = selectedIds.includes(hallId);

      button.textContent = isSelected
        ? "Added to compare"
        : "Compare";

      button.classList.toggle("is-selected", isSelected);

      button.setAttribute(
        "aria-pressed",
        String(isSelected)
      );
    });
  }

  // Create or update the Compare shortlist link.
  function updateCompareLink() {
    const selectedIds = getSelectedCompareIds();
    let compareLink = document.getElementById(
      "compare-shortlist-link"
    );

    if (selectedIds.length === 0) {
      if (compareLink) {
        compareLink.remove();
      }
      return;
    }

    if (!compareLink) {
      compareLink = document.createElement("a");
      compareLink.id = "compare-shortlist-link";
      compareLink.className = "button button-green";
      compareLink.href = "compare.html";

      resultsContainer.after(compareLink);
    }

    compareLink.textContent =
      `Compare shortlist (${selectedIds.length})`;

    compareLink.style.display = "inline-flex";
  }

  function getRequirements() {
    const checkedFacilities = Array.from(
      document.querySelectorAll(
        ".facility-options input[type='checkbox']:checked"
      )
    ).map(input => input.value);

    return {
      eventType: document.getElementById("event-type").value,
      guests: Number(
        document.getElementById("guest-count").value
      ),
      date: document.getElementById("event-date").value,
      duration: Number(
        document.getElementById("event-duration").value
      ),
      budget: Number(
        document.getElementById("budget").value
      ),
      area: document.getElementById("preferred-area").value,
      facilities: checkedFacilities,
      preferSustainability:
        document.getElementById("prefer-sustainability").checked
    };
  }

  function calculateMatch(hall, requirements) {
    const capacityScore =
      hall.capacity >= requirements.guests ? 100 : 0;

    const budgetScore =
      hall.pricePerHour <= requirements.budget
        ? 100
        : Math.max(
            0,
            100 -
              ((hall.pricePerHour - requirements.budget) /
                Math.max(requirements.budget, 1)) *
                100
          );

    const hallFacilities = hall.facilities || [];

    const matchedFacilities = requirements.facilities.filter(
      required => {
        return hallFacilities.some(facility =>
          facility.toLowerCase().includes(required.toLowerCase()) ||
          required.toLowerCase().includes(facility.toLowerCase())
        );
      }
    );

    const facilityScore =
      requirements.facilities.length === 0
        ? 100
        : (matchedFacilities.length /
            requirements.facilities.length) *
          100;

    const distance = areaDistances[hall.id] ?? 10;

    const distanceScore =
      requirements.area === "any"
        ? 100
        : hall.area.toLowerCase() ===
            requirements.area.toLowerCase()
          ? 100
          : Math.max(0, 100 - distance * 5);

    const sustainabilityScore = hall.ecoScore || 0;

    const weightedScore =
      capacityScore * 0.30 +
      budgetScore * 0.25 +
      facilityScore * 0.25 +
      distanceScore * 0.10 +
      sustainabilityScore * 0.10;

    const finalScore = Math.round(weightedScore);
    const reasons = [];

    if (capacityScore === 100) {
      reasons.push(
        `Capacity comfortably fits your ${requirements.guests} guests`
      );
    } else {
      reasons.push(
        `Capacity is ${hall.capacity} guests; your group has ${requirements.guests}`
      );
    }

    if (hall.pricePerHour <= requirements.budget) {
      reasons.push(
        `Rental is within your ${window.CivicSpace.money(requirements.budget)}/h budget`
      );
    } else {
      reasons.push(
        `Rental is ${window.CivicSpace.money(hall.pricePerHour - requirements.budget)}/h above budget`
      );
    }

    if (requirements.facilities.length === 0) {
      reasons.push("No must-have facilities selected");
    } else if (
      matchedFacilities.length === requirements.facilities.length
    ) {
      reasons.push("All required facilities are listed");
    } else {
      reasons.push(
        `${matchedFacilities.length} of ${requirements.facilities.length} required facilities listed`
      );
    }

    const summaryParts = [];

    summaryParts.push(
      requirements.area === "any"
        ? `${distance} km away`
        : hall.area.toLowerCase() ===
            requirements.area.toLowerCase()
          ? `In your preferred area · ${distance} km nearby`
          : `${distance} km from your preferred area`
    );

    if (requirements.preferSustainability) {
      summaryParts.push(`Eco ${sustainabilityScore}`);
    }

    if (hall.capacity > requirements.guests) {
      summaryParts.push("Extra capacity available");
    }

    const hasTradeoff =
      hall.capacity < requirements.guests ||
      hall.pricePerHour > requirements.budget ||
      matchedFacilities.length < requirements.facilities.length;

    return {
      score: finalScore,
      reasons,
      summary: summaryParts.join(" · "),
      hasTradeoff,
      distance,
      matchedFacilities
    };
  }

  function hallImage(hall) {
    return hall.image || "../assets/images/hall-placeholder.png";
  }

  function hallDetailsUrl(hall) {
    return `hall-details.html?id=${encodeURIComponent(hall.id)}`;
  }

  function renderHall(hall, match) {
    const card = document.createElement("article");
    card.className = "smart-hall-card";

    const safeName = window.CivicSpace.escapeHTML(hall.name);
    const safeArea = window.CivicSpace.escapeHTML(hall.area);
    const safeImage = window.CivicSpace.escapeHTML(hallImage(hall));

    const badgeClass = match.hasTradeoff
      ? "match-badge tradeoff"
      : "match-badge";

    const summaryClass = match.hasTradeoff
      ? "match-summary tradeoff-text"
      : "match-summary";

    card.innerHTML = `
      <img
        class="smart-hall-image"
        src="${safeImage}"
        alt="${safeName}"
        loading="lazy"
      >

      <div class="smart-hall-content">

        <div class="smart-hall-title-row">
          <h3>${safeName}</h3>
          <span class="${badgeClass}">
            ${match.score}% match
          </span>
        </div>

        <p class="smart-hall-meta">
          ${safeArea}, Pune · ${hall.capacity} guests ·
          ${window.CivicSpace.money(hall.pricePerHour)}/h
        </p>

        <ul class="match-reasons">
          ${match.reasons.map(reason => `
            <li>
              <span class="reason-icon">✓</span>
              <span>${window.CivicSpace.escapeHTML(reason)}</span>
            </li>
          `).join("")}
        </ul>

        <p class="${summaryClass}">
          ${window.CivicSpace.escapeHTML(match.summary)}
        </p>

        <div class="smart-hall-actions">
          <a class="button button-green"
             href="${hallDetailsUrl(hall)}">
            Check availability
          </a>

          <button class="button button-outline compare-button"
                  type="button"
                  data-hall-id="${hall.id}"
                  aria-pressed="false">
            Compare
          </button>
        </div>

      </div>
    `;

    return card;
  }

  function renderRecommendations() {
    const requirements = getRequirements();

    if (!requirements.guests || requirements.guests < 1) {
      resultsContainer.innerHTML = `
        <div class="smart-empty">
          <h3>Enter your guest count</h3>
          <p>
            Enter a valid number of guests to see hall recommendations.
          </p>
        </div>
      `;

      countHeading.textContent = "Recommendations";
      restoreCompareButtons();
      updateCompareLink();
      return;
    }

    if (
      !Number.isFinite(requirements.budget) ||
      requirements.budget < 0
    ) {
      resultsContainer.innerHTML = `
        <div class="smart-empty">
          <h3>Check your budget</h3>
          <p>
            Enter a valid hourly budget to calculate recommendations.
          </p>
        </div>
      `;

      countHeading.textContent = "Recommendations";
      restoreCompareButtons();
      updateCompareLink();
      return;
    }

    const ranked = halls
      .map(hall => ({
        hall,
        match: calculateMatch(hall, requirements)
      }))
      .sort((a, b) => b.match.score - a.match.score);

    resultsContainer.innerHTML = "";

    ranked.forEach(item => {
      resultsContainer.appendChild(
        renderHall(item.hall, item.match)
      );
    });

    countHeading.textContent =
      `${ranked.length} ranked recommendations`;

    if (requirements.date) {
      const readableDate = new Date(
        `${requirements.date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      dateHeading.textContent =
        `Based on your requirements · Calculated ${readableDate}`;
    } else {
      dateHeading.textContent =
        "Based on your requirements · Sample recommendations";
    }

    // Restore selection after every render.
    restoreCompareButtons();
    updateCompareLink();
  }

  // Update recommendations form.
  form.addEventListener("submit", event => {
    event.preventDefault();
    renderRecommendations();
  });

  // Compare button: add/remove a hall from the saved shortlist.
  document.addEventListener("click", event => {
    const button = event.target.closest(".compare-button");
    if (!button) return;

    const hallId = button.dataset.hallId;
    let selected = getSelectedCompareIds();

    if (selected.includes(hallId)) {
      selected = selected.filter(id => id !== hallId);
    } else {
      if (selected.length >= 3) {
        alert("You can compare up to 3 halls at a time.");
        return;
      }

      selected.push(hallId);
    }

    saveCompareIds(selected);
  });

  // Set date to today if no date is selected.
  const dateInput = document.getElementById("event-date");

  if (!dateInput.value) {
    const today = new Date();

    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    dateInput.value = localToday;
  }

  // Initial render and restore.
  renderRecommendations();
});
