/* CivicSpace sample hall data.
   This is frontend sample data only. Django/MySQL will replace it later. */
window.CIVICSPACE_HALLS = [
  {
    id: "sahyadri",
    name: "Sahyadri Community Hall",
    area: "Kothrud",
    city: "Pune",
    address: "Kothrud, Pune, Maharashtra",
    capacity: 180,
    pricePerHour: 1500,
    ecoScore: 92,
    rating: 4.8,
    reviews: 64,
    image: "../assets/images/sahyadri-hall.png",
    homeImage: "assets/images/sahyadri-hall.png",
    facilities: ["Wi-Fi", "Parking", "Step-free access", "Projector"],
    description: "A bright, flexible hall for workshops, residents’ meetings and community celebrations. Natural light, reliable equipment and an on-site team make hosting simple.",
    floorArea: "2,400 sq ft",
    openHours: "09:00–22:00",
    minimumBooking: "2 hours",
    changeover: "30-minute changeover",
    securityDeposit: 2000,
    address: "24 Paud Road, Kothrud, Pune 411038",
    transit: "12 min walk from Vanaz Metro · Bus stop 300 m away · 020 4567 8911",
    facilities: ["Wi-Fi & projector", "Audio system & microphone", "40 parking spaces", "Flexible seating & stage", "Step-free entrance & ramps", "Accessible restroom", "Accessible parking", "Drinking water & pantry"],
    accessibilityNote: "Contact the venue team for seating layouts and specific access requirements. Service animals are welcome.",
    greenFeatures: ["Solar-powered lighting", "Waste segregation stations", "Water-saving fixtures"],
    reviewText: "Our workshop ran smoothly. Bright room, clear check-in and excellent facilities.",
    reviewer: "Riya Shah",
    reviewDate: "September 2026",
    policy: "No open flames or smoking. Amplified sound until 21:00. Leave the hall clean and report damage at check-out."
  },
  {
    id: "lotus",
    name: "Lotus Garden Pavilion",
    area: "Aundh",
    city: "Pune",
    address: "Aundh, Pune, Maharashtra",
    capacity: 120,
    pricePerHour: 1200,
    ecoScore: 96,
    rating: 4.8,
    reviews: 64,
    image: "../assets/images/lotus-pavilion.png",
    homeImage: "assets/images/lotus-pavilion.png",
    facilities: ["Wi-Fi", "Parking", "Step-free access"],
    description: "A welcoming pavilion suited to small meetings, family functions and community activities.",
    floorArea: "1,600 sq ft",
    openHours: "09:00–21:00",
    minimumBooking: "2 hours",
    changeover: "30-minute changeover",
    securityDeposit: 1500,
    transit: "Local bus stop nearby",
    accessibilityNote: "Contact the venue team for specific access requirements.",
    greenFeatures: ["Natural daylight", "Waste segregation stations"],
    reviewText: "A comfortable venue for a small community gathering.",
    reviewer: "CivicSpace member",
    reviewDate: "August 2026",
    policy: "Please follow venue staff instructions and leave the space clean after your event."
  },
  {
    id: "riverside",
    name: "Riverside Civic Centre",
    area: "Baner",
    city: "Pune",
    address: "Baner, Pune, Maharashtra",
    capacity: 300,
    pricePerHour: 2200,
    ecoScore: 84,
    rating: 4.8,
    reviews: 64,
    image: "../assets/images/riverside-centre.png",
    homeImage: "assets/images/riverside-centre.png",
    facilities: ["Wi-Fi", "Parking", "Step-free access", "Auditorium"],
    description: "A larger civic venue for presentations, public meetings and community events.",
    floorArea: "3,800 sq ft",
    openHours: "08:00–22:00",
    minimumBooking: "3 hours",
    changeover: "30-minute changeover",
    securityDeposit: 3000,
    transit: "Bus service available nearby",
    accessibilityNote: "Contact the venue team for specific access requirements.",
    greenFeatures: ["Energy-efficient lighting", "Waste segregation stations"],
    reviewText: "A spacious venue that worked well for our public meeting.",
    reviewer: "CivicSpace member",
    reviewDate: "August 2026",
    policy: "Please follow venue staff instructions and leave the space clean after your event."
  }
];

window.CivicSpace = {
  hallById(id) {
    return window.CIVICSPACE_HALLS.find(hall => hall.id === id) || null;
  },
  money(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  },
  escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }
};
