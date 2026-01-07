(function () {
  "use strict";

  const KEY = "supercharged";
  const DEBUG = true;

  function checkPayload(str) {
    if (!str.includes(KEY)) return;

    // Strict Regex: supercharged -> progress -> points
    const regex =
      /"supercharged"[\s\S]*?"progress"[\s\S]*?"points"\s*:\s*"?([\d\.]+)"?/;
    const match = str.match(regex);

    if (match && match[1]) {
      const points = parseFloat(match[1]);

      if (DEBUG) console.log("[SC-Injector] Points found:", points);

      // Send to Content Script via Window Message
      window.postMessage(
        {
          type: "SC_POINTS_DETECTED",
          payload: { points: points, timestamp: Date.now() },
        },
        "*"
      );
    }
  }

  // Hook MessageEvent.prototype.data
  try {
    const proto = MessageEvent.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "data");
    if (!desc || !desc.get) return;

    const originalGetter = desc.get;
    Object.defineProperty(proto, "data", {
      get: function () {
        const value = originalGetter.call(this);
        try {
          if (typeof value === "string") checkPayload(value);
        } catch (e) { }
        return value;
      },
      configurable: true,
    });
    if (DEBUG) console.log("[SC-Injector] Hook installed.");
  } catch (e) {
    if (DEBUG) console.error("[SC-Injector] Hook failed", e);
  }
})();
