
 // CivicSpace - Check Availability
 // Frontend demo. Waitlist requests are saved in localStorage.
 // Django integration can be added later.

"use strict";

const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");
const selectedDateHeading = document.getElementById("selectedDateHeading");
const timeSlotsContainer = document.getElementById("timeSlots");
const availabilityMessage = document.getElementById("availabilityMessage");
const continueButton = document.getElementById("continueButton");
const waitlistButton = document.getElementById("waitlistButton");
const rentalSummary = document.getElementById("rentalSummary");

const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

// Waitlist storage keys.
// The dashboard should read these same keys.
const WAITLIST_KEY = "civicspace_waitlist_demo";
const UPDATES_KEY = "civicspace_waitlist_updates";

// Initial calendar state from Figma
let currentYear = 2026;
let currentMonth = 10; // November

let selectedDate = new Date(2026, 10, 21);
let selectedSlot = null;

// Hall information
const hall = {
    id: "sahyadri",
    name: "Sahyadri Community Hall",
    pricePerHour: 1500
};

// November 20 is blocked.
// November 21 afternoon is already booked.
const blockedDates = [
    "2026-11-20"
];

const bookedSlots = {
    "2026-11-21": ["14:00–18:00"]
};

// Demo time slots
const timeSlots = [
    {
        time: "09:00–13:00",
        hours: 4
    },
    {
        time: "14:00–18:00",
        hours: 4
    },
    {
        time: "18:30–22:00",
        hours: 3.5
    }
];

// ----------------------------------
// DATE HELPERS
// ----------------------------------

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatFullDate(date) {
    return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

function isBlocked(date) {
    return blockedDates.includes(formatDate(date));
}

function isSlotAvailable(date, slot) {
    const dateKey = formatDate(date);
    const booked = bookedSlots[dateKey] || [];

    return !isBlocked(date) && !booked.includes(slot.time);
}

function todayYear() {
    return new Date().getFullYear();
}

function todayMonth() {
    return new Date().getMonth();
}

function isDateSelectable(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maximumDate = new Date(today);
    maximumDate.setDate(maximumDate.getDate() + 90);

    return date >= today && date <= maximumDate;
}

// ----------------------------------
// CALENDAR
// ----------------------------------

function renderCalendar() {
    calendarGrid.innerHTML = "";

    const firstDay = new Date(currentYear, currentMonth, 1);

    const daysInMonth = new Date(
        currentYear,
        currentMonth + 1,
        0
    ).getDate();

    // Monday-first calendar
    let startingDay = firstDay.getDay();
    startingDay = startingDay === 0 ? 6 : startingDay - 1;

    monthYear.textContent = firstDay.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );

    // Empty cells before the first day
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-empty";
        calendarGrid.appendChild(emptyCell);
    }

    // Calendar date buttons
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateKey = formatDate(date);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";
        button.textContent = day;

        if (!isDateSelectable(date)) {
            button.disabled = true;
            button.classList.add("disabled");
        }

        // Blocked date
        if (isBlocked(date)) {
            button.classList.add("blocked");
            button.disabled = true;
            button.title = "This date is unavailable";
        }

        // Dates with demo availability indicators
        if (
            dateKey === "2026-11-07" ||
            dateKey === "2026-11-14" ||
            dateKey === "2026-11-28"
        ) {
            button.classList.add("has-availability");
        }

        // Selected date
        if (
            selectedDate &&
            dateKey === formatDate(selectedDate)
        ) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        }

        button.addEventListener("click", function () {
            if (button.disabled) return;

            selectedDate = date;
            selectedSlot = null;

            renderCalendar();
            renderTimeSlots();
        });

        calendarGrid.appendChild(button);
    }

    // Previous month
    prevMonthButton.disabled =
        currentYear === todayYear() &&
        currentMonth === todayMonth();

    // Next month
    nextMonthButton.disabled =
        new Date(currentYear, currentMonth, 1) >=
        new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 3,
            1
        );
}

// ----------------------------------
// MONTH NAVIGATION
// ----------------------------------

prevMonthButton.addEventListener("click", function () {
    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    selectedSlot = null;

    renderCalendar();
    renderTimeSlots();
});

nextMonthButton.addEventListener("click", function () {
    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    selectedSlot = null;

    renderCalendar();
    renderTimeSlots();
});

// ----------------------------------
// TIME SLOTS
// ----------------------------------

function renderTimeSlots() {
    timeSlotsContainer.innerHTML = "";

    continueButton.disabled = true;
    waitlistButton.disabled = true;

    if (!selectedDate) {
        selectedDateHeading.textContent = "Choose a date";

        availabilityMessage.textContent =
            "Select an event date from the calendar.";

        return;
    }

    selectedDateHeading.textContent =
        formatFullDate(selectedDate);

    if (isBlocked(selectedDate)) {
        selectedSlot = null;

        availabilityMessage.textContent =
            "This date is blocked. Please choose another date.";

        return;
    }

    timeSlots.forEach(function (slot) {
        const available = isSlotAvailable(
            selectedDate,
            slot
        );

        const button = document.createElement("button");
        button.type = "button";
        button.className = "time-slot";

        // Slot time
        const timeLabel = document.createElement("strong");
        timeLabel.textContent = slot.time;

        // Availability label
        const statusLabel = document.createElement("span");
        statusLabel.className = "slot-status";
        statusLabel.textContent = available
            ? "Available"
            : "Unavailable";

        button.appendChild(timeLabel);
        button.appendChild(statusLabel);

        if (available) {
            button.classList.add("available");
        } else {
            button.classList.add("unavailable");
        }

        // Selected slot
        if (
            selectedSlot &&
            selectedSlot.time === slot.time
        ) {
            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        }

        // IMPORTANT:
        // Unavailable slots are selectable for waitlisting.
        // Do not disable this button.
        button.addEventListener("click", function () {
            selectedSlot = slot;

            renderTimeSlots();

            if (available) {
                availabilityMessage.className =
                    "availability-message success";

                availabilityMessage.textContent =
                    `${slot.time} is available. You can continue.`;
            } else {
                availabilityMessage.className =
                    "availability-message";

                availabilityMessage.textContent =
                    `${slot.time} is unavailable. You can join the waitlist.`;
            }

            updateButtons();
        });

        timeSlotsContainer.appendChild(button);
    });

    if (!selectedSlot) {
        availabilityMessage.className =
            "availability-message";

        availabilityMessage.textContent =
            "Choose a time slot to continue or join a waitlist.";
    }

    updateButtons();
}

// ----------------------------------
// BUTTON STATES
// ----------------------------------

function updateButtons() {
    if (!selectedDate || !selectedSlot) {
        continueButton.disabled = true;
        waitlistButton.disabled = true;
        return;
    }

    const available = isSlotAvailable(
        selectedDate,
        selectedSlot
    );

    // Continue only for available slots
    continueButton.disabled = !available;

    // Waitlist only for unavailable slots
    waitlistButton.disabled = available;

    if (available) {
        continueButton.textContent =
            `Continue with ${selectedSlot.time}`;

        waitlistButton.textContent =
            "Join waitlist";
    } else {
        continueButton.textContent = "Continue";

        waitlistButton.textContent =
            `Join waitlist for ${selectedSlot.time}`;
    }

    rentalSummary.textContent =
        `₹${hall.pricePerHour.toLocaleString("en-IN")}/hour · ` +
        `${selectedSlot.hours} hours = ` +
        `₹${(
            hall.pricePerHour * selectedSlot.hours
        ).toLocaleString("en-IN")} rental`;
}

// ----------------------------------
// LOCAL STORAGE HELPERS
// ----------------------------------

function loadStorage(key) {
    try {
        const stored = localStorage.getItem(key);

        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Could not read saved data:", error);
        return [];
    }
}

// ----------------------------------
// JOIN WAITLIST
// ----------------------------------

waitlistButton.addEventListener("click", function () {
    if (waitlistButton.disabled) return;

    if (!selectedDate || !selectedSlot) {
        alert("Please choose a date and time slot.");
        return;
    }

    const available = isSlotAvailable(
        selectedDate,
        selectedSlot
    );

    if (available) {
        alert("This slot is available. Please use Continue.");
        return;
    }

    const requests = loadStorage(WAITLIST_KEY);
    const updates = loadStorage(UPDATES_KEY);

    const dateKey = formatDate(selectedDate);

    // Prevent duplicate waitlist entries
    const existingRequest = requests.find(function (request) {
        return request.hall === hall.name &&
            request.date === dateKey &&
            request.time === selectedSlot.time;
    });

    if (existingRequest) {
        alert("You have already joined the waitlist for this slot.");

        window.location.href = "waitlist.html";
        return;
    }

    const requestId = "CS-" + Date.now();

    const formattedDate = selectedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

    const newRequest = {
        id: requestId,
        hallId: hall.id,
        hall: hall.name,
        date: dateKey,
        time: selectedSlot.time,
        status: "Waiting",
        position: requests.length + 1,
        total: requests.length + 1,
        notice:
            `Waitlist request for ${formattedDate}, ` +
            `${selectedSlot.time}. Waiting for availability.`,
        noticeDate: new Date().toLocaleDateString("en-IN"),
        unread: true
    };

    // Save waitlist request
    requests.push(newRequest);

    // Save dashboard notification
    updates.push({
        id: requestId,
        hall: hall.name,
        message: newRequest.notice,
        date: newRequest.noticeDate,
        unread: true
    });

    try {
        localStorage.setItem(
            WAITLIST_KEY,
            JSON.stringify(requests)
        );

        localStorage.setItem(
            UPDATES_KEY,
            JSON.stringify(updates)
        );
    } catch (error) {
        alert("Unable to save your waitlist request in this browser.");
        console.error(error);
        return;
    }

    alert("Your waitlist request has been submitted!");

    // Waitlist Overview page is inside pages/
    window.location.href = "waitlist.html";
});

// ----------------------------------
// CONTINUE BOOKING
// ----------------------------------

continueButton.addEventListener("click", function () {
    if (!selectedDate || !selectedSlot) {
        alert("Please select an event date and time.");
        return;
    }

    const available = isSlotAvailable(selectedDate, selectedSlot);

    if (!available) {
        alert("This time slot is unavailable. Please join the waitlist.");
        return;
    }

    // Convert the selected date to YYYY-MM-DD
    const date = formatDate(selectedDate);

    // Get the selected time slot
    const time = selectedSlot.time;

    // Pass date and time directly to the booking form
    const params = new URLSearchParams({
        date: date,
        time: time
    });

    // Navigate to the booking form
    window.location.href = "booking-form.html?" + params.toString();
});

// ----------------------------------
// INITIAL PAGE
// ----------------------------------

renderCalendar();
renderTimeSlots();
