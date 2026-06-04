(function () {
  const campaignParameters = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  function currentCampaignParams() {
    const sourceParams = new URLSearchParams(window.location.search);
    const campaignParams = new URLSearchParams();

    campaignParameters.forEach((name) => {
      const value = sourceParams.get(name);
      if (value) campaignParams.set(name, value);
    });

    return campaignParams;
  }

  function slug(value) {
    return String(value || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "unknown";
  }

  function appendCampaignParams(link) {
    const campaignParams = currentCampaignParams();
    if (!campaignParams.toString()) return;

    const url = new URL(link.href);
    campaignParams.forEach((value, key) => {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    });
    link.href = url.toString();
  }

  function trackEvent(name, props, attempts) {
    if (!name) return;
    if (!window.goatcounter || typeof window.goatcounter.count !== "function") {
      if ((attempts || 0) < 20) {
        window.setTimeout(() => trackEvent(name, props, (attempts || 0) + 1), 100);
      }
      return;
    }

    const placement = props && props.placement ? props.placement : "unknown";
    const suffix = props && props.has_license_key ? props.has_license_key : placement;

    window.goatcounter.count({
      path: `/event/${slug(name)}/${slug(suffix)}`,
      title: name,
      event: true,
    });
  }

  function trackPageview(path, title, attempts) {
    if (!path) return;
    if (!window.goatcounter || typeof window.goatcounter.count !== "function") {
      if ((attempts || 0) < 20) {
        window.setTimeout(() => trackPageview(path, title, (attempts || 0) + 1), 100);
      }
      return;
    }

    window.goatcounter.count({
      path,
      title: title || document.title,
    });
  }

  document.querySelectorAll("[data-checkout-link]").forEach(appendCampaignParams);

  document.querySelectorAll("[data-analytics-event]").forEach((element) => {
    element.addEventListener("click", () => {
      trackEvent(element.dataset.analyticsEvent, {
        placement: element.dataset.analyticsPlacement || "unknown",
      });
    });
  });

  const pageEvent = document.body.dataset.analyticsPageEvent;
  const pagePath = document.body.dataset.analyticsPagePath;
  if (pagePath) {
    trackPageview(pagePath, document.body.dataset.analyticsPageTitle);
  }

  if (pageEvent) {
    trackEvent(pageEvent, {
      has_license_key: document.body.dataset.hasLicenseKey || "unknown",
    });
  }
})();
