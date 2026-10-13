/* 作品页：筛选 + VHS 录像带横向手风琴（悬停预览 / 点击展开 / 媒体切换 / 视频控制 / 放大）。 */
(function () {
  "use strict";

  var FILTER_KEY = "zn_filter";
  var OPEN_KEY = "zn_open_tape";

  var state = { filter: "all", openId: null };
  var rowEl, filterEl, lightboxEl, lightboxImg;
  var tapes = [];   // { project, el, refs, paint }
  var viewer = { rec: null, scale: 1, x: 0, y: 0, width: 0, height: 0, pointers: new Map(), gesture: null, focus: null };
  var lightboxStage;
  var hoverPreview, hoverPoint = null, focusTape = null, rowObserver, rowController;

  function hidePreview() { if (hoverPreview) hoverPreview.classList.remove("is-visible"); }
  function updatePreview() {
    if ((!hoverPoint && !focusTape) || !rowEl) { hidePreview(); return; }
    // Scrolling can put a different bookmark (or a gap) below a stationary pointer.
    var hit = hoverPoint && document.elementFromPoint(hoverPoint.x, hoverPoint.y);
    var tape = focusTape || (hit && hit.closest(".tape"));
    var rec = tape && tapes.find(function (t) { return t.el === tape; });
    if (!rec || tape.classList.contains("is-open")) { hidePreview(); return; }
    var r = tape.getBoundingClientRect(), area = rowEl.getBoundingClientRect();
    if (r.right <= area.left || r.left >= area.right || r.bottom <= 0 || r.top >= innerHeight) { hidePreview(); return; }
    var image = hoverPreview.querySelector("img");
    if (image.getAttribute("src") !== rec.project.cover) image.src = rec.project.cover;
    image.alt = APP.L(rec.project.title);
    hoverPreview.classList.toggle("is-keyboard", !!focusTape);
    hoverPreview.style.left = clamp((r.left + r.right) / 2 - 100, 8, Math.max(8, innerWidth - 208)) + "px";
    hoverPreview.style.top = clamp(r.top - 140, 70, Math.max(70, innerHeight - 136)) + "px";
    hoverPreview.classList.add("is-visible");
  }
  function bindRowScroll() {
    rowController = new AbortController();
    var options = { signal: rowController.signal, passive: true };
    // Lenis must not process these inputs again; boundary events retain native page scrolling.
    rowEl.setAttribute("data-lenis-prevent-wheel", "");
    rowEl.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.shiftKey || e.deltaX !== 0 || e.target.closest(".tape-face")) return;
      var limit = rowEl.scrollWidth - rowEl.clientWidth;
      if (limit <= 1 || !e.deltaY) return;
      var unit = e.deltaMode === 1 ? parseFloat(getComputedStyle(rowEl).lineHeight) || 24 : e.deltaMode === 2 ? rowEl.clientWidth : 1;
      var next = clamp(rowEl.scrollLeft + e.deltaY * unit, 0, limit);
      if (Math.abs(next - rowEl.scrollLeft) < .5) return;
      e.preventDefault(); e.stopPropagation();
      rowEl.scrollLeft = next; // Follow the real delta immediately; no queued tween/inertia.
      updatePreview();
    }, { signal: rowController.signal, passive: false });
    function trackPointer(e) {
      if (e.pointerType !== "mouse") return;
      focusTape = null; hoverPoint = { x: e.clientX, y: e.clientY }; updatePreview();
    }
    rowEl.addEventListener("pointerenter", trackPointer, options);
    rowEl.addEventListener("pointermove", trackPointer, options);
    rowEl.addEventListener("pointerleave", function () { hoverPoint = null; focusTape = null; hidePreview(); }, options);
    rowEl.addEventListener("focusin", function (e) {
      if (!e.target.matches(".tape-spine:focus-visible")) return;
      hoverPoint = null; focusTape = e.target.closest(".tape"); updatePreview();
    }, options);
    rowEl.addEventListener("focusout", function () { focusTape = null; hidePreview(); }, options);
    rowEl.addEventListener("scroll", updatePreview, options);
    rowEl.addEventListener("transitionend", function (e) { if (e.target.classList.contains('tape')) updatePreview(); }, options);
    rowObserver = new ResizeObserver(updatePreview);
    rowObserver.observe(rowEl);
    tapes.forEach(function (t) { rowObserver.observe(t.el); });
  }
  function alignOpenTape(rec) {
    var area = rowEl.getBoundingClientRect(), r = rec.el.getBoundingClientRect();
    var left = r.left - area.left + rowEl.scrollLeft, right = left + r.width;
    if (left < rowEl.scrollLeft) rowEl.scrollLeft = left;
    else if (right > rowEl.scrollLeft + rowEl.clientWidth) rowEl.scrollLeft = right - rowEl.clientWidth;
    hidePreview();
  }

  function readState() {
    var restored = APP.navigation.saved();
    try {
      state.filter = localStorage.getItem(FILTER_KEY) || "all";
    } catch (e) {}
    state.openId = null;
    if (restored) state.filter = restored.filter;
    var legacy = window.LEGACY_FILTERS || {};
    if (Object.prototype.hasOwnProperty.call(legacy, state.filter)) state.filter = legacy[state.filter];
    var validFilter = state.filter === "all" || (window.CATEGORIES || []).some(function (c) {
      return c.enabled && c.id === state.filter;
    });
    if (!validFilter) state.filter = "all";
    // The home "More work" entry explicitly opens the complete overview,
    // while ordinary work navigation continues to restore the saved selection.
    var queryFilter = new URLSearchParams(location.search).get('filter');
    if (!restored && (queryFilter === 'all' || (window.CATEGORIES || []).some(function (c) { return c.enabled && c.id === queryFilter; }))) state.filter = queryFilter;
    var h = location.hash.replace("#", "");
    if (h) state.openId = h;
    var target = (window.PROJECTS || []).filter(function (p) { return p.id === state.openId; })[0];
    if (!target) state.openId = null;
    /* 精选项目深链优先：旧筛选不应把要展开的项目隐藏。 */
    if (target && state.filter !== "all" && target.types.indexOf(state.filter) < 0) state.filter = "all";
    saveState();
  }
  function saveState() {
    try {
      localStorage.setItem(FILTER_KEY, state.filter);
      if (state.openId) localStorage.setItem(OPEN_KEY, state.openId);
      else localStorage.removeItem(OPEN_KEY);
    } catch (e) {}
  }

  function filteredProjects() {
    var list = window.PROJECT_DATA.sorted();
    if (state.filter === "all") return list;
    return list.filter(function (p) { return (p.types || []).indexOf(state.filter) >= 0; });
  }

  function counts() {
    var c = { all: (window.PROJECTS || []).length };
    (window.CATEGORIES || []).forEach(function (cat) {
      if (!cat.enabled) return;
      c[cat.id] = (window.PROJECTS || []).filter(function (p) {
        return (p.types || []).indexOf(cat.id) >= 0;
      }).length;
    });
    return c;
  }

  /* ---------------- 筛选栏 ---------------- */
  function buildFilter() {
    filterEl = document.createElement("div");
    filterEl.className = "filter-bar";
    document.querySelector("#page .container").appendChild(filterEl);

    var c = counts();
    var cats = [{ id: "all" }].concat((window.CATEGORIES || []).filter(function (x) {
      return x.enabled && c[x.id] > 0;
    }));

    cats.forEach(function (cat) {
      var b = document.createElement("button");
      b.className = "filter-pill";
      b.setAttribute("data-filter", cat.id);
      b.innerHTML = '<span class="pill-label"></span><sup>' + (c[cat.id] || 0) + '</sup>';
      b.addEventListener("click", function () {
        if (state.filter === cat.id) return;
        state.filter = cat.id;
        state.openId = null;
        saveState();
        renderRow();
        paintFilter();
        APP.navigation.replace(listURL());
      });
      filterEl.appendChild(b);
    });
    paintFilter();
    APP.onLang(paintFilter);
  }

  function paintFilter() {
    filterEl.querySelectorAll(".filter-pill").forEach(function (b) {
      var id = b.getAttribute("data-filter");
      var label = (id === "all") ? APP.t("filterAll") : APP.catLabel(id);
      b.querySelector(".pill-label").textContent = label;
      b.classList.toggle("is-active", id === state.filter);
    });
  }

  /* ---------------- 通用大图查看器：适合窗口 / 缩放 / 拖动 / 双指 ---------------- */
  function buildLightbox() {
    lightboxEl = document.createElement("dialog");
    lightboxEl.className = "lightbox";
    lightboxEl.setAttribute("data-lenis-prevent", "");
    lightboxEl.innerHTML =
      '<div class="lb-toolbar">' +
        '<div class="lb-navigation"><button class="lb-prev"></button><span class="lb-count" aria-live="polite"></span><button class="lb-next"></button></div>' +
        '<div class="lb-tools"><button class="lb-out">−</button><span class="lb-scale"></span><button class="lb-in">+</button><button class="lb-fit"></button><button class="lb-close"></button></div>' +
      '</div><div class="lb-stage"><img alt="" draggable="false"></div>' +
      '<div class="lb-footer"><span class="lb-caption"></span><span class="lb-hint"></span></div>';
    lightboxImg = lightboxEl.querySelector("img");
    lightboxStage = lightboxEl.querySelector(".lb-stage");
    document.body.appendChild(lightboxEl);
    lightboxEl.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lightboxEl.querySelector(".lb-in").addEventListener("click", function () { zoomViewer(viewer.scale * 1.5); });
    lightboxEl.querySelector(".lb-out").addEventListener("click", function () { zoomViewer(viewer.scale / 1.5); });
    lightboxEl.querySelector(".lb-fit").addEventListener("click", fitViewer);
    lightboxEl.querySelector(".lb-prev").addEventListener("click", function () { stepViewer(-1); });
    lightboxEl.querySelector(".lb-next").addEventListener("click", function () { stepViewer(1); });
    lightboxEl.addEventListener("cancel", function (e) { e.preventDefault(); closeLightbox(); });
    lightboxImg.addEventListener("load", fitViewer);
    lightboxStage.addEventListener("wheel", function (e) {
      e.preventDefault();
      zoomViewer(viewer.scale * Math.exp(-e.deltaY * .002), localPoint(e));
    }, { passive: false });
    lightboxStage.addEventListener("dblclick", function (e) {
      if (viewer.scale > 1) fitViewer(); else zoomViewer(3, localPoint(e));
    });
    lightboxStage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      lightboxStage.setPointerCapture(e.pointerId);
      viewer.pointers.set(e.pointerId, localPoint(e));
      beginGesture();
    });
    lightboxStage.addEventListener("pointermove", function (e) {
      if (!viewer.pointers.has(e.pointerId)) return;
      viewer.pointers.set(e.pointerId, localPoint(e));
      var points = Array.from(viewer.pointers.values()), g = viewer.gesture;
      if (!g) return;
      if (points.length > 1) {
        var mid = midpoint(points), scale = clamp(g.scale * distance(points) / g.distance, 1, 16);
        viewer.x = mid.x - (g.mid.x - g.x) * scale / g.scale;
        viewer.y = mid.y - (g.mid.y - g.y) * scale / g.scale;
        viewer.scale = scale;
      } else {
        viewer.x = g.x + points[0].x - g.mid.x;
        viewer.y = g.y + points[0].y - g.mid.y;
      }
      paintTransform();
    });
    function endPointer(e) { viewer.pointers.delete(e.pointerId); beginGesture(); }
    lightboxStage.addEventListener("pointerup", endPointer);
    lightboxStage.addEventListener("pointercancel", endPointer);
    lightboxStage.addEventListener("lostpointercapture", endPointer);
    lightboxEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") stepViewer(-1);
      else if (e.key === "ArrowRight") stepViewer(1);
      else if (e.key === "+" || e.key === "=") zoomViewer(viewer.scale * 1.5);
      else if (e.key === "-") zoomViewer(viewer.scale / 1.5);
      else if (e.key === "0") fitViewer();
      else return;
      e.preventDefault();
    });
    new ResizeObserver(function () { if (lightboxEl.open) fitViewer(); }).observe(lightboxStage);
    APP.onLang(paintViewer);
  }
  function clamp(n, low, high) { return Math.max(low, Math.min(high, n)); }
  function localPoint(e) {
    var r = lightboxStage.getBoundingClientRect();
    return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
  }
  function midpoint(points) { return { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }; }
  function distance(points) { return Math.max(1, Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)); }
  function beginGesture() {
    var points = Array.from(viewer.pointers.values());
    viewer.gesture = points.length ? {
      mid: points.length > 1 ? midpoint(points) : points[0], distance: points.length > 1 ? distance(points) : 1,
      scale: viewer.scale, x: viewer.x, y: viewer.y
    } : null;
  }
  function paintTransform() {
    var maxX = Math.max(0, (viewer.width * viewer.scale - lightboxStage.clientWidth) / 2);
    var maxY = Math.max(0, (viewer.height * viewer.scale - lightboxStage.clientHeight) / 2);
    viewer.x = clamp(viewer.x, -maxX, maxX); viewer.y = clamp(viewer.y, -maxY, maxY);
    lightboxImg.style.transform = "translate(-50%, -50%) translate(" + viewer.x + "px," + viewer.y + "px) scale(" + viewer.scale + ")";
    lightboxStage.classList.toggle("is-zoomed", viewer.scale > 1);
    lightboxEl.querySelector(".lb-scale").textContent = Math.round(viewer.scale * 100) + "%";
    lightboxEl.querySelector(".lb-out").disabled = viewer.scale <= 1;
    lightboxEl.querySelector(".lb-in").disabled = viewer.scale >= 16;
  }
  function fitViewer() {
    if (!lightboxEl.open || !lightboxImg.naturalWidth) return;
    var ratio = Math.min((lightboxStage.clientWidth - 32) / lightboxImg.naturalWidth,
      (lightboxStage.clientHeight - 32) / lightboxImg.naturalHeight, 1);
    viewer.width = lightboxImg.naturalWidth * Math.max(.001, ratio);
    viewer.height = lightboxImg.naturalHeight * Math.max(.001, ratio);
    lightboxImg.style.width = viewer.width + "px"; lightboxImg.style.height = viewer.height + "px";
    lightboxImg.style.visibility = "visible";
    viewer.scale = 1; viewer.x = viewer.y = 0;
    paintTransform(); beginGesture();
  }
  function zoomViewer(scale, point) {
    point = point || { x: 0, y: 0 };
    scale = clamp(scale, 1, 16);
    viewer.x = point.x - (point.x - viewer.x) * scale / viewer.scale;
    viewer.y = point.y - (point.y - viewer.y) * scale / viewer.scale;
    viewer.scale = scale; paintTransform(); beginGesture();
  }
  function imageIndices(rec) {
    return rec.project.media.reduce(function (ids, m, i) { if (m.type !== "video") ids.push(i); return ids; }, []);
  }
  function paintViewer() {
    if (!viewer.rec) return;
    var rec = viewer.rec, ids = imageIndices(rec), index = ids.indexOf(rec.mediaIndex);
    lightboxEl.setAttribute("aria-label", APP.t("zoom") + " · " + APP.L(rec.project.title));
    lightboxEl.querySelector(".lb-count").textContent = (index + 1) + " / " + ids.length;
    lightboxEl.querySelector(".lb-prev").disabled = index <= 0;
    lightboxEl.querySelector(".lb-next").disabled = index >= ids.length - 1;
    lightboxEl.querySelector(".lb-caption").textContent = APP.L(rec.project.title) + " · " + APP.L(rec.project.media[rec.mediaIndex].caption);
    lightboxImg.alt = APP.L(rec.project.media[rec.mediaIndex].caption);
    [[".lb-prev", "prevMedia"], [".lb-next", "nextMedia"], [".lb-fit", "fitImage"], [".lb-close", "closeZoom"]].forEach(function (entry) {
      lightboxEl.querySelector(entry[0]).textContent = APP.t(entry[1]);
    });
    lightboxEl.querySelector(".lb-in").setAttribute("aria-label", APP.t("zoomIn"));
    lightboxEl.querySelector(".lb-out").setAttribute("aria-label", APP.t("zoomOut"));
    lightboxEl.querySelector(".lb-hint").textContent = APP.t("viewerHint");
  }
  function loadViewerImage() {
    viewer.pointers.clear(); viewer.gesture = null;
    lightboxImg.style.visibility = "hidden";
    lightboxImg.src = viewer.rec.project.media[viewer.rec.mediaIndex].src;
    paintViewer();
    if (lightboxImg.complete && lightboxImg.naturalWidth) fitViewer();
  }
  function openLightbox(rec) {
    viewer.rec = rec; viewer.focus = document.activeElement;
    lightboxEl.showModal(); lightboxEl.classList.add("is-open");
    document.body.classList.add("viewer-open");
    if (APP.lenis) APP.lenis.stop();
    loadViewerImage();
    lightboxEl.querySelector(".lb-close").focus();
  }
  function stepViewer(delta) {
    var ids = imageIndices(viewer.rec), index = ids.indexOf(viewer.rec.mediaIndex) + delta;
    if (index < 0 || index >= ids.length) return;
    selectMedia(viewer.rec, ids[index]); loadViewerImage();
  }
  function closeLightbox() {
    if (!lightboxEl.open) return;
    lightboxEl.close(); lightboxEl.classList.remove("is-open");
    document.body.classList.remove("viewer-open");
    if (APP.lenis) APP.lenis.start();
    lightboxImg.removeAttribute("src"); viewer.pointers.clear();
    var focus = viewer.focus && viewer.focus.isConnected ? viewer.focus : viewer.rec.refs.frame.querySelector(".zoom-btn");
    if (focus) focus.focus({ preventScroll: true });
    viewer.rec = null;
  }

  /* ---------------- 单条录像带 ---------------- */
  function buildTape(project) {
    var el = document.createElement("article");
    el.className = "tape";
    el.setAttribute("data-status", project.status || "normal");
    el.setAttribute("data-cursor", "tape");
    el.setAttribute("data-id", project.id);

    el.innerHTML =
      '<div class="tape-preview"><img alt=""></div>' +
      '<div class="tape-spine"><span class="spine-title"></span></div>' +
      '<div class="tape-face">' +
        '<button class="tape-close" aria-label="close">&times;</button>' +
        '<div class="tape-media"><div class="media-frame"></div>' +
          '<div class="media-nav"><button class="media-prev"></button><span class="media-count" aria-live="polite"></span><button class="media-next"></button></div></div>' +
        '<div class="tape-info">' +
          '<div class="info-year"></div>' +
          '<div class="info-type"></div>' +
          '<h3 class="info-title"></h3>' +
          '<div class="info-role"></div>' +
          '<div class="info-production" hidden></div>' +
          '<div class="info-desc"></div>' +
          '<div class="info-nature"></div>' +
          '<div class="tape-links"></div>' +
          '<div class="tape-stills"></div>' +
        '</div>' +
      '</div>';

    var refs = {
      previewImg: el.querySelector(".tape-preview img"),
      spine: el.querySelector(".spine-title"),
      frame: el.querySelector(".media-frame"),
      year: el.querySelector(".info-year"),
      type: el.querySelector(".info-type"),
      title: el.querySelector(".info-title"),
      role: el.querySelector(".info-role"),
      production: el.querySelector(".info-production"),
      desc: el.querySelector(".info-desc"),
      nature: el.querySelector(".info-nature"),
      links: el.querySelector(".tape-links"),
      stills: el.querySelector(".tape-stills"),
      prev: el.querySelector(".media-prev"),
      next: el.querySelector(".media-next"),
      count: el.querySelector(".media-count")
    };

    /* Open the selected cover without reordering or removing gallery media. */
    var mainIndex = (project.media || []).findIndex(function (m) {
      return m.src === project.cover || m.prev === project.cover;
    });
    var rec = { project: project, el: el, refs: refs, mediaIndex: Math.max(0, mainIndex), video: null };
    el.addEventListener("transitionend", function (e) {
      if (e.target === el && e.propertyName === "width" && el.classList.contains("is-open") && !rec.restorePosition) alignOpenTape(rec);
    });
    refs.prev.addEventListener("click", function () { selectMedia(rec, rec.mediaIndex - 1); });
    refs.next.addEventListener("click", function () { selectMedia(rec, rec.mediaIndex + 1); });
    refs.stills.setAttribute("data-lenis-prevent", "");
    el.querySelector(".tape-info").setAttribute("data-lenis-prevent", "");

    /* 悬停预览图 = 封面 */
    refs.previewImg.src = project.cover;

    /* 全部媒体的缩略图；滚动区域与项目说明分开。 */
    (project.media || []).forEach(function (m, i) {
      var b = document.createElement("button");
      b.innerHTML = '<img src="' + (m.prev || m.src) + '" alt="">';
      b.dataset.mediaIndex = i;
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        selectMedia(rec, i);
      });
      refs.stills.appendChild(b);
    });

    /* 外链 */
    (project.links || []).forEach(function (l) {
      var a = document.createElement("a");
      a.href = l.url; a.target = "_blank"; a.rel = "noopener";
      a.setAttribute("data-link-label", l.label ? (l.label.zh + "|" + l.label.en) : "");
      a.addEventListener("click", function (e) { e.stopPropagation(); });
      refs.links.appendChild(a);
    });

    el.querySelector(".tape-close").addEventListener("click", function (e) {
      e.stopPropagation();
      closeTape(rec);
    });
    el.querySelector(".tape-spine").addEventListener("click", function (e) {
      e.stopPropagation();
      if (el.classList.contains("is-open")) closeTape(rec); else openTape(rec);
    });
    var spineButton = el.querySelector(".tape-spine");
    spineButton.tabIndex = 0; spineButton.setAttribute("role", "button");
    spineButton.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); spineButton.click(); }
    });
    el.querySelector(".tape-face").addEventListener("click", function (e) { e.stopPropagation(); });

    rec.paint = function () {
      refs.spine.textContent = APP.L(project.title);
      spineButton.setAttribute("aria-label", APP.L(project.title));
      spineButton.setAttribute("aria-expanded", String(el.classList.contains("is-open")));
      refs.title.textContent = APP.L(project.title);
      refs.role.textContent = APP.L(project.role);
      refs.production.hidden = project.productionStatus !== "produced";
      refs.production.textContent = project.productionStatus === "produced" ? APP.t("produced") : "";
      refs.desc.textContent = APP.L(project.desc);
      refs.type.textContent = (project.types || []).map(APP.catLabel).join(" / ");
      refs.year.textContent = yearText(project);
      refs.links.querySelectorAll("a").forEach(function (a, i) {
        var l = (project.links || [])[i];
        a.textContent = l && l.label ? APP.L(l.label) : a.textContent;
      });
      paintTapeCursor(rec);
      showMedia(rec, true);
    };

    return rec;
  }

  function yearText(p) {
    var parts = [];
    parts.push(window.PROJECT_DATA.formatYear(p) || APP.t("yearTBC"));
    if (p.themeYears) parts.push(APP.L(p.themeYears));
    if (p.status === "ongoing") parts.push(APP.t("ongoing"));
    return parts.join(" · ");
  }

  /* ---------------- 媒体展示（图/视频 + 控制） ---------------- */
  function selectMedia(rec, index) {
    if (index < 0 || index >= rec.project.media.length) return;
    rec.mediaIndex = index; showMedia(rec);
    var b = rec.refs.stills.querySelector('[data-media-index="' + index + '"]');
    if (b.offsetTop < rec.refs.stills.scrollTop) rec.refs.stills.scrollTop = b.offsetTop;
    else if (b.offsetTop + b.offsetHeight > rec.refs.stills.scrollTop + rec.refs.stills.clientHeight)
      rec.refs.stills.scrollTop = b.offsetTop + b.offsetHeight - rec.refs.stills.clientHeight;
  }
  function paintTapeCursor(rec) {
    var opened = rec.el.classList.contains("is-open");
    rec.el.querySelector(".tape-face").inert = !opened;
    if (opened) rec.el.removeAttribute("data-cursor"); else rec.el.setAttribute("data-cursor", "tape");
    rec.el.setAttribute("data-cursor-label", APP.t("expandHint"));
    var spine = rec.el.querySelector(".tape-spine");
    spine.setAttribute("aria-expanded", String(opened));
    spine.setAttribute("data-cursor", "tape");
    spine.setAttribute("data-cursor-label", APP.t(opened ? "collapseHint" : "expandHint"));
    rec.el.querySelector(".tape-close").setAttribute("aria-label", APP.t("collapseHint"));
    if (APP.refreshCursor) APP.refreshCursor();
  }
  function paintMedia(rec) {
    var m = rec.project.media[rec.mediaIndex];
    rec.refs.nature.textContent = APP.t("natureLabel") + (APP.lang === "zh" ? "：" : ": ") + APP.L(m.nature);
    rec.refs.prev.textContent = APP.t("prevMedia"); rec.refs.next.textContent = APP.t("nextMedia");
    rec.refs.prev.disabled = rec.mediaIndex === 0;
    rec.refs.next.disabled = rec.mediaIndex === rec.project.media.length - 1;
    rec.refs.count.textContent = (rec.mediaIndex + 1) + " / " + rec.project.media.length;
    rec.refs.stills.setAttribute("aria-label", APP.t("mediaThumbnails"));
    rec.refs.stills.querySelectorAll("button").forEach(function (b) {
      var i = +b.dataset.mediaIndex, active = i === rec.mediaIndex;
      b.classList.toggle("is-active", active); b.setAttribute("aria-pressed", String(active));
      b.setAttribute("aria-label", (i + 1) + " / " + rec.project.media.length + " · " + APP.L(rec.project.media[i].caption));
    });
    var img = rec.refs.frame.querySelector("img"), z = rec.refs.frame.querySelector(".zoom-btn");
    if (img) { img.alt = APP.L(m.caption); img.setAttribute("aria-label", APP.t("zoom") + " · " + APP.L(m.caption)); img.setAttribute("data-cursor-label", APP.t("zoom")); }
    if (z) { z.textContent = APP.t("zoom"); z.setAttribute("data-cursor-label", APP.t("zoom")); }
    var play = rec.refs.frame.querySelector(".video-play");
    if (play) play.setAttribute("aria-label", APP.t(rec.video.paused ? "play" : "pause"));
  }
  function showMedia(rec, keepVideoState) {
    var m = (rec.project.media || [])[rec.mediaIndex];
    var frame = rec.refs.frame;
    if (keepVideoState && frame.dataset.mediaIndex === String(rec.mediaIndex)) { paintMedia(rec); return; }
    if (rec.video) rec.video.pause();
    frame.innerHTML = "";
    frame.dataset.mediaIndex = rec.mediaIndex;
    frame.classList.toggle("is-main-photo", rec.project.id === "caijin" && rec.mediaIndex === 0);
    frame.classList.toggle("is-auto-height", !!(m && m.autoHeight));
    rec.el.classList.toggle("has-auto-height-media", !!(m && m.autoHeight));
    rec.video = null;
    if (!m) return;

    if (m.type === "video") {
      frame.classList.add("is-video");
      var v = document.createElement("video");
      v.src = m.src; v.preload = "metadata"; v.playsInline = true;
      v.setAttribute("playsinline", "");
      frame.appendChild(v);
      rec.video = v;

      var ui = document.createElement("div");
      ui.className = "video-ui";
      ui.innerHTML =
        '<button class="video-play" aria-label="play">' +
          '<svg class="icon-play" width="16" height="16" viewBox="0 0 16 16"><path d="M4 2 L13 8 L4 14 Z" fill="currentColor"/></svg>' +
          '<svg class="icon-pause" width="16" height="16" viewBox="0 0 16 16"><path d="M4 2 h3 v12 h-3 Z M9 2 h3 v12 h-3 Z" fill="currentColor"/></svg>' +
        '</button>' +
        '<div class="video-progress"><i></i></div>';
      frame.appendChild(ui);

      var playBtn = ui.querySelector(".video-play");
      var bar = ui.querySelector(".video-progress i");
      playBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (v.paused) v.play(); else v.pause();
      });
      v.addEventListener("play", function () { playBtn.classList.add("is-playing"); playBtn.setAttribute("aria-label", APP.t("pause")); });
      v.addEventListener("pause", function () { playBtn.classList.remove("is-playing"); playBtn.setAttribute("aria-label", APP.t("play")); });
      v.addEventListener("timeupdate", function () {
        if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + "%";
      });
      ui.querySelector(".video-progress").addEventListener("click", function (e) {
        e.stopPropagation();
        if (!v.duration) return;
        var r = e.currentTarget.getBoundingClientRect();
        v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
      });
    } else {
      frame.classList.remove("is-video");
      var img = document.createElement("img");
      img.src = m.src; img.alt = APP.L(m.caption) || "";
      if (m.autoHeight) img.addEventListener("load", function () { if (APP.lenis) APP.lenis.resize(); });
      img.tabIndex = 0; img.setAttribute("role", "button"); img.setAttribute("data-cursor", "zoom");
      img.addEventListener("click", function () { openLightbox(rec); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(rec); }
      });
      frame.appendChild(img);
      var z = document.createElement("button");
      z.className = "zoom-btn"; z.setAttribute("data-cursor", "zoom");
      z.addEventListener("click", function (e) { e.stopPropagation(); openLightbox(rec); });
      frame.appendChild(z);
    }

    paintMedia(rec);
  }

  /* ---------------- 展开 / 收起 ---------------- */
  function listURL() {
    var url = new URL(location.href); url.hash = ''; url.searchParams.set('filter', state.filter);
    return url.pathname + url.search;
  }
  function openTape(rec, restoring) {
    if (!restoring) {
      if (state.openId) APP.navigation.replace('#' + rec.project.id);
      else APP.navigation.push('#' + rec.project.id);
    }
    rec.restorePosition = !!restoring && !!APP.navigation.saved();
    hidePreview();
    tapes.forEach(function (t) { t.el.classList.remove("is-open"); if (t.video) t.video.pause(); paintTapeCursor(t); });
    rec.el.classList.add("is-open");
    paintTapeCursor(rec);
    rowEl.classList.add("has-open");
    state.openId = rec.project.id;
    saveState();
    if (!rec.restorePosition) {
      alignOpenTape(rec);
      requestAnimationFrame(function () { if (rec.el.isConnected && rec.el.classList.contains("is-open")) alignOpenTape(rec); });
    }
    if (!restoring) APP.navigation.capture();
  }
  function closeTape(rec) {
    if (APP.navigation.canBackToList()) { APP.navigation.back(); return; }
    rec.el.classList.remove("is-open");
    paintTapeCursor(rec);
    rowEl.classList.remove("has-open");
    if (rec.video) rec.video.pause();
    state.openId = null;
    saveState();
    APP.navigation.replace(listURL());
  }

  /* ---------------- 行渲染 ---------------- */
  function renderRow() {
    if (rowController) rowController.abort();
    if (rowObserver) rowObserver.disconnect();
    hoverPoint = null; focusTape = null; hidePreview();
    tapes.forEach(function (t) { if (t.video) t.video.pause(); });
    if (rowEl) rowEl.remove();
    tapes = [];
    rowEl = document.createElement("div");
    rowEl.className = "vhs-row";
    document.querySelector("#page .container").appendChild(rowEl);

    filteredProjects().forEach(function (p) {
      var rec = buildTape(p);
      tapes.push(rec);
      rowEl.appendChild(rec.el);
      rec.paint();
    });

    rowEl.addEventListener("click", function (e) {
      var tapeEl = e.target.closest(".tape");
      if (!tapeEl) return;
      var rec = tapes.filter(function (t) { return t.el === tapeEl; })[0];
      if (rec && !rec.el.classList.contains("is-open")) openTape(rec);
    });

    bindRowScroll();

    if (state.openId) {
      var target = tapes.filter(function (t) { return t.project.id === state.openId; })[0];
      if (target) openTape(target, true);
    }
  }

  /* ---------------- 页面接入 ---------------- */
  window.PAGE = {
    id: "work",
    captureState: function () {
      return {filter:state.filter, openId:state.openId, rowX:rowEl ? rowEl.scrollLeft : 0};
    },
    restoreState: function (saved) {
      if (!rowEl) return;
      if (lightboxEl && lightboxEl.open) closeLightbox();
      var nextId = location.hash.slice(1) || null;
      var nextFilter = saved ? saved.filter : state.filter;
      if (state.openId !== nextId || state.filter !== nextFilter) {
        state.filter = nextFilter; state.openId = nextId;
        var target = (window.PROJECTS || []).find(function (p) { return p.id === nextId; });
        if (target && state.filter !== 'all' && target.types.indexOf(state.filter) < 0) state.filter = 'all';
        saveState(); renderRow(); paintFilter();
      }
    },
    restoreScroll: function (saved) { if (saved && rowEl) { rowEl.scrollLeft = saved.rowX || 0; hidePreview(); } },
    handleBack: function () {
      if (lightboxEl && lightboxEl.open) { closeLightbox(); return true; }
      var rec = tapes.find(function (t) { return t.project.id === state.openId; });
      if (!rec) return false;
      closeTape(rec); return true;
    },
    init: function () {
      readState();
      var h = document.querySelector("#page .container");
      var head = document.createElement("div");
      head.className = "section-label";
      head.style.marginBottom = "18px";
      h.appendChild(head);
      buildFilter();
      buildLightbox();
      hoverPreview = document.createElement("div");
      hoverPreview.className = "work-tape-preview";
      hoverPreview.setAttribute("aria-hidden", "true");
      hoverPreview.innerHTML = '<img alt="">';
      document.body.appendChild(hoverPreview);
      renderRow();
      window.addEventListener("scroll", updatePreview, { passive: true });
      window.addEventListener("resize", updatePreview, { passive: true });
      window.addEventListener("pagehide", function () { hoverPoint = null; hidePreview(); });
      APP.onLang(function () {
        head.textContent = APP.t("workTitle");
        tapes.forEach(function (t) { t.paint(); });
        updatePreview();
      });
      head.textContent = APP.t("workTitle");
    },
    renderLang: function () {}
  };
})();
