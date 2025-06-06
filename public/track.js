(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    endpoint:
      "https://us-west1-getsaleswarehouse.cloudfunctions.net/gcf-growth-webhook",
    clientId: "NiIKlLXW7E3XD1mwLz26U",
    partnerId: "dsp",
    debug: false,
  };

  const utils = {
    getUserAgent: function () {
      try {
        return navigator.userAgent || "unknown";
      } catch (e) {
        return "unknown";
      }
    },

    getScreenInfo: function () {
      try {
        return {
          width: screen.width || 0,
          height: screen.height || 0,
          colorDepth: screen.colorDepth || 0,
        };
      } catch (e) {
        return { width: 0, height: 0, colorDepth: 0 };
      }
    },

    getLanguage: function () {
      try {
        return navigator.language || navigator.userLanguage || "unknown";
      } catch (e) {
        return "unknown";
      }
    },

    getReferrer: function () {
      try {
        return document.referrer || "";
      } catch (e) {
        return "";
      }
    },

    getCurrentURL: function () {
      try {
        return window.location.href || "";
      } catch (e) {
        return "";
      }
    },

    getPageTitle: function () {
      try {
        return document.title || "";
      } catch (e) {
        return "";
      }
    },

    generateSessionId: function () {
      return (
        "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11)
      );
    },

    getSessionId: function () {
      try {
        var sessionId = sessionStorage.getItem("pixel_session_id");
        if (!sessionId) {
          sessionId = this.generateSessionId();
          sessionStorage.setItem("pixel_session_id", sessionId);
        }
        return sessionId;
      } catch (e) {
        return this.generateSessionId();
      }
    },
  };

  function trackEvent() {
    try {
      var trackingData = {
        timestamp: new Date().toISOString(),
        sessionId: utils.getSessionId(),
        eventType: "page_load",
        url: utils.getCurrentURL(),
        title: utils.getPageTitle(),
        referrer: utils.getReferrer(),
        userAgent: utils.getUserAgent(),
        language: utils.getLanguage(),
        screen: utils.getScreenInfo(),
        pixelVersion: "1.0.0",
        partnerId: CONFIG.partnerId,
        clientId: CONFIG.clientId,
      };

      var img = new Image();
      var params = [];

      for (var key in trackingData) {
        if (trackingData.hasOwnProperty(key)) {
          var value =
            typeof trackingData[key] === "object"
              ? JSON.stringify(trackingData[key])
              : trackingData[key];
          params.push(
            encodeURIComponent(key) + "=" + encodeURIComponent(value)
          );
        }
      }

      img.src = CONFIG.endpoint + "?" + params.join("&");

      if (CONFIG.debug) {
        console.log("Tracking pixel fired");
      }
    } catch (error) {
      if (CONFIG.debug) {
        console.warn("Pixel tracking error:", error);
      }
    }
  }

  // Execute immediately
  trackEvent();
})();
