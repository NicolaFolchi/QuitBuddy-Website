(function () {
  const endpoint = "https://api.getquitbuddy.com/subscribe";
  const storageKey = "quitbuddy-download-signup";
  const dismissMs = 30 * 24 * 60 * 60 * 1000;
  const card = document.getElementById("download-signup");
  const form = document.getElementById("download-signup-form");
  const status = document.getElementById("download-signup-status");
  const closeButton = card && card.querySelector(".download-signup__close");
  const dismissButton = card && card.querySelector(".download-signup__dismiss");

  if (!card || !form || !status || !closeButton || !dismissButton) return;

  function savedState() {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveState(nextState) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch (_) {
      // Ignore storage failures; signup remains optional.
    }
  }

  function shouldShow() {
    const state = savedState();
    const now = Date.now();
    if (state.subscribedAt) return false;
    if (state.dismissedUntil && state.dismissedUntil > now) return false;
    return true;
  }

  function trackEvent(name, suffix) {
    if (!window.goatcounter || typeof window.goatcounter.count !== "function") return;

    window.goatcounter.count({
      path: `/event/${name}/${suffix || "unknown"}`,
      title: name,
      event: true,
    });
  }

  function showCard() {
    if (!shouldShow()) return;
    card.hidden = false;
    window.requestAnimationFrame(() => card.classList.add("is-visible"));
    trackEvent("free-email-signup-shown", "download");
  }

  function hideCard(reason) {
    card.classList.remove("is-visible");
    window.setTimeout(() => {
      card.hidden = true;
    }, 220);
    if (reason === "dismissed") {
      saveState({ dismissedUntil: Date.now() + dismissMs });
      trackEvent("free-email-signup-dismissed", "download");
    }
  }

  function campaignParams() {
    const params = new URLSearchParams(window.location.search);
    const campaign = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
      const value = params.get(key);
      if (value) campaign[key] = value;
    });
    return campaign;
  }

  document.querySelectorAll("[data-download-free-link]").forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(showCard, 450);
    });
  });

  closeButton.addEventListener("click", () => hideCard("dismissed"));
  dismissButton.addEventListener("click", () => hideCard("dismissed"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const websiteUrl = String(formData.get("website_url") || "").trim();

    if (!email || !form.checkValidity()) {
      status.textContent = "Enter a valid email address.";
      return;
    }

    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    status.textContent = "Adding you to the list...";
    trackEvent("free-email-signup-submit", "download");

    try {
      const response = await window.fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website_url: websiteUrl,
          source: "website_download_prompt",
          consent: "QuitBuddy release notes, setup tips, and occasional product updates.",
          page: window.location.pathname || "/",
          campaign: campaignParams(),
        }),
      });

      if (!response.ok) throw new Error("Subscription request failed");

      saveState({ subscribedAt: Date.now() });
      form.reset();
      status.textContent = "You're on the list. We'll only send useful QuitBuddy updates.";
      trackEvent("free-email-signup-success", "download");
      window.setTimeout(() => hideCard("subscribed"), 2400);
    } catch (_) {
      status.textContent = "That email didn't go through. Try again, or just keep using the app.";
      trackEvent("free-email-signup-error", "download");
      if (submitButton) submitButton.disabled = false;
    }
  });
})();
