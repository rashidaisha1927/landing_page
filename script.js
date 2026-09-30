const buses = [
  {
    id: "rm-101",
    operator: "RoadMate Express",
    from: "Lahore",
    to: "Islamabad",
    depart: "08:30 AM",
    arrive: "01:10 PM",
    duration: "4h 40m",
    type: "Executive",
    fare: 2850,
    bookedSeats: ["A1", "A2", "B4", "C1", "D3", "E2", "F4"],
  },
  {
    id: "rm-204",
    operator: "Green Line Coach",
    from: "Lahore",
    to: "Islamabad",
    depart: "11:45 AM",
    arrive: "04:35 PM",
    duration: "4h 50m",
    type: "Business Plus",
    fare: 3300,
    bookedSeats: ["A3", "B1", "B2", "C4", "E1", "G2"],
  },
  {
    id: "rm-118",
    operator: "SkyWays Comfort",
    from: "Karachi",
    to: "Hyderabad",
    depart: "09:00 AM",
    arrive: "11:20 AM",
    duration: "2h 20m",
    type: "Standard AC",
    fare: 1350,
    bookedSeats: ["A1", "B3", "C2", "D4", "F1"],
  },
  {
    id: "rm-305",
    operator: "RoadMate Sleeper",
    from: "Islamabad",
    to: "Peshawar",
    depart: "06:20 PM",
    arrive: "09:05 PM",
    duration: "2h 45m",
    type: "Luxury",
    fare: 1900,
    bookedSeats: ["A4", "B4", "C3", "E2"],
  },
  {
    id: "rm-417",
    operator: "CityLink",
    from: "Multan",
    to: "Lahore",
    depart: "07:15 AM",
    arrive: "12:50 PM",
    duration: "5h 35m",
    type: "Executive",
    fare: 2600,
    bookedSeats: ["A2", "B1", "C1", "D2", "G4"],
  },
  {
    id: "rm-418",
    operator: "CityLink",
    from: "Lahore",
    to: "Multan",
    depart: "02:15 PM",
    arrive: "07:45 PM",
    duration: "5h 30m",
    type: "Executive",
    fare: 2600,
    bookedSeats: ["A3", "B2", "D1", "E4", "F3"],
  },
  {
    id: "rm-529",
    operator: "North Star Bus",
    from: "Faisalabad",
    to: "Rawalpindi",
    depart: "03:30 PM",
    arrive: "08:40 PM",
    duration: "5h 10m",
    type: "Business",
    fare: 2450,
    bookedSeats: ["A1", "C2", "C3", "E4", "F2"],
  },
];

const famousRoutes = [
  { from: "Lahore", to: "Islamabad", note: "Frequent departures and executive coaches" },
  { from: "Karachi", to: "Hyderabad", note: "Fast day trips with comfortable AC seating" },
  { from: "Islamabad", to: "Peshawar", note: "Reliable evening service for business travel" },
  { from: "Multan", to: "Lahore", note: "Morning departures with spacious luggage space" },
  { from: "Faisalabad", to: "Rawalpindi", note: "Direct service with convenient city terminals" },
  { from: "Lahore", to: "Multan", note: "Comfortable intercity travel at clear fares" },
];

const seats = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4", "D1", "D2", "D3", "D4", "E1", "E2", "E3", "E4", "F1", "F2", "F3", "F4", "G1", "G2", "G3", "G4"];

const searchForm = document.querySelector("#searchForm");
const fromCity = document.querySelector("#fromCity");
const toCity = document.querySelector("#toCity");
const travelDate = document.querySelector("#travelDate");
const passengers = document.querySelector("#passengers");
const resultsGrid = document.querySelector("#resultsGrid");
const resultsStatus = document.querySelector("#resultsStatus");
const routeGrid = document.querySelector("#routeGrid");
const bookingPanel = document.querySelector("#bookingPanel");
const selectedBusTitle = document.querySelector("#selectedBusTitle");
const seatMap = document.querySelector("#seatMap");
const seatHelp = document.querySelector("#seatHelp");
const fareSummary = document.querySelector("#fareSummary");
const passengerForm = document.querySelector("#passengerForm");
const bookingCard = document.querySelector("#bookingCard");
const toast = document.querySelector("#toast");
const navLinks = document.querySelector("#navLinks");
const menuToggle = document.querySelector(".menu-toggle");
const loginButton = document.querySelector("#loginButton");
const authDialog = document.querySelector("#authDialog");

let activeBus = null;
let selectedSeats = [];
let activeSearch = null;

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getAvailableSeats(bus) {
  return seats.length - bus.bookedSeats.length;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setDateMinimum() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  travelDate.min = `${year}-${month}-${day}`;
  travelDate.value = travelDate.min;
}

function populateCities() {
  const cities = [...new Set(buses.flatMap((bus) => [bus.from, bus.to]))].sort();

  cities.forEach((city) => {
    fromCity.add(new Option(city, city));
    toCity.add(new Option(city, city));
  });
}

function renderRoutes() {
  routeGrid.innerHTML = famousRoutes
    .map(
      (route) => `
        <article class="route-card">
          <h3>${route.from} to ${route.to}</h3>
          <p>${route.note}</p>
          <button class="secondary-button route-search" type="button" data-from="${route.from}" data-to="${route.to}">
            Search route
          </button>
        </article>
      `
    )
    .join("");
}

function renderResults(matches) {
  resultsGrid.innerHTML = "";

  if (!matches.length) {
    resultsStatus.textContent = "No buses found for this route. Try another city pair.";
    resultsStatus.hidden = false;
    bookingPanel.hidden = true;
    return;
  }

  resultsStatus.hidden = true;
  resultsGrid.innerHTML = matches
    .map((bus) => {
      const available = getAvailableSeats(bus);

      return `
        <article class="bus-card">
          <div>
            <h3>${bus.operator}</h3>
            <p>${bus.from} to ${bus.to}</p>
          </div>
          <div class="bus-meta">
            <span><strong>${bus.depart}</strong>Departure</span>
            <span><strong>${bus.arrive}</strong>Arrival</span>
            <span><strong>${bus.duration}</strong>Duration</span>
            <span><strong>${available} seats</strong>Available</span>
          </div>
          <div class="fare-line">
            <span class="price">${formatCurrency(bus.fare)}</span>
            <button class="primary-button choose-bus" type="button" data-bus-id="${bus.id}">
              Choose Seats
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function searchBuses(event) {
  event.preventDefault();

  if (fromCity.value === toCity.value) {
    showToast("Please choose different departure and arrival cities.");
    return;
  }

  activeSearch = {
    from: fromCity.value,
    to: toCity.value,
    date: travelDate.value,
    passengers: Number(passengers.value),
  };

  const matches = buses.filter((bus) => bus.from === activeSearch.from && bus.to === activeSearch.to);
  renderResults(matches);
  document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSeatMap(bus) {
  const passengerCount = Number(passengers.value);
  selectedSeats = [];
  activeBus = bus;
  bookingPanel.hidden = false;
  selectedBusTitle.textContent = `${bus.operator}: ${bus.from} to ${bus.to}`;
  seatHelp.textContent = `Select ${passengerCount} seat${passengerCount > 1 ? "s" : ""} for this booking.`;
  updateFareSummary();

  seatMap.innerHTML = seats
    .map((seat, index) => {
      const isBooked = bus.bookedSeats.includes(seat);
      const aisle = index % 4 === 2 ? '<span class="aisle" aria-hidden="true"></span>' : "";
      const button = `
        <button
          class="seat ${isBooked ? "booked" : "available"}"
          type="button"
          data-seat="${seat}"
          ${isBooked ? "disabled" : ""}
          aria-label="Seat ${seat} ${isBooked ? "booked" : "available"}"
        >${seat}</button>
      `;

      return aisle + button;
    })
    .join("");

  bookingPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleSeat(seat) {
  const passengerCount = Number(passengers.value);
  const isSelected = selectedSeats.includes(seat);

  if (isSelected) {
    selectedSeats = selectedSeats.filter((item) => item !== seat);
  } else if (selectedSeats.length < passengerCount) {
    selectedSeats.push(seat);
  } else {
    showToast(`You can select only ${passengerCount} seat${passengerCount > 1 ? "s" : ""}.`);
  }

  document.querySelectorAll(".seat[data-seat]").forEach((button) => {
    button.classList.toggle("selected", selectedSeats.includes(button.dataset.seat));
  });

  updateFareSummary();
}

function updateFareSummary() {
  if (!activeBus || !selectedSeats.length) {
    fareSummary.textContent = "No seat selected";
    return;
  }

  const total = activeBus.fare * selectedSeats.length;
  fareSummary.textContent = `Seats ${selectedSeats.join(", ")} | Total ${formatCurrency(total)}`;
}

function createBooking(event) {
  event.preventDefault();

  const passengerCount = Number(passengers.value);

  if (!activeBus) {
    showToast("Please choose a bus first.");
    return;
  }

  if (selectedSeats.length !== passengerCount) {
    showToast(`Please select ${passengerCount} seat${passengerCount > 1 ? "s" : ""}.`);
    return;
  }

  const formData = new FormData(passengerForm);
  const booking = {
    reference: `RM${Date.now().toString().slice(-6)}`,
    passengerName: formData.get("passengerName"),
    phoneNumber: formData.get("phoneNumber"),
    emailAddress: formData.get("emailAddress"),
    bus: activeBus.operator,
    route: `${activeBus.from} to ${activeBus.to}`,
    date: activeSearch?.date || travelDate.value,
    depart: activeBus.depart,
    seats: selectedSeats,
    total: activeBus.fare * selectedSeats.length,
  };

  localStorage.setItem("roadMateBooking", JSON.stringify(booking));
  renderStoredBooking();
  showToast("Ticket booked successfully.");
  document.querySelector("#my-booking").scrollIntoView({ behavior: "smooth", block: "start" });
  passengerForm.reset();
}

function renderStoredBooking() {
  const booking = JSON.parse(localStorage.getItem("roadMateBooking") || "null");

  if (!booking) {
    bookingCard.innerHTML = "<p>No booking yet. Search a route and reserve your seat to see it here.</p>";
    return;
  }

  bookingCard.innerHTML = `
    <div class="ticket-grid">
      <div class="ticket-field"><span>Reference</span><strong>${booking.reference}</strong></div>
      <div class="ticket-field"><span>Passenger</span><strong>${booking.passengerName}</strong></div>
      <div class="ticket-field"><span>Route</span><strong>${booking.route}</strong></div>
      <div class="ticket-field"><span>Date</span><strong>${booking.date}</strong></div>
      <div class="ticket-field"><span>Bus</span><strong>${booking.bus}</strong></div>
      <div class="ticket-field"><span>Departure</span><strong>${booking.depart}</strong></div>
      <div class="ticket-field"><span>Seats</span><strong>${booking.seats.join(", ")}</strong></div>
      <div class="ticket-field"><span>Total</span><strong>${formatCurrency(booking.total)}</strong></div>
    </div>
    <button class="secondary-button" type="button" id="cancelBooking">Cancel saved booking</button>
  `;
}

function handleRouteShortcut(button) {
  fromCity.value = button.dataset.from;
  toCity.value = button.dataset.to;
  passengers.value = 1;
  searchForm.requestSubmit();
}

searchForm.addEventListener("submit", searchBuses);

resultsGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".choose-bus");

  if (!button) return;

  const bus = buses.find((item) => item.id === button.dataset.busId);
  renderSeatMap(bus);
});

seatMap.addEventListener("click", (event) => {
  const button = event.target.closest(".seat[data-seat]");

  if (!button || button.disabled) return;

  toggleSeat(button.dataset.seat);
});

routeGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".route-search");

  if (button) {
    handleRouteShortcut(button);
  }
});

passengerForm.addEventListener("submit", createBooking);

bookingCard.addEventListener("click", (event) => {
  if (event.target.id === "cancelBooking") {
    localStorage.removeItem("roadMateBooking");
    renderStoredBooking();
    showToast("Saved booking removed.");
  }
});

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

loginButton.addEventListener("click", () => {
  if (typeof authDialog.showModal === "function") {
    authDialog.showModal();
  } else {
    showToast("Login preview opened.");
  }
});

setDateMinimum();
populateCities();
renderRoutes();
renderStoredBooking();
