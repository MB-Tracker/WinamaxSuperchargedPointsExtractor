const API_ENDPOINT =
  "https://mb-tracker.com/api/misc/winamax-supercharged-points/points/add/";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "PROCESS_POINTS") {
    return true; // Not our action, ignore
  }

  const pointsData = request.data;

  chrome.storage.sync.get(["sc_last_points", "sc_api_key"], (result) => {
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

    fetch(API_ENDPOINT, {
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
          chrome.storage.sync.set({
            sc_last_points: pointsData.points,
            sc_last_update: Date.now(),
          });
        } else {
          console.error("[SC-Bg] Server error:", response.status);
        }
      })
      .catch((error) => {
        console.error("[SC-Bg] Network error:", error);
      });
  });
  return true; // Keep message channel open for async response if needed
});
