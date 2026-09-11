/*
 * Copyright 2026 Astro Survey Atlas contributors.
 * Licensed under the Apache License, Version 2.0.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "moc-core-language";
  const DEFAULT_LANGUAGE = "zh";
  const originalMarkup = new WeakMap();
  const originalAttributes = new WeakMap();
  const originalMeta = new WeakMap();

  const chinese = Object.freeze({
    "a11y.skip": "跳到文档正文",
    "a11y.home": "MOC Core 文档首页",
    "a11y.primaryNav": "主导航",
    "a11y.languageToggle": "切换到英文",
    "a11y.themeToggle": "切换主题",
    "a11y.onThisPage": "本页导航",
    "diagram.dataFlow": "MOC Core 数据流",
    "hero.facts.label": "Core 保证",
    "meta.description": "MOC-Core-SDK 入门文档：确定性的 ICRS/NESTED HEALPix 覆盖、FITS MOC、固定阶投影和 Resource Package v3 归档。",
    "brand.docs": "文档",
    "nav.quickStart": "快速开始",
    "nav.algorithms": "算法",
    "nav.github": "GitHub 仓库",
    "nav.overview": "01 / 为什么需要天空网格",
    "nav.capabilities": "02 / Core 会构建什么",
    "nav.modes": "03 / 选择输入模式",
    "nav.algorithmsSection": "04 / 看懂算法",
    "nav.build": "05 / 构建、投影、打包",
    "nav.limits": "06 / 了解边界",
    "sidebar.documentation": "文档目录",
    "sidebar.contracts": "规范契约",
    "sidebar.related": "相关项目",
    "hero.eyebrow": "Astro Survey Atlas / 科学核心",
    "hero.title.line1": "把本地天空证据",
    "hero.title.line2": "变成计算机可以比较的地图。",
    "hero.description.one": "MOC-Core-SDK 将经过审核的本地输入转换为标准化的天空覆盖地图。它使用 ICRS、NESTED HEALPix 和 IVOA FITS MOC，让不同项目可以交换同一份空间证据。",
    "hero.description.two": "你不必从数学开始。可以把天空想成被等面积小格子覆盖的球面：Core 根据图像、星表、区域文件或已有 MOC 判断哪些格子有证据，再以确定性的形式写出结果。",
    "hero.primary": "先认识天空网格",
    "hero.secondary": "查看一次真实构建",
    "flow.input.name": "已审核的本地输入",
    "flow.input.role": "FITS / 表格 / 区域 / MOC",
    "flow.lock": "锁定快照",
    "flow.core.role": "验证 / 栅格化 / 规范化",
    "flow.write": "写入规范 MOC",
    "flow.moc.role": "ICRS / NESTED / NUNIQ",
    "flow.consume": "投影 / 发布",
    "flow.output.name": "Assets / Workspace / Warehouse",
    "flow.output.role": "一套共享的空间语言",
    "hero.fact.offline": "锁定快照后离线",
    "hero.fact.frame": "一个天球坐标系",
    "hero.fact.ordering": "一种像元顺序",
    "hero.fact.artifact": "一个权威产物",
    "concepts.tag": "给初学者的版本",
    "concepts.title": "MOC 就是一张天空格子清单",
    "concepts.lead": "Multi-Order Coverage map 不会把图像或星表复制到另一个服务里。它使用分层的等面积 HEALPix 像元，记录天空的哪些部分被覆盖。",
    "concepts.tile.title": "什么是像元？",
    "concepts.tile.body": "想象一个包裹在天球上的透明网格。一个像元表示“这片区域包含在内”。MOC 保存的是被包含的像元，而不是科学数据本身的图像像素。",
    "concepts.order.body": "细节等级。每提高一阶，一个父像元会分成四个子像元。",
    "concepts.ipix.body": "某一阶内的像元编号。<code>order</code> 与 <code>ipix</code> 合在一起，就能唯一标识一个 NESTED 像元。",
    "calculator.eyebrow": "离线计算器",
    "calculator.title": "每一阶有多细？",
    "calculator.badge": "在浏览器中运行",
    "calculator.orderLabel": "HEALPix 阶数",
    "calculator.calculate": "计算",
    "calculator.note": "Core 支持 0–29 阶。这里最多计算到 10 阶，方便阅读像元数量。",
    "capabilities.tag": "契约",
    "capabilities.title": "一个核心，几种实用产物",
    "capabilities.lead": "Core 保留一份权威空间结果，再从它派生便于使用的视图。这样预览可以快速加载，却不会假装比原始证据更精确。",
    "artifact.spec": "经过验证的配方：图层身份、输入模式、覆盖含义、来源等级、最大阶数和锁定快照引用。",
    "artifact.result": "规范化像元、IVOA FITS MOC、固定阶 JSON 投影、统计信息和脱敏 provenance。",
    "artifact.package": "用于发布一个或多个 MOC 的确定性 ZIP，包含覆盖元数据、provenance 和可读 README。",
    "pipeline.validate": "先验证",
    "pipeline.validate.body": "在枚举来源或进行凭据 I/O 之前拒绝错误计划。",
    "pipeline.read": "本地读取",
    "pipeline.read.body": "使用一个声明的模式解析锁定快照或规范化输入。",
    "pipeline.normalize": "规范化",
    "pipeline.normalize.body": "去重、删除已被覆盖的子像元，并折叠完整的兄弟像元组。",
    "pipeline.publish": "发布",
    "pipeline.publish.body": "写入稳定的 FITS、投影、统计信息和脱敏证据。",
    "api.title": "公开的 Python 接口",
    "api.body": "包根目录保持常用路径简洁。更底层的辅助函数用于一致性和打包工具，但调用者可以从一个配方和一次构建开始。",
    "api.note.title": "有意保持的边界：",
    "api.note.body": "Core 接收本地文件或已经解析好的规范化输入。来源连接器、认证、远程字节范围、发布审核和在线查询属于外围项目。",
    "copy.code": "复制代码",
    "copy.commands": "复制命令",
    "modes.tag": "输入适配器",
    "modes.title": "选择你已经拥有的证据",
    "modes.lead": "每种模式都把一种本地证据转换为同一种规范像元语言。Core 不会悄悄猜测另一种模式，也不会在证据缺失时凭空发明覆盖范围。",
    "mode.caveat": "重要：",
    "mode.fits.title": "从 WCS 得到图像覆盖",
    "mode.fits.body": "从 FITS 或已解析的 JSON/JSONL header 读取二维天球 WCS。它采样矩形边界，将其转换到 ICRS，再用 mocpy 栅格化。",
    "mode.fits.caveat": "矩形是模型本身；不会检查掩码或坏像元。有限的边界采样是一种近似。",
    "mode.catalog.title": "从星表得到天体位置",
    "mode.catalog.body": "从 FITS 表、JSON、JSONL 或 CSV 读取 RA 和 Dec。RA 会按 360 度取模；非法或非有限坐标会失败，没有坐标的行则跳过。",
    "mode.catalog.caveat": "非正半径标记点所在像元；正半径则请求 mocpy 构造圆锥覆盖。",
    "mode.nested.title": "你已经信任的像元",
    "mode.nested.body": "接收经过验证的 FITS/NUNIQ MOC 或 JSON/CSV 像元。每个像元带有明确的阶数和像元号，或者明确声明标量值是 <code>uniq</code>。",
    "mode.nested.caveat": "当前的 <code>nside</code> 转换不会强制检查 nside 是否为 2 的幂。",
    "mode.regions.title": "从区域文件读取形状",
    "mode.regions.body": "读取 DS9 风格的区域文件，或只包含扁平 <code>.reg</code> 条目的安全 ZIP。几何转换交给 regions 和 mocpy。",
    "mode.regions.caveat": "仓库测试最充分的是 ICRS DS9 区域；其他坐标系依赖上游库。",
    "mode.tile.title": "按曝光次数过滤指向",
    "mode.tile.body": "使用带 RA/Dec 的表格输入，并可选用 <code>NEXP</code> 阈值。当巡天清单包含 tile 指向且只有曝光充分的 tile 才应计入时，这很有用。",
    "mode.tile.caveat": "阈值只过滤行；它不会把指向表变成已测量的仪器 footprint。",
    "modes.table.caption": "输出词汇相同，证据来源不同",
    "modes.table.mode": "模式",
    "modes.table.reads": "读取",
    "modes.table.makes": "生成像元的方式",
    "modes.table.caveat": "需要记住的边界",
    "modes.table.fits.reads": "二维天球 WCS",
    "modes.table.fits.makes": "采样多边形 → mocpy",
    "modes.table.fits.caveat": "整个 WCS 矩形",
    "modes.table.catalog.reads": "RA / Dec 行",
    "modes.table.catalog.makes": "HEALPix 点或圆锥",
    "modes.table.catalog.caveat": "占用情况，不是天体索引",
    "modes.table.nested.reads": "NUNIQ 或像元",
    "modes.table.nested.makes": "验证并规范化",
    "modes.table.nested.caveat": "顺序必须是 NESTED",
    "modes.table.regions.reads": "DS9 / ZIP 区域",
    "modes.table.regions.makes": "上游几何 → MOC",
    "modes.table.regions.caveat": "坐标系语义由上游库负责",
    "modes.table.tile.reads": "指向 + NEXP",
    "modes.table.tile.makes": "过滤后的点或圆锥",
    "modes.table.tile.caveat": "阈值不等于 footprint 真值",
    "algorithms.tag": "算法实验室",
    "algorithms.title": "三条小规则让结果可复现",
    "algorithms.lead": "这些演示使用与 Python 实现相同的整数规则。它们刻意保持很小：目的是看懂 Core 的承诺，而不是取代科学验证。",
    "lab.canonical.eyebrow": "规范像元",
    "lab.canonical.title": "很多种描述，一个答案",
    "lab.canonical.body": "父像元覆盖它的所有子孙。四个完整的子像元可以折叠为父像元。结果会排序、去重，并且不依赖分片顺序。",
    "lab.cells.label": "以 order/ipix 表示像元",
    "lab.run": "规范化",
    "lab.canonical.note": "试着删除 <code>7/25</code>，观察四个 8 阶兄弟像元如何折叠成它。",
    "lab.uniq.eyebrow": "NUNIQ",
    "lab.uniq.title": "给一个像元一个整数 ID",
    "lab.uniq.body": "FITS 保存一个 <code>UNIQ</code> 值。阶数编码在数值区间中，像元号是该区间内的偏移量。",
    "lab.order": "阶数",
    "lab.ipix": "ipix",
    "lab.uniq.decode": "解码一个 UNIQ",
    "lab.project.eyebrow": "固定阶投影",
    "lab.project.title": "在同一分辨率比较",
    "lab.project.body": "更细的像元映射到包含它的粗像元。请求更细索引时，粗像元会展开为所有后代。这种展开增加的是候选，不是测量细节。",
    "lab.project.cells": "源像元",
    "lab.project.target": "目标阶数",
    "algorithms.note.title": "为什么不直接使用十进制坐标？",
    "algorithms.note.body": "坐标很适合作为输入，但像元为交集和索引提供了一套共享且有边界的词汇。Core 明确保存坐标系、顺序和实际阶数，让消费者不必猜测一个数字代表什么。",
    "build.tag": "从快照到发布",
    "build.title": "构建一次，检查每个产物",
    "build.lead": "网络步骤是显式的。<code>refresh</code> 锁定来源快照及其 SHA-256 之后，构建路径完全离线且可重复。",
    "build.output.moc": "权威 IVOA FITS MOC：Primary HDU 加一个包含 64 位 NUNIQ 像元的 MOC 表。",
    "build.output.query": "用于快速查找的固定阶 NESTED 像元。默认查询阶数是 8。",
    "build.output.preview": "更小的概览投影。之后再上采样也无法恢复细节。",
    "build.output.evidence": "用于调查的数量、面积、来源身份和脱敏构建上下文。",
    "case.eyebrow": "仓库 fixture / CSST W1",
    "case.badge": "模拟证据",
    "case.title": "一个真实但有边界的例子",
    "case.body": "一致性 fixture 记录了一组模拟图像输入的审核后并集。Warehouse 匹配到 178,056 个图像 basename；排除一个异常 WCS 输入后，纳入了 178,055 个。",
    "case.stat.order8": "8 阶像元",
    "case.stat.order4": "4 阶预览像元",
    "case.stat.area": "测量面积",
    "case.note": "这是模拟证据，不是正式的 CSST 巡天 footprint。“1000 平方度”是项目标签，不是测量声明。",
    "case.link": "阅读冻结 fixture 说明",
    "package.title": "Resource Package v3",
    "package.body": "发布封装是闭合、确定且无需服务即可检查的。",
    "package.limits": "验证器会检查路径穿越、符号链接、加密、重复项、未声明文件、MOC header、大小和 SHA-256。它还强制限制 10,000 个条目、单项 512 MiB 和总计 2 GiB。",
    "limits.tag": "阅读细节",
    "limits.title": "有用的证据也有诚实的边界",
    "limits.lead": "Core 有意保持窄小。这些限制是产品契约的一部分，而不是发布结果后才隐藏起来的脚注。",
    "limits.supported.label": "支持",
    "limits.supported.title": "规范的空间覆盖",
    "limits.supported.body": "ICRS 空间 MOC、NESTED 像元、确定性的并集/规范化、固定阶投影、FITS I/O、统计、provenance 和 Resource Package v3 验证。",
    "limits.caution.label": "近似",
    "limits.caution.title": "像元不是边界证明",
    "limits.caution.body": "WCS 使用有限的边界采样并把矩形作为模型。像元相交表示候选关系，不代表连续几何误差保证。",
    "limits.absent.label": "不包含",
    "limits.absent.title": "不是在线天文服务",
    "limits.absent.body": "这里没有在线搜索端点、可视化服务、科学数据归约、时间/频率 MOC、RING 转换，也没有交集/差集查询代数。",
    "limits.validator.title": "FITS 验证是有范围的",
    "limits.validator.body": "<code>validate_moc_fits()</code> 检查重要的 ICRS/NUNIQ/MOC header 和可解码像元，但不是完整的外部 IVOA 合规验证器。",
    "limits.version.title": "检查确切的 wheel",
    "limits.version.body": "仓库当前存在版本分歧：包元数据是 1.1.0，而 <code>CORE_VERSION</code>、README、CLI 和任务契约仍写着 1.0.0。请记录确切 commit 和 wheel SHA-256。",
    "limits.privacy.title": "凭据留在系统之外",
    "limits.privacy.body": "Refresh 拒绝 URL 凭据，provenance 会脱敏 userinfo、query、fragment 和类似 secret 的键。不要把凭据值放进 recipe、证据、日志、索引或响应。",
    "limits.warning.title": "预览永远不会变成测量结果。",
    "limits.warning.body": "4 阶是紧凑视图，8 阶是常用查询投影。二者都不能凭空制造权威输入中不存在的细节。",
    "limits.reading.title": "在哪里核对细节",
    "limits.reading.contract": "空间表示和 CLI 规则",
    "limits.reading.package": "manifest 结构和必需字段",
    "limits.reading.tests": "行为示例和冻结 fixture",
    "footer.description": "确定性空间核心的静态文档。示例离线运行，不连接在线服务。",
    "footer.source": "GitHub 上的源码和规范契约",

    "result.error.order": "请输入 0 到 10 之间的阶数。",
    "result.order.nside": "每边 nside",
    "result.order.cells": "全天像元数",
    "result.order.area": "单像元面积",
    "result.order.scale": "代表尺度",
    "result.canonical.count": "规范化后",
    "result.canonical.cells": "像元",
    "result.canonical.error": "请输入形如 order/ipix 的有效像元列表。",
    "result.uniq.value": "NUNIQ",
    "result.uniq.cell": "解码像元",
    "result.uniq.error": "请输入合法的 order、ipix 或 NUNIQ。",
    "result.projection.input": "输入",
    "result.projection.cells": "目标阶像元",
    "result.projection.cap": "为避免浏览器内存膨胀，此演示限制展开数量；请降低阶差或缩小输入。",
    "result.projection.error": "请输入有效像元和 0 到 10 之间的目标阶数。",
    "copy.success": "已复制。",
    "copy.failure": "复制失败，请手动选择代码。",
    "copy.copied": "已复制",
    "theme.dark": "夜间模式",
    "theme.light": "日间模式"
  });

  function readLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : DEFAULT_LANGUAGE;
    } catch (error) {
      return DEFAULT_LANGUAGE;
    }
  }

  function saveLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      // Private browsing can reject storage; the page still works in memory.
    }
  }

  function translate(key, fallback) {
    if (currentLanguage === "zh" && Object.prototype.hasOwnProperty.call(chinese, key)) {
      return chinese[key];
    }
    return fallback === undefined ? key : fallback;
  }

  function isInsideCode(element) {
    return Boolean(element.closest("pre, code, script, style, noscript"));
  }

  function translateText(language) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      if (isInsideCode(element)) {
        return;
      }
      if (!originalMarkup.has(element)) {
        originalMarkup.set(element, element.innerHTML);
      }
      const key = element.getAttribute("data-i18n");
      element.innerHTML = language === "zh" && Object.prototype.hasOwnProperty.call(chinese, key)
        ? chinese[key]
        : originalMarkup.get(element);
    });
  }

  function translateAttributes(language) {
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      if (!originalAttributes.has(element)) {
        originalAttributes.set(element, element.getAttribute("aria-label") || "");
      }
      const key = element.getAttribute("data-i18n-aria-label");
      const original = originalAttributes.get(element);
      element.setAttribute(
        "aria-label",
        language === "zh" && Object.prototype.hasOwnProperty.call(chinese, key) ? chinese[key] : original
      );
    });

    document.querySelectorAll("[data-i18n-meta]").forEach((element) => {
      if (!originalMeta.has(element)) {
        originalMeta.set(element, element.getAttribute("content") || "");
      }
      const key = element.getAttribute("data-i18n-meta");
      const original = originalMeta.get(element);
      element.setAttribute(
        "content",
        language === "zh" && Object.prototype.hasOwnProperty.call(chinese, key) ? chinese[key] : original
      );
    });
  }

  function updateLanguageControl(language) {
    const button = document.getElementById("language-toggle");
    if (!button) {
      return;
    }
    button.hidden = false;
    button.textContent = language === "zh" ? "English" : "中文";
    button.setAttribute("aria-label", language === "zh" ? "切换到英文" : "Switch to Chinese");
  }

  function applyLanguage(language, persist) {
    currentLanguage = language === "en" ? "en" : "zh";
    if (persist !== false) {
      saveLanguage(currentLanguage);
    }
    document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
    translateText(currentLanguage);
    translateAttributes(currentLanguage);
    updateLanguageControl(currentLanguage);
    window.dispatchEvent(new CustomEvent("moc-core-language-change", {
      detail: { language: currentLanguage }
    }));
  }

  let currentLanguage = readLanguage();
  applyLanguage(currentLanguage, false);

  const languageButton = document.getElementById("language-toggle");
  if (languageButton) {
    languageButton.addEventListener("click", () => {
      applyLanguage(currentLanguage === "zh" ? "en" : "zh");
    });
  }

  window.MocCoreI18n = Object.freeze({
    t: translate,
    applyLanguage,
    getLanguage: () => currentLanguage
  });
})();
