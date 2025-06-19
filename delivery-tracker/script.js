// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBesWChEdJEZRFRkXE8rpynY0lBez47SJA",
  authDomain: "myindiamapamritkal.firebaseapp.com",
  databaseURL: "https://myindiamapamritkal-default-rtdb.firebaseio.com",
  projectId: "myindiamapamritkal",
  storageBucket: "myindiamapamritkal.firebasestorage.app",
  messagingSenderId: "830924864737",
  appId: "1:830924864737:web:7a096f506d004e19358ba0"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Initialize Leaflet map
const map = L.map("map").setView([23.0238712, 72.5552821], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Define source and destination coordinates
const source = [23.0238712, 72.5552821];
const destination = [23.135876, 72.5426026];

let pathCoords = [];
let deliveryMarker;

const orsKey = "5b3ce3597851110001cf624851251b0ba51a41d9800fbb30dac99a4c";

// Load polyline decoder dynamically
const polylineScript = document.createElement("script");
polylineScript.src = "https://unpkg.com/@mapbox/polyline@1.1.1/src/polyline.js";
document.head.appendChild(polylineScript);

polylineScript.onload = () => {
  fetch("https://api.openrouteservice.org/v2/directions/foot-walking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": orsKey,
    },
    body: JSON.stringify({
      coordinates: [
        [source[1], source[0]],
        [destination[1], destination[0]]
      ]
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data && data.routes && data.routes[0].geometry) {
      const coords = polyline.decode(data.routes[0].geometry);
      pathCoords = coords.map(c => [c[1], c[0]]); // [lat, lng]

      const route = L.polyline(pathCoords, { color: 'blue', weight: 5 }).addTo(map);
      map.fitBounds(route.getBounds());

      deliveryMarker = L.marker(source, {
        icon: L.icon({
          iconUrl: "assets/delivery-icon.png",
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(map);
    } else {
      alert("Invalid route response");
      console.error("ORS invalid:", data);
    }
  })
  .catch(err => {
    console.error("Failed to fetch directions:", err);
    alert("Failed to fetch directions. Check API key or network.");
  });
};

// Firebase real-time GPS tracking
firebase.database().ref("delivery/gps").on("value", (snapshot) => {
  const val = snapshot.val();
  if (val && deliveryMarker) {
    deliveryMarker.setLatLng([val.lat, val.lng]);
  }
});
