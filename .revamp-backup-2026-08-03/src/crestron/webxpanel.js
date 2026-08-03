// src/crestron/webxpanel.js
import WebXPanel from "@crestron/ch5-webxpanel";

export const getWebXPanelStatus = () => {
  try {
    if (!WebXPanel || typeof WebXPanel.getWebXPanelStatus !== 'function') {
      console.warn("⚠️ WebXPanel not available or getWebXPanelStatus not found");
      return null;
    }
    const status = WebXPanel.getWebXPanelStatus();
    console.log("📊 WebXPanel Status:", status);
    return status;
  } catch (error) {
    console.error("❌ Error getting WebXPanel status:", error);
    return null;
  }
};
