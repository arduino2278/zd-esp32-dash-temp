// 🔑 REMPLACE PAR TON TOKEN BLYNK
const TOKEN = "G_bze_vpEmJLLN2SPF92ThQuv0foMP2x";

// Virtual Pins Blynk
const TEMP_PIN = "V3";
const HUM_PIN  = "V4";

// URLs API Blynk
const tempURL = `https://blynk.cloud/external/api/get?token=${TOKEN}&${TEMP_PIN}`;
const humURL  = `https://blynk.cloud/external/api/get?token=${TOKEN}&${HUM_PIN}`;

// -------------------
// GAUGE TEMPÉRATURE
// -------------------
const tempGauge = new Gauge(document.getElementById("tempGauge")).setOptions({
  angle: 0.15,
  lineWidth: 0.44,
  radiusScale: 1,
  pointer: {
    length: 0.6,
    strokeWidth: 0.035
  },
  maxValue: 50
});
tempGauge.setMinValue(0);
tempGauge.set(0);

// -------------------
// GAUGE HUMIDITÉ
// -------------------
const humGauge = new Gauge(document.getElementById("humGauge")).setOptions({
  angle: 0.15,
  lineWidth: 0.44,
  radiusScale: 1,
  pointer: {
    length: 0.6,
    strokeWidth: 0.035
  },
  maxValue: 100
});
humGauge.setMinValue(0);
humGauge.set(0);

// -------------------
// CHART.JS
// -------------------
const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Température (°C)",
        data: [],
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: "Humidité (%)",
        data: [],
        borderWidth: 2,
        tension: 0.3
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// -------------------
// UPDATE DATA
// -------------------
async function updateData() {
  try {
    const temp = parseFloat(await fetch(tempURL).then(r => r.text()));
    const hum  = parseFloat(await fetch(humURL).then(r => r.text()));

    // Update gauges
    tempGauge.set(temp);
    humGauge.set(hum);

    // Update values text
    document.getElementById("tempValue").innerText = temp.toFixed(1) + " °C";
    document.getElementById("humValue").innerText  = hum.toFixed(1) + " %";

    // Update chart
    const time = new Date().toLocaleTimeString();

    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(temp);
    chart.data.datasets[1].data.push(hum);

    if (chart.data.labels.length > 20) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(d => d.data.shift());
    }

    chart.update();

  } catch (err) {
    console.error("Erreur Blynk API :", err);
  }
}

// Rafraîchissement toutes les 2 secondes
setInterval(updateData, 2000);
