# Clinic Hours Scraper (Node.js + SerpAPI)

A robust **Node.js scraper** that uses [SerpAPI](https://serpapi.com/) Google Maps endpoint to fetch clinic information, including address, phone number, and opening hours.  

This script supports multiple clinics from a CSV file, automatically saves results, and can resume scraping if interrupted or if SerpAPI quota is reached.

---

## Features

- Fetch clinic **address**, **phone number**, and **opening hours** from Google Maps.  
- Supports multiple clinics from a CSV file.  
- Automatically saves output to `output.json` and `output.csv` after each clinic.  
- Resume scraping from last saved progress using `progress.json`.  
- Handles different formats of opening hours (array, object, string).  
- Gracefully handles API errors and quota limits.  

---

## Prerequisites

- Node.js (v14 or higher recommended)  
- A SerpAPI account and API key (free or paid plan)  

---

## Repository Structure

```

clinic-hours-scraper/
│
├─ index.js          # Main scraper code
├─ clinics.csv       # Sample CSV with clinic names
├─ package.json      # Node.js dependencies
├─ output.json       # Auto-generated JSON output
├─ output.csv        # Auto-generated CSV output
├─ progress.json     # Tracks last scraped clinic for resume
└─ README.md         # Project documentation

````

---

## Setup

1. Clone the repository:

```bash
git clone <YOUR_REPO_URL>
cd clinic-hours-scraper
````

2. Install dependencies:

```bash
npm install
```

3. Replace `YOUR_SERPAPI_KEY` in `index.js` with your SerpAPI key.

4. Prepare a `clinics.csv` file with clinic names:

```csv
clinic_name
Abbey Green Vets - Broadway Surgery
Abbey Green Vets - Winchcombe
All Paws Veterinary Clinic - Castletroy
```

---

## Usage

Run the scraper:

```bash
node index.js
```

The script will:

1. Read clinic names from `clinics.csv`.
2. Query SerpAPI Google Maps for each clinic.
3. Save results to `output.json` and `output.csv` **after each clinic**.
4. Track progress in `progress.json` to resume scraping if interrupted.

---

## Example Output (JSON)

```json
{
  "clinic_name": "Abbey Green Vets - Broadway Surgery",
  "address": "123 Main St, London",
  "phone": "+44 1234 567890",
  "Monday": "09:00–17:00",
  "Tuesday": "09:00–17:00",
  "Wednesday": "09:00–17:00",
  "Thursday": "09:00–17:00",
  "Friday": "09:00–17:00",
  "Saturday": "10:00–14:00",
  "Sunday": "Closed"
}
```

---

## Notes

* Adjust `REQUEST_DELAY_MS` in `index.js` to control the delay between API calls (helpful to avoid hitting rate limits).
* If SerpAPI quota is reached, the script will **stop safely** and can be resumed later.
* The scraper supports **array, object, and string formats** for opening hours.
* Results are always saved after each clinic to avoid data loss.

---

## Extending the Script

* Add more columns to the CSV and include additional search parameters.
* Save results to a database instead of CSV/JSON.
* Add retry logic for temporary network errors.
* Integrate with scheduling scripts to run daily updates.

---

## License

MIT License © 2026

