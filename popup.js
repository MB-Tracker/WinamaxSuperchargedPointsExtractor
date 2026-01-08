const browser = globalThis.browser || globalThis.chrome;
document.addEventListener("DOMContentLoaded", () => {
  const pointsDisplay30Days = document.getElementById("pointsDisplay30Days");
  const timeDisplay30Days = document.getElementById("timeDisplay30Days");
  const pointsDisplay = document.getElementById("pointsDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const toggleBtn = document.getElementById("toggleSettings");
  const settingsArea = document.getElementById("settingsArea");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  browser.storage.sync.get(
    ["sc_last_points", "sc_last_update", "sc_api_key", "sc_30_days_points", "sc_30_days_update"],
    (data) => {
      if (data.sc_last_points !== undefined) {
        pointsDisplay.textContent = data.sc_last_points.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );
      } else {
        pointsDisplay.textContent = "--.--";
      }

      if (data.sc_last_update) {
        const date = new Date(data.sc_last_update * 1000);
        timeDisplay.textContent = date.toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        );
      }

      if (data.sc_30_days_points !== undefined) {
        pointsDisplay30Days.textContent = data.sc_30_days_points.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        );
        if (data.sc_30_days_points >= 100) {
          pointsDisplay30Days.style.color = "var(--accent)";
        } else {
          pointsDisplay30Days.style.color = "var(--danger)";
        }
      } else {
        pointsDisplay30Days.textContent = "--.--";
      }

      if (data.sc_30_days_update) {
        const date = new Date(data.sc_30_days_update * 1000);
        timeDisplay30Days.textContent = "Will change on: " + date.toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        );

        if (data.sc_30_days_update < Date.now()) {
          browser.runtime.sendMessage({
            action: "update_points",
            api_key: data.sc_api_key,
          });
        }
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
