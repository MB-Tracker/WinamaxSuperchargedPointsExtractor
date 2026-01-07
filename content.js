(() => {
  const script = document.createElement("script");
  script.src = browser.runtime.getURL("injected.js");
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.type && event.data.type === "SC_POINTS_DETECTED") {
      // console.log("[SC-Content] Received points:", event.data.payload);
      browser.runtime.sendMessage({
        action: "PROCESS_POINTS",
        data: event.data.payload,
      });
    }
  });
})()