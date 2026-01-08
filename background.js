const browser = globalThis.browser || globalThis.chrome;
const API_BASE = "https://mb-tracker.com/api/misc/winamax-supercharged-points/";
const API_TRACK_ENDPOINT = API_BASE + "points/add/";
const API_UPDATE_ENDPOINT = API_BASE + "30-days/";

function processPoints(pointsData) {
  browser.storage.sync.get(["sc_last_points", "sc_api_key"], (result) => {
    const lastPoints = result.sc_last_points;
    if (lastPoints && lastPoints === pointsData.points) {
      console.log("[SC-Bg] Points unchanged since last submission. Skipping.");
      return;
    }

    const apiKey = result.sc_api_key;
    if (!apiKey) {
      console.warn("[SC-Bg] No API key configured. Aborting submission.");
      return;
    }

    let params = new URLSearchParams();
    params.append("points", pointsData.points);

    fetch(API_TRACK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: apiKey,
      },
      credentials: "omit",
      body: params.toString(),
    })
      .then((response) => {
        if (response.ok) {
          console.log("[SC-Bg] Data sent successfully");
          response.json().then((data) => {
            browser.storage.sync.set({
              sc_last_points: pointsData.points,
              sc_last_update: data.timestamp,
              sc_30_days_points: data.true_points,
              sc_30_days_update: data.next_update,
            });
          });
        } else {
          console.error("[SC-Bg] Server error:", response.status);
        }
      })
      .catch((error) => {
        console.error("[SC-Bg] Network error:", error);
      });
  });
}

function updatePoints() {
  browser.storage.sync.get(["sc_api_key"], (result) => {
    const apiKey = result.sc_api_key;
    if (!apiKey) {
      console.warn("[SC-Bg] No API key configured. Aborting submission.");
      return;
    }

    fetch(API_UPDATE_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
      credentials: "omit",
    })
      .then((response) => {
        if (response.ok) {
          console.log("[SC-Bg] Data sent successfully");
          let responseData = response.json();
          browser.storage.sync.set({
            sc_30_days_points: responseData.true_points,
            sc_30_days_update: responseData.next_update,
          });
        } else {
          console.error("[SC-Bg] Server error:", response.status);
        }
      })
      .catch((error) => {
        console.error("[SC-Bg] Network error:", error);
      });
  });
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PROCESS_POINTS") {
    processPoints(request.data);
  }

  if (request.action === "UPDATE_POINTS") {
    updatePoints();
  }

  return true; // Keep message channel open for async response if needed
});
