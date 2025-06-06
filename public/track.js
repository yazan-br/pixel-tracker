(function () {
  "use strict";

  var CONFIG = {
    endpoint:
      "https://us-west1-getsaleswarehouse.cloudfunctions.net/gcf-growth-webhook",
    clientId: "NiIKlLXW7E3XD1mwLz26U",
    partnerId: "dsp",
    pixelVersion: "1.1.0",
    debug: false,
  };

  function readQueryParam(param) {
    var src =
      (document.currentScript && document.currentScript.src) ||
      (function () {
        var scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1].src; // last script on page
      })();
    if (!src) return "";

    var q = src.split("?")[1] || "";
    var parts = q.split("&");
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].split("=");
      if (s[0] === param) return decodeURIComponent(s[1] || "");
    }
    return "";
  }

  var embedId = readQueryParam("id");
  if (embedId) {
    CONFIG.clientId = embedId;
    if (CONFIG.debug) console.log("Pixel embed id:", embedId);
  }

  var utils = {
    safe: function (fn, fallback) {
      try {
        return fn();
      } catch (error) {
        console.error("Pixel error:", error);
        return fallback;
      }
    },
    generateId: function (prefix) {
      return (
        (prefix || "id") +
        "_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2, 10)
      );
    },
    getSessionId: function () {
      var key = "pixel_session_id",
        id;
      id = utils.safe(function () {
        return sessionStorage.getItem(key);
      }, null);
      if (!id) {
        id = utils.generateId("sess");
        utils.safe(function () {
          sessionStorage.setItem(key, id);
        });
        document.cookie = key + "=" + id + ";path=/;max-age=1800;samesite=lax";
      }
      return id;
    },
    getScreen: function () {
      return {
        w: utils.safe(function () {
          return screen.width;
        }, 0),
        h: utils.safe(function () {
          return screen.height;
        }, 0),
        d: utils.safe(function () {
          return screen.colorDepth;
        }, 0),
      };
    },
    nowISO: function () {
      return new Date().toISOString();
    },
  };

  function buildEvent() {
    return {
      ts: utils.nowISO(),
      sid: utils.getSessionId(),
      et: "page_load",
      url: utils.safe(function () {
        return location.href;
      }, ""),
      ref: utils.safe(function () {
        return document.referrer;
      }, ""),
      ttl: utils.safe(function () {
        return document.title;
      }, ""),
      ua: utils.safe(function () {
        return navigator.userAgent;
      }, "unknown"),
      lang: utils.safe(function () {
        return navigator.language || navigator.userLanguage;
      }, "unknown"),
      scr: utils.getScreen(),
      pv: CONFIG.pixelVersion,
      pid: CONFIG.partnerId,
      cid: CONFIG.clientId,
    };
  }

  function send(data) {
    var body = JSON.stringify(data);

    if (navigator.sendBeacon) {
      try {
        navigator.sendBeacon(CONFIG.endpoint, body);
        log("Beacon sent", data);
        return;
      } catch (error) {
        console.error("Pixel error:", error);
      }
    }

    var trimmed = JSON.stringify({
      ts: data.ts,
      sid: data.sid,
      et: data.et,
      url: data.url,
      cid: data.cid,
    });
    var img = new Image();
    img.src = CONFIG.endpoint + "?d=" + encodeURIComponent(trimmed);
    log("Image beacon sent (fallback)", trimmed);
  }

  function log() {
    if (CONFIG.debug && console && console.log) {
      console.log("[pixel]", [].slice.call(arguments));
    }
  }

  try {
    send(buildEvent());
  } catch (err) {
    log("pixel error", err);
  }
})();
