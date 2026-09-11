/*
 * Copyright 2026 Astro Survey Atlas contributors.
 * Licensed under the Apache License, Version 2.0.
 */

(function () {
  "use strict";

  const MAX_ORDER = 29;
  const CALCULATOR_MAX_ORDER = 10;
  const MAX_PROJECTION_CELLS = 100000;
  const FULL_SKY_SQUARE_DEGREES = 4 * Math.PI * (180 / Math.PI) ** 2;
  const i18n = window.MocCoreI18n || {
    t: (key, fallback) => fallback === undefined ? key : fallback,
    getLanguage: () => "en"
  };

  function text(value) {
    return String(value).replace(/\s+/g, " ").trim();
  }

  function formatInteger(value) {
    return typeof value === "bigint" ? value.toLocaleString() : Number(value).toLocaleString();
  }

  function formatDecimal(value, digits) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0
    }).format(value);
  }

  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function appendLine(container, label, value, className) {
    const line = document.createElement("div");
    line.className = "result-line";
    const labelNode = document.createElement("span");
    labelNode.textContent = label;
    const valueNode = document.createElement("strong");
    valueNode.className = className || "";
    valueNode.textContent = value;
    line.append(labelNode, valueNode);
    container.appendChild(line);
  }

  function showError(container, message) {
    clearElement(container);
    const error = document.createElement("p");
    error.className = "result-error";
    error.textContent = message;
    container.appendChild(error);
  }

  function cellKey(cell) {
    return `${cell.order}/${cell.ipix.toString()}`;
  }

  function cellLimit(order) {
    return 12n * (4n ** BigInt(order));
  }

  function validateCell(order, ipix) {
    if (!Number.isInteger(order) || order < 0 || order > MAX_ORDER) {
      throw new Error("order");
    }
    if (typeof ipix !== "bigint" || ipix < 0n || ipix >= cellLimit(order)) {
      throw new Error("ipix");
    }
    return { order, ipix };
  }

  function parseOrder(value, maximum) {
    const trimmed = String(value).trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new Error("order");
    }
    const order = Number(trimmed);
    if (!Number.isSafeInteger(order) || order < 0 || order > maximum) {
      throw new Error("order");
    }
    return order;
  }

  function parseInteger(value) {
    const trimmed = String(value).trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new Error("integer");
    }
    return BigInt(trimmed);
  }

  function parseCells(value) {
    const tokens = String(value).trim().split(/[\s,;]+/).filter(Boolean);
    if (!tokens.length) {
      throw new Error("cells");
    }
    return tokens.map((token) => {
      const match = /^(\d+)\s*\/\s*(\d+)$/.exec(token);
      if (!match) {
        throw new Error("cells");
      }
      return validateCell(Number(match[1]), BigInt(match[2]));
    });
  }

  function hasAncestor(cell, keys) {
    for (let parentOrder = 0; parentOrder < cell.order; parentOrder += 1) {
      const parentIpix = cell.ipix >> BigInt(2 * (cell.order - parentOrder));
      if (keys.has(`${parentOrder}/${parentIpix.toString()}`)) {
        return true;
      }
    }
    return false;
  }

  function sortCells(cells) {
    return cells.sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.ipix < right.ipix ? -1 : left.ipix > right.ipix ? 1 : 0;
    });
  }

  function canonicalCells(input) {
    const cells = new Map();
    input.forEach((cell) => cells.set(cellKey(cell), cell));

    let changed = true;
    while (changed) {
      changed = false;
      const current = sortCells([...cells.values()]);
      const keys = new Set(cells.keys());
      current.forEach((cell) => {
        if (hasAncestor(cell, keys)) {
          cells.delete(cellKey(cell));
          changed = true;
        }
      });

      for (let childOrder = 1; childOrder <= MAX_ORDER; childOrder += 1) {
        const groups = new Map();
        for (const cell of cells.values()) {
          if (cell.order !== childOrder) {
            continue;
          }
          const parent = {
            order: childOrder - 1,
            ipix: cell.ipix >> 2n
          };
          const key = cellKey(parent);
          if (!groups.has(key)) {
            groups.set(key, { parent, quadrants: new Set() });
          }
          groups.get(key).quadrants.add(Number(cell.ipix & 3n));
        }
        for (const group of groups.values()) {
          if (group.quadrants.size !== 4) {
            continue;
          }
          for (let quadrant = 0; quadrant < 4; quadrant += 1) {
            cells.delete(`${childOrder}/${((group.parent.ipix << 2n) + BigInt(quadrant)).toString()}`);
          }
          cells.set(cellKey(group.parent), group.parent);
          changed = true;
        }
      }
    }

    return sortCells([...cells.values()]);
  }

  function encodeUniq(order, ipix) {
    return 4n * (4n ** BigInt(order)) + ipix;
  }

  function decodeUniq(value) {
    if (value < 4n) {
      throw new Error("uniq");
    }
    for (let order = 0; order <= MAX_ORDER; order += 1) {
      const base = 4n * (4n ** BigInt(order));
      const upper = base * 4n;
      if (value >= base && value < upper) {
        return validateCell(order, value - base);
      }
    }
    throw new Error("uniq");
  }

  function projectCells(input, targetOrder) {
    const projected = new Set();
    for (const cell of canonicalCells(input)) {
      if (cell.order === targetOrder) {
        projected.add(cell.ipix.toString());
        continue;
      }
      if (cell.order > targetOrder) {
        projected.add((cell.ipix >> BigInt(2 * (cell.order - targetOrder))).toString());
        continue;
      }

      const factor = 4n ** BigInt(targetOrder - cell.order);
      if (factor > BigInt(MAX_PROJECTION_CELLS) || projected.size + Number(factor) > MAX_PROJECTION_CELLS) {
        throw new Error("projection-cap");
      }
      const first = cell.ipix * factor;
      for (let offset = 0n; offset < factor; offset += 1n) {
        projected.add((first + offset).toString());
      }
    }
    return [...projected].map((value) => BigInt(value)).sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
  }

  function renderOrder() {
    const input = document.getElementById("order-input");
    const output = document.getElementById("order-output");
    if (!input || !output) {
      return;
    }
    try {
      const order = parseOrder(input.value, CALCULATOR_MAX_ORDER);
      const nside = 2 ** order;
      const total = 12n * (4n ** BigInt(order));
      const area = FULL_SKY_SQUARE_DEGREES / Number(total);
      const scaleDegrees = Math.sqrt(area);
      clearElement(output);
      appendLine(output, i18n.t("result.order.nside", "nside per axis"), formatInteger(nside));
      appendLine(output, i18n.t("result.order.cells", "full-sky cells"), formatInteger(total));
      appendLine(output, i18n.t("result.order.area", "area per cell"), `${formatDecimal(area, 6)} deg²`);
      appendLine(output, i18n.t("result.order.scale", "representative scale"), scaleDegrees < 1 ? `${formatDecimal(scaleDegrees * 60, 2)} arcmin` : `${formatDecimal(scaleDegrees, 3)}°`);
    } catch (error) {
      showError(output, i18n.t("result.error.order", "Enter an order from 0 to 10."));
    }
  }

  function renderCanonical() {
    const input = document.getElementById("canonical-input");
    const output = document.getElementById("canonical-output");
    if (!input || !output) {
      return;
    }
    try {
      const result = canonicalCells(parseCells(input.value));
      clearElement(output);
      appendLine(output, i18n.t("result.canonical.count", "canonical result"), `${formatInteger(result.length)} ${i18n.t("result.canonical.cells", "cells")}`);
      const cells = document.createElement("code");
      cells.className = "result-cells";
      cells.textContent = result.map(cellKey).join(", ");
      output.appendChild(cells);
    } catch (error) {
      showError(output, i18n.t("result.canonical.error", "Enter a valid list of order/ipix cells."));
    }
  }

  function renderUniqEncode() {
    const orderInput = document.getElementById("uniq-order");
    const ipixInput = document.getElementById("uniq-ipix");
    const output = document.getElementById("uniq-output");
    if (!orderInput || !ipixInput || !output) {
      return;
    }
    try {
      const order = parseOrder(orderInput.value, MAX_ORDER);
      const cell = validateCell(order, parseInteger(ipixInput.value));
      clearElement(output);
      appendLine(output, i18n.t("result.uniq.value", "NUNIQ"), encodeUniq(cell.order, cell.ipix).toString(), "result-code");
      appendLine(output, i18n.t("result.uniq.cell", "decoded cell"), cellKey(cell));
    } catch (error) {
      showError(output, i18n.t("result.uniq.error", "Enter a valid order, ipix, or NUNIQ value."));
    }
  }

  function renderUniqDecode() {
    const input = document.getElementById("uniq-value");
    const output = document.getElementById("uniq-decoded");
    if (!input || !output) {
      return;
    }
    try {
      const cell = decodeUniq(parseInteger(input.value));
      clearElement(output);
      appendLine(output, i18n.t("result.uniq.cell", "decoded cell"), cellKey(cell));
    } catch (error) {
      showError(output, i18n.t("result.uniq.error", "Enter a valid order, ipix, or NUNIQ value."));
    }
  }

  function renderProjection() {
    const cellsInput = document.getElementById("projection-input");
    const orderInput = document.getElementById("projection-order");
    const output = document.getElementById("projection-output");
    if (!cellsInput || !orderInput || !output) {
      return;
    }
    try {
      const targetOrder = parseOrder(orderInput.value, CALCULATOR_MAX_ORDER);
      const cells = parseCells(cellsInput.value);
      const result = projectCells(cells, targetOrder);
      clearElement(output);
      appendLine(output, i18n.t("result.projection.input", "input"), `${formatInteger(canonicalCells(cells).length)} ${i18n.t("result.canonical.cells", "cells")}`);
      appendLine(output, i18n.t("result.projection.cells", "target-order cells"), formatInteger(result.length));
      const values = document.createElement("code");
      values.className = "result-cells";
      values.textContent = result.map((value) => value.toString()).join(", ");
      output.appendChild(values);
    } catch (error) {
      const message = error.message === "projection-cap"
        ? i18n.t("result.projection.cap", "This demo caps expansion to protect the browser; lower the order difference or use fewer input cells.")
        : i18n.t("result.projection.error", "Enter valid cells and a target order from 0 to 10.");
      showError(output, message);
    }
  }

  function registerAlgorithmDemos() {
    const orderButton = document.getElementById("order-calculate");
    const canonicalButton = document.getElementById("canonical-run");
    const projectionButton = document.getElementById("projection-run");
    orderButton?.addEventListener("click", renderOrder);
    canonicalButton?.addEventListener("click", renderCanonical);
    projectionButton?.addEventListener("click", renderProjection);
    document.getElementById("uniq-order")?.addEventListener("input", renderUniqEncode);
    document.getElementById("uniq-ipix")?.addEventListener("input", renderUniqEncode);
    document.getElementById("uniq-value")?.addEventListener("input", renderUniqDecode);
    renderOrder();
    renderCanonical();
    renderUniqEncode();
    renderUniqDecode();
    renderProjection();
    window.addEventListener("moc-core-language-change", () => {
      renderOrder();
      renderCanonical();
      renderUniqEncode();
      renderUniqDecode();
      renderProjection();
    });
  }

  function registerCopyButtons() {
    const status = document.getElementById("copy-status");
    document.querySelectorAll("[data-copy-target]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = document.getElementById(button.getAttribute("data-copy-target"));
        if (!target) {
          return;
        }
        const value = target.textContent;
        let copied = false;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            copied = true;
          }
        } catch (error) {
          copied = false;
        }
        if (!copied) {
          const textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          try {
            copied = document.execCommand("copy");
          } catch (error) {
            copied = false;
          }
          textarea.remove();
        }
        const label = button.querySelector("[data-i18n]");
        if (label) {
          const labelKey = label.getAttribute("data-i18n");
          const originalLabel = labelKey === "copy.commands" ? "Copy commands" : "Copy code";
          label.textContent = i18n.t(copied ? "copy.copied" : "copy.failure", copied ? "Copied" : "Copy failed");
          window.setTimeout(() => {
            label.textContent = i18n.getLanguage() === "zh"
              ? i18n.t(labelKey, originalLabel)
              : originalLabel;
          }, 1400);
        }
        if (status) {
          status.textContent = i18n.t(copied ? "copy.success" : "copy.failure", copied ? "Copied." : "Copy failed. Select the code manually.");
        }
      });
    });
  }

  function registerSectionNavigation() {
    const links = [...document.querySelectorAll('.sidebar .sidebar-item > a[href^="#"]')];
    const sections = links.map((link) => document.getElementById(link.getAttribute("href").slice(1))).filter(Boolean);
    if (!links.length || !sections.length) {
      return;
    }
    const sectionById = new Map(sections.map((section) => [section.id, section]));
    let frame = 0;

    function updateTitle(sectionId) {
      const link = links.find((item) => item.getAttribute("href") === `#${sectionId}`);
      const label = text(link?.textContent || sectionById.get(sectionId)?.querySelector("h2")?.textContent || "MOC Core");
      document.title = `${label} | MOC Core | Astro Survey Atlas`;
    }

    function setActive(sectionId) {
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${sectionId}`;
        link.closest(".sidebar-item")?.classList.toggle("active", active);
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
      if (sectionById.has(sectionId)) {
        updateTitle(sectionId);
      }
    }

    function visibleSection() {
      const marker = window.scrollY + 150;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.offsetTop <= marker) {
          current = section;
        }
      });
      return current;
    }

    function updateFromScroll() {
      frame = 0;
      setActive(visibleSection().id);
    }

    function scheduleScrollUpdate() {
      if (!frame) {
        frame = window.requestAnimationFrame(updateFromScroll);
      }
    }

    function goTo(id, push) {
      const target = document.getElementById(id);
      if (!target) {
        return;
      }
      if (push) {
        window.history.pushState(null, "", `#${id}`);
      }
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      if (sectionById.has(id)) {
        setActive(id);
      }
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href").slice(1);
        if (!document.getElementById(id)) {
          return;
        }
        event.preventDefault();
        goTo(id, true);
      });
    });
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleScrollUpdate);
    window.addEventListener("popstate", () => {
      const id = window.location.hash.slice(1);
      if (id) {
        goTo(id, false);
      } else {
        scheduleScrollUpdate();
      }
    });
    window.addEventListener("hashchange", () => {
      const id = window.location.hash.slice(1);
      if (id) {
        goTo(id, false);
      }
    });
    window.addEventListener("moc-core-language-change", () => {
      const active = document.querySelector('.sidebar-item.active > a[href^="#"]');
      if (active) {
        updateTitle(active.getAttribute("href").slice(1));
      }
    });

    const initialId = window.location.hash.slice(1);
    if (initialId && document.getElementById(initialId)) {
      window.setTimeout(() => goTo(initialId, false), 0);
    } else {
      setActive(visibleSection().id);
    }
  }

  function init() {
    registerSectionNavigation();
    registerCopyButtons();
    registerAlgorithmDemos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
