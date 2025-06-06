(() => {
  const url = "https://api.ipify.org?format=json";
  const post = "/api/collect";

  const id = document.currentScript?.dataset?.id || "unknown";

  fetch(url)
    .then((r) => r.json())
    .then(({ ip }) => {
      console.log("Visitor IP:", ip);
      console.log("Tracker ID:", id);

      fetch(post, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ip, ts: Date.now() }),
        keepalive: true,
      }).catch(() => {});
    })
    .catch(() => {});
})();
