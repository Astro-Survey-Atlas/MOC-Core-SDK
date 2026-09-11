/*
 * Copyright 2026 Astro Survey Atlas contributors.
 * Licensed under the Apache License, Version 2.0.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "moc-core-theme";
  const i18n = window.MocCoreI18n || {
    t: (key, fallback) => fallback === undefined ? key : fallback,
    getLanguage: () => "en"
  };

  function readTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    } catch (error) {
      return "light";
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // The visual preference still applies when storage is unavailable.
    }
  }

  function updateAsset(element, dark) {
    const attribute = element.tagName === "LINK" ? "href" : "src";
    const current = element.getAttribute(attribute);
    if (!current) {
      return;
    }
    const base = current.split("#")[0];
    element.setAttribute(attribute, dark ? `${base}#night` : base);
  }

  function applyTheme(theme, persist) {
    const value = theme === "dark" ? "dark" : "light";
    const dark = value === "dark";
    document.documentElement.dataset.theme = value;
    if (persist !== false) {
      saveTheme(value);
    }
    document.querySelectorAll("[data-theme-label]").forEach((label) => {
      label.textContent = dark
        ? i18n.t("theme.light", "Light mode")
        : i18n.t("theme.dark", "Dark mode");
    });
    const button = document.getElementById("theme-toggle");
    if (button) {
      button.hidden = false;
      button.setAttribute("aria-label", dark
        ? i18n.t("theme.light", "Switch to light mode")
        : i18n.t("theme.dark", "Switch to dark mode"));
    }
    document.querySelectorAll(".brand-logo, link[rel='icon']").forEach((element) => updateAsset(element, dark));
  }

  applyTheme(readTheme(), false);
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
  window.addEventListener("moc-core-language-change", () => {
    applyTheme(document.documentElement.dataset.theme || "light", false);
  });

  window.MocCoreTheme = Object.freeze({
    applyTheme,
    getTheme: () => document.documentElement.dataset.theme || "light"
  });
})();
