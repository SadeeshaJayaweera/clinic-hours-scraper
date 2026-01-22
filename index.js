/**
 * Clinic Hours Scraper using SerpAPI (Google Maps)
 * -----------------------------------------------
 * Input : clinics_clean.csv
 * Output: output.json, output.csv
 * Author: Sadeesha Jay
 * -----------------------------------------------
 */

const fs = require("fs");
const csv = require("csv-parser");
const { Parser } = require("json2csv");
const { getJson } = require("serpapi");

// ================= CONFIG =================
const API_KEY = "YOUR_SERPAPI_KEY"; // move to env in production
const INPUT_CSV = "clinics_clean.csv";
const OUTPUT_JSON = "output.json";
const OUTPUT_CSV = "output.csv";
const PROGRESS_FILE = "progress.json";
const REQUEST_DELAY_MS = 1200;
// ==========================================

const clinics = [];
const results = [];

// ================= READ CSV =================
fs.createReadStream(INPUT_CSV)
  .pipe(csv())
  .on("data", (row) => {
    const clinicName =
      row.clinic_name ||
      row.name ||
      row.clinic ||
      row["Clinic Name"] ||
      row["clinic name"];

    if (clinicName && clinicName.trim()) {
      clinics.push(clinicName.trim());
    }
  })
  .on("end", () => {
    console.log(`Loaded ${clinics.length} clinics`);
    if (!clinics.length) {
      console.error("❌ No clinic names found");
      process.exit(1);
    }
    processClinics();
  });

// ================= MAIN PROCESS =================
async function processClinics() {
  let startIndex = 0;

  // Safe progress restore
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const raw = fs.readFileSync(PROGRESS_FILE, "utf-8").trim();
      if (raw) {
        startIndex = JSON.parse(raw).lastIndex || 0;
        console.log(`Resuming from index ${startIndex + 1}`);
      }
    } catch {
      console.warn("⚠️ progress.json corrupted. Starting fresh.");
    }
  }

  // Safe output restore
  if (fs.existsSync(OUTPUT_JSON)) {
    try {
      const raw = fs.readFileSync(OUTPUT_JSON, "utf-8").trim();
      if (raw) results.push(...JSON.parse(raw));
    } catch {
      console.warn("⚠️ output.json corrupted. Starting fresh.");
    }
  }

  for (let i = startIndex; i < clinics.length; i++) {
    const clinic = clinics[i];
    console.log(`Scraping (${i + 1}/${clinics.length}): ${clinic}`);

    try {
      const data = await fetchClinicHours(clinic);
      results.push(data);
    } catch (err) {
      console.error(`❌ ${clinic}: ${err.message}`);
      results.push({ clinic_name: clinic, error: err.message });
      if (err.message.includes("Quota")) break;
    }

    saveOutputs();
    saveProgress(i + 1);
    await delay(REQUEST_DELAY_MS);
  }

  console.log("✅ Scraping finished");
}

// ================= SERPAPI FETCH =================
function fetchClinicHours(clinicName) {
  return new Promise((resolve, reject) => {
    getJson(
      {
        engine: "google_maps",
        q: clinicName,
        api_key: API_KEY,
      },
      (json) => {
        if (json?.error) {
          if (json.error.includes("run out")) {
            return reject(new Error("Quota exceeded"));
          }
          return resolve({ clinic_name: clinicName, error: json.error });
        }

        const place = json?.place_results;
        const hours = extractOpeningHours(place?.hours);

        resolve({
          clinic_name: clinicName,
          address: place?.address || null,
          phone: place?.phone || null,
          ...hours,
        });
      }
    );
  });
}

// ================= HOURS PARSER =================
function extractOpeningHours(hoursArray) {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const result = {};
  days.forEach((day) => (result[day] = null));

  if (!Array.isArray(hoursArray)) return result;

  for (const entry of hoursArray) {
    const [day, value] = Object.entries(entry)[0];

    if (!result.hasOwnProperty(day)) continue;

    // Closed
    if (/closed/i.test(value)) {
      result[day] = "Closed";
      continue;
    }

    // Open 24 hours
    if (/24/i.test(value)) {
      result[day] = "Open 24 hours";
      continue;
    }

    // Normal range (keep Google format)
    result[day] = value;
  }

  return result;
}

// ================= SAVE OUTPUT =================
function saveOutputs() {
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));

  const parser = new Parser();
  fs.writeFileSync(OUTPUT_CSV, parser.parse(results));

  console.log(`💾 Saved ${results.length} clinics`);
}

// ================= SAVE PROGRESS =================
function saveProgress(index) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastIndex: index }));
}

// ================= UTILS =================
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
