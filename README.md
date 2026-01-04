# GHY-CONNECT-API 

**ghy-connect-api** is a headless automation API that reverse-engineers the Guwahati Municipal Corporation (GMC) portal to verify property tax details in real-time.

Built as a technical proof-of-concept to explore Puppeteer, Web Scraping, and Cloud Automation.

## 🛠️ Tech Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Scraping:** Puppeteer (Chrome/Chromium)
* **Deployment:** Render(Linux Environment)

## 🚀 Features

* **🤖 Headless Automation:** Navigates the Livewire-powered GMC website using a server-side Chrome instance.
* **🧠 Automated Captcha Solver:** Automatically detects and solves the math-based captcha required to view property details.
* **🕵️ Deep Scraping:**  Bypasses multiple UI layers ("Search" -> "Verify" -> "Confirm") to extract hidden billing data.
* **🧹 Data Normalization:** Converts raw HTML text and currency strings (e.g., ₹ 3,420.00) into strict JSON

## 📡 API Usage

**Endpoint:** ```GET /verify-gmc?id={HOLDING_NUMBER}```

**Sample Response:**

```
{
  "success": true,
  "data": {
    "ownerName": "SANTOSH KUMAR SEAL",
    "financialYear": "2025-2026",
    "totalDemand": "3420.00",
    "arrear": "0.00",
    "finalPayable": "3420.00"
  }
}
```

## ⚠️ Disclaimer

This project is for educational purposes only. It interacts with public data available on the official GMC portal.