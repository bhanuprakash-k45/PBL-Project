/* CivicSpace frontend
   Sample data only. Django/API availability is not connected yet.
*/

(() => {
  const halls = window.CIVICSPACE_HALLS || [];
  const money = window.CivicSpace.money;
  const escape = window.CivicSpace.escapeHTML;

  // HOME PAGE SEARCH
  const homeSearch = document.getElementById("hall-search");

  if (homeSearch) {
    homeSearch.addEventListener("submit", event => {
      event.preventDefault();

      const params = new URLSearchParams();
      const area = document.getElementById("neighbourhood")?.value || "";
      const date = document.getElementById("event-date")?.value || "";
      const guests = document.getElementById("guest-count")?.value || "";

      if (area) params.set("area", area);
      if (date) params.set("date", date);
      if (guests) params.set("guests", guests);

      window.location.assign(
        `pages/halls.html${params.toString() ? "?" + params.toString() : ""}`
      );
    });
  }

  // MOBILE MENU
  const menuButton = document.querySelector(".mobile-menu");
  const mainNav = document.querySelector(".main-nav");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  // HALL LISTING
  const listingGrid = document.getElementById("listing-halls");

  if (listingGrid) {
    const params = new URLSearchParams(window.location.search);
    const areaInput = document.getElementById("filter-area");
    const guestInput = document.getElementById("filter-guests");
    const dateInput = document.getElementById("filter-date");
    const feedback = document.getElementById("listing-feedback");

    if (areaInput) areaInput.value = params.get("area") || "";
    if (guestInput) guestInput.value = params.get("guests") || "";
    if (dateInput) dateInput.value = params.get("date") || "";

    function renderListing() {
      const area = areaInput?.value || "";
      const guests = Number(guestInput?.value || 0);

      const matching = halls.filter(hall =>
        (!area || hall.area === area) &&
        (!guests || hall.capacity >= guests)
      );

      listingGrid.innerHTML = matching.map(hall => `
        <article class="hall-card">
          <img
            class="hall-photo"
            src="${hall.image}"
            alt="${escape(hall.name)}"
          >

          <div class="hall-card-body">
            <div class="hall-badges">
              <span class="eco-badge">${hall.ecoScore}/100 eco score</span>
              <span class="rating">★ ${hall.rating} (${hall.reviews})</span>
            </div>

            <h2>${escape(hall.name)}</h2>

            <p class="hall-location">
              ${escape(hall.area)}, ${escape(hall.city)}
              · Up to ${hall.capacity} guests
            </p>

            <p class="facilities">
              ${(hall.facilities || []).map(escape).join(" · ")}
            </p>

            <div class="hall-price-row">
              <div>
                <strong>${money(hall.pricePerHour)} / hour</strong>
                <small>Rental only · taxes extra</small>
              </div>

              <a
                class="button button-outline view-hall"
                href="hall-details.html?id=${encodeURIComponent(hall.id)}"
              >
                View hall details
              </a>
            </div>
          </div>
        </article>
      `).join("");

      if (feedback) {
        feedback.textContent = matching.length
          ? `${matching.length} sample hall${matching.length === 1 ? "" : "s"} match your filters. Availability is not connected.`
          : "No sample halls match those filters. Try changing the neighbourhood or guest count.";
      }
    }

    document.getElementById("listing-filters")?.addEventListener("submit", event => {
      event.preventDefault();

      const next = new URLSearchParams();

      if (areaInput?.value) next.set("area", areaInput.value);
      if (guestInput?.value) next.set("guests", guestInput.value);
      if (dateInput?.value) next.set("date", dateInput.value);

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${next.toString() ? "?" + next.toString() : ""}`
      );

      renderListing();
    });

    document.getElementById("clear-filters")?.addEventListener("click", () => {
      if (areaInput) areaInput.value = "";
      if (guestInput) guestInput.value = "";
      if (dateInput) dateInput.value = "";

      window.history.replaceState({}, "", window.location.pathname);
      renderListing();
    });

    renderListing();
  }

  // HALL DETAILS
  const detailsRoot = document.getElementById("hall-detail");

  if (detailsRoot) {
    const hallId = new URLSearchParams(window.location.search).get("id");
    const hall = window.CivicSpace.hallById(hallId);

    if (!hall) {
      detailsRoot.innerHTML = `
        <section class="page-width page-message">
          <h1>Hall not found</h1>
          <p>We could not find that hall in the current sample data.</p>
          <a class="button button-green" href="halls.html">Back to halls</a>
        </section>
      `;
    } else {
      document.title = `${hall.name} — CivicSpace`;

      const galleryImages = [
        hall.image,
        hall.galleryImages?.[0] || hall.image,
        hall.galleryImages?.[1] || hall.image
      ];

      const facilities = hall.facilities || [];
      const greenFeatures = hall.greenFeatures || [];

      detailsRoot.innerHTML = `
        <section class="detail-page page-width">

          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="../index.html">Home</a>
            <span>›</span>
            <a href="halls.html">Find a hall</a>
            <span>›</span>
            <span>${escape(hall.name)}</span>
          </nav>

          <div class="detail-gallery">
            <button
              class="gallery-main gallery-photo-button"
              type="button"
              data-gallery-index="0"
              aria-label="Open main hall photo"
            >
              <img src="${galleryImages[0]}" alt="${escape(hall.name)} interior">
            </button>

            <div class="gallery-side">
              <button
                class="gallery-photo-button"
                type="button"
                data-gallery-index="1"
                aria-label="Open second hall photo"
              >
                <img src="${galleryImages[1]}" alt="${escape(hall.name)} additional view">
              </button>

              <button
                class="gallery-photo-button"
                type="button"
                data-gallery-index="2"
                aria-label="Open third hall photo"
              >
                <img src="${galleryImages[2]}" alt="${escape(hall.name)} outdoor view">
              </button>
            </div>
          </div>

          <div class="detail-columns">
            <div class="detail-main-column">

              <section class="detail-card hall-overview">
                <h1>A welcoming space for meaningful gatherings</hh1>

                <div class="detail-badges">
                  <span class="detail-badge badge-verified">Verified civic venue</span>
                  <span class="detail-badge badge-eco">${hall.ecoScore}/100 eco score</span>
                  <span class="detail-badge badge-access">Step-free access</span>
                </div>

                <p class="overview-description">${escape(hall.description)}</p>

                <div class="overview-facts">
                  <div>
                    <span>Capacity</span>
                    <strong>${hall.capacity} seated</strong>
                  </div>

                  <div>
                    <span>Floor area</span>
                    <strong>${escape(hall.floorArea || "Details available from venue")}</strong>
                  </div>
                </div>

                <p class="operating-hours">
                  Open ${escape(hall.openHours || "venue hours to be confirmed")}
                  · Minimum ${escape(hall.minimumBooking || "booking duration to be confirmed")}
                  · ${escape(hall.changeover || "changeover details to be confirmed")}
                </p>
              </section>

              <section class="detail-card facilities-card">
                <h2>Facilities &amp; accessible amenities</h2>

                <ul class="facility-list">
                  ${facilities.map(item => `<li>${escape(item)}</li>`).join("")}
                </ul>

                <div class="accessibility-callout">
                  <span class="callout-icon" aria-hidden="true">ⓘ</span>
                  <div>
                    <strong>Planning accessible participation?</strong>
                    <p>${escape(hall.accessibilityNote || "Contact the venue team for access requirements and seating layouts.")}</p>
                  </div>
                </div>
              </section>

              <section class="detail-card location-card">
                <h2>Location &amp; getting here</h2>

                <div class="map-placeholder" role="img" aria-label="Map preview for ${escape(hall.area)}, ${escape(hall.city)}">
                  <div class="map-block map-block-one"></div>
                  <div class="map-block map-block-two"></div>
                  <div class="map-road map-road-horizontal"></div>
                  <div class="map-road map-road-vertical"></div>
                  <div class="map-pin">⌖</div>
                  <span class="map-place">${escape(hall.area)} · ${escape(hall.city)}</span>
                </div>

                <p class="venue-address">${escape(hall.address)}</p>
                <p class="transit-info">${escape(hall.transit || `${hall.area}, ${hall.city}`)}</p>

                <a
                  class="button button-outline directions-button"
                  href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hall.address)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions ↗
                </a>
              </section>

              <section class="detail-card reviews-card">
                <h2>Reviews from your community</h2>

                <div class="review-summary">
                  <strong class="review-score">${hall.rating} / 5</strong>
                  <div>
                    <span class="review-stars" aria-label="${hall.rating} out of 5 stars">★★★★★</span>
                    <p>${hall.reviews} verified bookings · Cleanliness 4.9 · Support 4.8 · Value 4.7</p>
                  </div>
                </div>

                <blockquote>
                  “${escape(hall.reviewText || "A great community venue with helpful facilities.")}”
                </blockquote>

                <p class="review-author">
                  ${escape(hall.reviewer || "CivicSpace member")}
                  · ${escape(hall.reviewDate || "Recent review")}
                  · Verified organiser
                </p>

                <button class="text-button" type="button" id="read-reviews">Read all reviews</button>

                <div id="all-reviews" class="all-reviews" hidden>
                  <p>Only the sample review is included in this frontend. Additional verified reviews will load from Django later.</p>
                </div>
              </section>
            </div>

            <aside class="detail-sidebar">

              <section class="booking-panel">
                <h2>Plan your booking</h2>
                <p class="booking-rate">${money(hall.pricePerHour)} / hour</p>
                <p class="rate-caption">Hall rental · extras &amp; 18% tax apply</p>

                <form id="detail-booking-form" class="detail-booking-form">
                  <input type="hidden" id="detail-hall-id" value="${escape(hall.id)}">

                  <label>
                    Event date
                    <input id="detail-date" type="date" required>
                  </label>

                  <label>
                    Time slot
                    <select id="detail-time" required>
                      <option value="">Choose a time slot</option>
                      <option value="09:00-13:00">09:00–13:00 · 4 hours</option>
                      <option value="13:30-17:30">13:30–17:30 · 4 hours</option>
                      <option value="18:00-22:00">18:00–22:00 · 4 hours</option>
                    </select>
                  </label>

                  <label>
                    Guests
                    <input
                      id="detail-guests"
                      type="number"
                      min="1"
                      max="${hall.capacity}"
                      value="120"
                      required
                    >
                  </label>

                  <p class="availability-demo" id="availability-demo">
                    Select a date and time to check the sample form.
                  </p>

                  <button class="button button-green booking-full-button" type="submit">
                    Check availability
                  </button>
                </form>

                <button
                  class="button button-outline booking-full-button"
                  type="button"
                  id="add-to-comparison">
                  Add to comparison
                </button>
                <a
                  class="button button-green booking-full-button"
                  id="compare-shortlist-link"
                  href="compare.html">
                  Compare shortlist
                </a>

                <p class="deposit-line">
                  <span>Security deposit</span>
                  <strong>${money(hall.securityDeposit || 0)}</strong>
                </p>

                <p class="booking-disclaimer">
                  No payment to check availability. Final charges shown before submission.
                </p>

                <p class="detail-action-message" id="detail-action-message" aria-live="polite"></p>
              </section>

              <section class="eco-panel">
                <h2>A greener gathering</h2>
                <strong class="eco-score-large">${hall.ecoScore} / 100</strong>
                <ul>${greenFeatures.map(item => `<li>${escape(item)}</li>`).join("")}</ul>
                <small>Verified facility checklist. Last inspected: 01 Oct 2026.</small>
              </section>

              <section class="policy-panel">
                <h2>Venue policies</h2>
                <p>${escape(hall.policy || "Please review venue rules before submitting a booking request.")}</p>

                <button class="text-button" type="button" id="view-cancellation-policy">
                  View cancellation policy
                </button>

                <div class="policy-expanded" id="cancellation-policy" hidden>
                  <strong>Cancellation policy</strong>
                  <p>Sample policy only: cancellation terms and any refund depend on the venue's confirmed policy. The final policy will be provided by Django before booking submission.</p>
                </div>
              </section>

            </aside>
          </div>
        </section>

        <dialog class="gallery-lightbox" id="gallery-lightbox">
          <button class="lightbox-close" type="button" aria-label="Close photo">×</button>
          <img id="lightbox-image" alt="Hall photo enlarged">

          <div class="lightbox-controls">
            <button type="button" id="gallery-prev">Previous</button>
            <span id="gallery-counter">1 / 3</span>
            <button type="button" id="gallery-next">Next</button>
          </div>
        </dialog>
      `;

      // GALLERY
      const lightbox = document.getElementById("gallery-lightbox");
      let galleryIndex = 0;

      function showGalleryImage(index) {
        galleryIndex = (index + galleryImages.length) % galleryImages.length;

        document.getElementById("lightbox-image").src =
          galleryImages[galleryIndex];

        document.getElementById("gallery-counter").textContent =
          `${galleryIndex + 1} / ${galleryImages.length}`;
      }

      detailsRoot.querySelectorAll("[data-gallery-index]").forEach(button => {
        button.addEventListener("click", () => {
          showGalleryImage(Number(button.dataset.galleryIndex));
          lightbox.showModal();
        });
      });

      lightbox.querySelector(".lightbox-close").addEventListener("click", () => {
        lightbox.close();
      });

      document.getElementById("gallery-prev").addEventListener("click", () => {
        showGalleryImage(galleryIndex - 1);
      });

      document.getElementById("gallery-next").addEventListener("click", () => {
        showGalleryImage(galleryIndex + 1);
      });

      // REVIEWS
      document.getElementById("read-reviews").addEventListener("click", event => {
        const panel = document.getElementById("all-reviews");
        panel.hidden = !panel.hidden;

        event.currentTarget.textContent =
          panel.hidden ? "Read all reviews" : "Hide reviews";
      });

      // CANCELLATION POLICY
      document.getElementById("view-cancellation-policy").addEventListener("click", event => {
        const panel = document.getElementById("cancellation-policy");
        panel.hidden = !panel.hidden;

        event.currentTarget.textContent =
          panel.hidden ? "View cancellation policy" : "Hide cancellation policy";
      });

      // COMPARISON
document.getElementById("add-to-comparison").addEventListener("click", () => {
  const compareKey = "civicSpaceCompareHalls";

  let comparison = [];

  try {
    comparison = JSON.parse(
      sessionStorage.getItem(compareKey) || "[]"
    );
  } catch (error) {
    comparison = [];
  }

  // Avoid adding the same hall twice.
  if (!comparison.includes(hall.id)) {
    if (comparison.length >= 3) {
      document.getElementById("detail-action-message").textContent =
        "You can compare up to 3 halls at a time.";
      return;
    }

    comparison.push(hall.id);
  }

  sessionStorage.setItem(
    compareKey,
    JSON.stringify(comparison)
  );

  document.getElementById("detail-action-message").textContent =
    `${hall.name} added to your comparison list.`;

  // Update the button's appearance.
  const button = document.getElementById("add-to-comparison");

  button.textContent = "Added to comparison";
  button.classList.add("is-selected");
  button.setAttribute("aria-pressed", "true");
  const compareLink = document.getElementById("compare-shortlist-link");

  if (compareLink) {
  compareLink.style.display = "inline-flex";
  compareLink.textContent = `Compare shortlist (${comparison.length})`;
}
});

      // CHECK AVAILABILITY
      document.getElementById("detail-booking-form").addEventListener("submit", event => {
        event.preventDefault();

        const date = document.getElementById("detail-date").value;
        const time = document.getElementById("detail-time").value;
        const guests = Number(document.getElementById("detail-guests").value);
        const message = document.getElementById("availability-demo");

        if (!date || !time || !guests || guests < 1 || guests > hall.capacity) {
          message.textContent =
            `Enter a date, time slot and guest count up to ${hall.capacity}.`;
          message.classList.add("availability-error");
          return;
        }

        const chosenDate = new Date(`${date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(chosenDate.getTime()) || chosenDate < today) {
          message.textContent = "Please choose today or a future date.";
          message.classList.add("availability-error");
          return;
        }

        // Save the selected availability details
        const request = {
          hallId: hall.id,
          hallName: hall.name,
          date,
          time,
          guests
        };

        sessionStorage.setItem(
          "civicspace_availability_request",
          JSON.stringify(request)
        );

        // Open the booking form with selected details
        const params = new URLSearchParams();

        params.set("hall", hall.id);
        params.set("date", date);
        params.set("time", time);
        params.set("guests", String(guests));

        window.location.assign(`booking.html?${params.toString()}`);
      });
    }
  }

  // BOOKING PAGE
  const bookingForm = document.getElementById("booking-form");

  if (bookingForm) {
    const params = new URLSearchParams(window.location.search);
    const hallId = params.get("hall");
    const hall = window.CivicSpace.hallById(hallId);

    const chosenHall = document.getElementById("booking-hall-name");
    const rate = document.getElementById("booking-rate");
    const message = document.getElementById("booking-message");

    if (!hall) {
      bookingForm.hidden = true;
      message.innerHTML =
        `Hall not found. <a href="halls.html">Return to halls</a>.`;
    } else {
      chosenHall.textContent = hall.name;
      rate.textContent = `${money(hall.pricePerHour)} per hour (sample rate)`;

      // Prefill selected date from Check Availability.
      const dateField = document.getElementById("booking-date");
      const selectedDate = params.get("date");

      if (dateField) {
        const today = new Date();

        dateField.min =
          `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        if (selectedDate) {
          dateField.value = selectedDate;
        }
      }

      // Prefill selected time.
      const selectedTime = params.get("time");

      if (selectedTime) {
        const [startTime, endTime] = selectedTime.split("-");

        const startField = document.getElementById("booking-start");
        const endField = document.getElementById("booking-end");

        if (startField) startField.value = startTime;
        if (endField) endField.value = endTime;
      }

      // Prefill guest count.
      const selectedGuests = params.get("guests");
      const guestsField = document.getElementById("booking-guests");

      if (selectedGuests && guestsField) {
        guestsField.value = selectedGuests;
      }

      bookingForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!bookingForm.reportValidity()) return;

        const booking = {
          hallId: hall.id,
          hallName: hall.name,
          date: document.getElementById("booking-date").value,
          startTime: document.getElementById("booking-start").value,
          endTime: document.getElementById("booking-end").value,
          eventName: document.getElementById("booking-event").value.trim(),
          guests: Number(document.getElementById("booking-guests").value)
        };

        if (booking.endTime <= booking.startTime) {
          message.textContent = "End time must be later than start time.";
          message.className = "form-message error";
          return;
        }

        sessionStorage.setItem(
          "civicspace_demo_booking_request",
          JSON.stringify(booking)
        );

        message.textContent =
          "Your details passed frontend validation. This is a sample request only: it has not been sent to Django, saved to MySQL, or confirmed.";

        message.className = "form-message success";
      });
    }
  }
})();