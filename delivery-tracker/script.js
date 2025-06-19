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

const map = L.map("map").setView([22.5726, 88.3639], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

const source = [22.5726, 88.3639]; // Kolkata
const destination = [22.5805, 88.4152]; // Salt Lake

let pathCoords = [];
let deliveryMarker;

const orsKey = "5b3ce3597851110001cf624851251b0ba51a41d9800fbb30dac99a4c";
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
  if (data && data.features && data.features.length > 0 && data.features[0].geometry && data.features[0].geometry.coordinates) {
    pathCoords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
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
    console.error("Route data is missing or invalid", data);
    alert("Failed to fetch route. Please check your OpenRouteService API key or coordinates.");
  }
})
.catch(err => {
  console.error("Failed to fetch directions:", err);
  alert("Failed to fetch directions. Check network or API key.");
});

// Firebase real-time GPS updates
firebase.database().ref("delivery/gps").on("value", (snapshot) => {
  const val = snapshot.val();
  if (val && deliveryMarker) {
    deliveryMarker.setLatLng([val.lat, val.lng]);
  }
});