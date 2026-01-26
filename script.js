// 🔑 REMPLACE PAR TON TOKEN BLYNK
const TOKEN = "_z_R3GuVlZHVR7SSpyqlFehlPT08hQn8";

// Virtual Pins
const TEMP_PIN = "V0";
const HUM_PIN  = "V1";

// URLs API Blynk
const tempURL = `https://blynk.cloud/external/api/get?token=${TOKEN}&${TEMP_PIN}`;
const humURL  = `https://blynk.cloud/external/api/get?token=${TOKEN}&${HUM_PIN}`;

// -------------------
// GAUGES
// -------------------
const tempGauge = new Gauge(document.getElementById("tempGauge")).setOptions({
  angle: 0.15,
  lineWidth: 0.44,
  radiusScale: 1,
  pointer: { length: 0.6, strokeWidth: 0.035 },
  maxValue: 50
});
tempGauge.setMinValue(0);
tempGauge.set(0);

const humGauge = new Gauge(document.getElementById("humGauge")).setOptions({
  angle: 0.15,
  lineWidth: 0.44,
  radiusScale: 1,
  pointer: { length: 0.6, strokeWidth: 0.035 },
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
      { label: "Température (°C)", data: [], borderWidth: 2, tension: 0.3 },
      { label: "Humidité (%)", data: [], borderWidth: 2, tension: 0.3 }
    ]
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  }
});

// -------------------
// LED ELEMENTS
// -------------------
const ledRed = document.getElementById("ledRed");
const ledGreen = document.getElementById("ledGreen");

// -------------------
// TABLEAU ET DONNÉES EXCEL
// -------------------
let csvData = [["Heure","Température (°C)","Humidité (%)"]];
const tableBody = document.getElementById("dataTable").getElementsByTagName("tbody")[0];

// -------------------
// UPDATE DATA
// -------------------
async function updateData() {
  try {
    const temp = parseFloat(await fetch(tempURL).then(r => r.text()));
    const hum  = parseFloat(await fetch(humURL).then(r => r.text()));

    const time = new Date().toLocaleTimeString();

    // ---- Gauges ----
    tempGauge.set(temp);
    humGauge.set(hum);
    document.getElementById("tempValue").innerText = temp.toFixed(1) + " °C";
    document.getElementById("humValue").innerText  = hum.toFixed(1) + " %";

    // ---- Chart ----
    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(temp);
    chart.data.datasets[1].data.push(hum);
    if(chart.data.labels.length > 20){
      chart.data.labels.shift();
      chart.data.datasets.forEach(d => d.data.shift());
    }
    chart.update();

    // ---- LEDs ----
    if(temp >= 23){
      ledRed.classList.add("on");
      ledGreen.classList.remove("on");
    } else {
      ledGreen.classList.add("on");
      ledRed.classList.remove("on");
    }

    // ---- Tableau ----
    const newRow = tableBody.insertRow();
    newRow.insertCell(0).innerText = time;
    newRow.insertCell(1).innerText = temp.toFixed(1);
    newRow.insertCell(2).innerText = hum.toFixed(1);

    if(tableBody.rows.length > 20){
      tableBody.deleteRow(0);
    }

    // ---- Stockage Excel ----
    csvData.push([time, temp.toFixed(1), hum.toFixed(1)]);

  } catch(err) {
    console.error("Erreur Blynk API :", err);
  }
}

// -------------------
// EXPORT EXCEL
// -------------------
document.getElementById("exportBtn").addEventListener("click", () => {
  if(csvData.length <= 1){
    alert("Aucune donnée à exporter !");
    return;
  }

  // Créer worksheet
  const ws = XLSX.utils.aoa_to_sheet(csvData);

  // Créer workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "TempHum");

  // Télécharger Excel
  XLSX.writeFile(wb, "temp_hum.xlsx");
});

// -------------------
// Rafraîchissement toutes les 2 secondes
// -------------------
setInterval(updateData, 2000);
