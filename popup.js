document.addEventListener("DOMContentLoaded", () => {
  const pointsDisplay = document.getElementById("pointsDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const toggleBtn = document.getElementById("toggleSettings");
  const settingsArea = document.getElementById("settingsArea");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  browser.storage.sync.get(
    ["sc_last_points", "sc_last_update", "sc_api_key"],
    (data) => {
      if (data.sc_last_points !== undefined) {
        pointsDisplay.textContent = data.sc_last_points;
      } else {
        pointsDisplay.textContent = "--.--";
      }

      if (data.sc_last_update) {
        const date = new Date(data.sc_last_update);
        timeDisplay.textContent = "Last update: " + date.toLocaleTimeString();
      }

      if (data.sc_api_key) {
        apiKeyInput.value = data.sc_api_key;
      }
    }
  );

  toggleBtn.addEventListener("click", () => {
    settingsArea.classList.toggle("open");
    const isOpen = settingsArea.classList.contains("open");
    toggleBtn.querySelector("span").textContent = isOpen
      ? "Close Settings"
      : "⚙️ Configure API Key";
  });

  browser.storage.sync.get(["sc_api_key"], (data) => {
    if (!data.sc_api_key) {
      toggleBtn.click();
    }
  });

  saveBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();

    if (!key) {
      statusMsg.textContent = "Key cannot be empty.";
      statusMsg.style.color = "#ff4444";
      return;
    }

    browser.storage.sync.set({ sc_api_key: key }, () => {
      statusMsg.textContent = "Saved successfully!";
      statusMsg.style.color = "#00ff88";

      // Auto close after 1.5 seconds
      setTimeout(() => {
        statusMsg.textContent = "";
        settingsArea.classList.remove("open");
        toggleBtn.querySelector("span").textContent = "⚙️ Configure API Key";
      }, 1500);
    });
  });
});
