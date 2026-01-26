const TOKEN = "_z_R3GuVlZHVR7SSpyqlFehlPT08hQn8";

const TEMP_PIN = "V0";
const HUM_PIN  = "V1";
const LED_R_PIN = "V2";
const LED_V_PIN = "V3";

const INTERVAL = 4000; // ⬅️ plus stable

function getValue(pin) {
  return fetch(`https://blynk.cloud/external/api/get?token=${TOKEN}&${pin}`)
    .then(r => r.text())
    .then(v => {
      if (v === "" || v === "null") return null;
      return parseFloat(v);
    });
}

// Gauges
const tempGauge = new Gauge(document.getElementById("tempGauge")).setOptions({ angle:0.15, lineWidth:0.44 });
tempGauge.maxValue = 50;
tempGauge.setMinValue(0);

const humGauge = new Gauge(document.getElementById("humGauge")).setOptions({ angle:0.15, lineWidth:0.44 });
humGauge.maxValue = 100;
humGauge.setMinValue(0);

// Chart
const chart = new Chart(document.getElementById("chart"), {
  type: "line",
  data: { labels: [], datasets: [{ label:"Temp (°C)", data: [] }, { label:"Hum (%)", data: [] }] }
});

async function updateData() {
  try {
    const temp = await getValue(TEMP_PIN);
    const hum  = await getValue(HUM_PIN);
    const ledR = await getValue(LED_R_PIN);
    const ledV = await getValue(LED_V_PIN);

    if (temp === null || hum === null) return;

    const time = new Date().toLocaleTimeString();

    // Gauges
    tempGauge.set(temp);
    humGauge.set(hum);
    tempValue.innerText = temp.toFixed(1) + " °C";
    humValue.innerText  = hum.toFixed(1) + " %";

    // LEDs (SYNC BLYNK)
    ledRed.classList.toggle("on", ledR > 0);
    ledGreen.classList.toggle("on", ledV > 0);

    // Chart
    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(temp);
    chart.data.datasets[1].data.push(hum);
    if (chart.data.labels.length > 20) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(d => d.data.shift());
    }
    chart.update();

  } catch (e) {
    console.error("Blynk API error", e);
  }
}

setInterval(updateData, INTERVAL);
updateData();
