/* 作品页：筛选 + VHS 录像带横向手风琴（悬停预览 / 点击展开 / 媒体切换 / 视频控制 / 放大）。 */
(function () {
  "use strict";

  var FILTER_KEY = "zn_filter";
  var OPEN_KEY = "zn_open_tape";

  var state = { filter: "all", openId: null };
  var rowEl, filterEl, lightboxEl, lightboxImg;
  var tapes = [];   // { project, el, refs, paint }

  function readState() {
    try {
      state.filter = localStorage.getItem(FILTER_KEY) || "all";
      state.openId = localStorage.getItem(OPEN_KEY) || null;
    } catch (e) {}
    var h = location.hash.replace("#", "");
    if (h) state.openId = h;
  }
  function saveState() {
    try {
      localStorage.setItem(FILTER_KEY, state.filter);
      if (state.openId) localStorage.setItem(OPEN_KEY, state.openId);
      else localStorage.removeItem(OPEN_KEY);
    } catch (e) {}
  }

  function filteredProjects() {
    var list = (window.PROJECTS || []).slice();
    list.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
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

  /* ---------------- 灯箱 ---------------- */
  function buildLightbox() {
    lightboxEl = document.createElement("div");
    lightboxEl.className = "lightbox";
    lightboxEl.innerHTML = '<button class="lb-close" aria-label="close">&times;</button><img alt="">';
    lightboxImg = lightboxEl.querySelector("img");
    document.body.appendChild(lightboxEl);
    lightboxEl.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lightboxEl.addEventListener("click", function (e) { if (e.target === lightboxEl) closeLightbox(); });
    addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
  }
  function openLightbox(src) { lightboxImg.src = src; lightboxEl.classList.add("is-open"); }
  function closeLightbox() { lightboxEl.classList.remove("is-open"); lightboxImg.src = ""; }

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
        '<div class="tape-media"><div class="media-frame"></div></div>' +
        '<div class="tape-info">' +
          '<div class="info-year"></div>' +
          '<div class="info-type"></div>' +
          '<h3 class="info-title"></h3>' +
          '<div class="info-role"></div>' +
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
      desc: el.querySelector(".info-desc"),
      nature: el.querySelector(".info-nature"),
      links: el.querySelector(".tape-links"),
      stills: el.querySelector(".tape-stills")
    };

    var rec = { project: project, el: el, refs: refs, mediaIndex: 0, video: null };

    /* 悬停预览图 = 封面 */
    refs.previewImg.src = project.cover;

    /* 缩略图（前4个媒体） */
    (project.media || []).slice(0, 4).forEach(function (m, i) {
      var b = document.createElement("button");
      b.innerHTML = '<img src="' + (m.prev || m.src) + '" alt="">';
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        rec.mediaIndex = indexOfMedia(project, m);
        showMedia(rec);
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
    el.querySelector(".tape-face").addEventListener("click", function (e) { e.stopPropagation(); });

    rec.paint = function () {
      refs.spine.textContent = APP.L(project.title);
      refs.title.textContent = APP.L(project.title);
      refs.role.textContent = APP.L(project.role);
      refs.desc.textContent = APP.L(project.desc);
      refs.type.textContent = (project.types || []).map(APP.catLabel).join(" / ");
      refs.year.textContent = yearText(project);
      refs.links.querySelectorAll("a").forEach(function (a, i) {
        var l = (project.links || [])[i];
        a.textContent = l && l.label ? APP.L(l.label) : a.textContent;
      });
      el.setAttribute("data-cursor-label", APP.lang === "zh" ? "展开" : "OPEN");
      showMedia(rec, true);
    };

    return rec;
  }

  function indexOfMedia(project, m) {
    return (project.media || []).indexOf(m);
  }

  function yearText(p) {
    var parts = [];
    if (p.year != null) parts.push(String(p.year));
    else parts.push(APP.t("yearTBC"));
    if (p.themeYears) parts.push(APP.L(p.themeYears));
    if (p.status === "ongoing") parts.push(APP.t("ongoing"));
    return parts.join(" · ");
  }

  /* ---------------- 媒体展示（图/视频 + 控制） ---------------- */
  function showMedia(rec, keepVideoState) {
    var m = (rec.project.media || [])[rec.mediaIndex];
    var frame = rec.refs.frame;
    frame.innerHTML = "";
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
      v.addEventListener("play", function () { playBtn.classList.add("is-playing"); });
      v.addEventListener("pause", function () { playBtn.classList.remove("is-playing"); });
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
      frame.appendChild(img);
      if (m.zoom) {
        var z = document.createElement("button");
        z.className = "zoom-btn"; z.innerHTML = "&#x26B2;";
        z.setAttribute("aria-label", APP.t("zoom"));
        z.addEventListener("click", function (e) { e.stopPropagation(); openLightbox(m.src); });
        frame.appendChild(z);
      }
    }

    rec.refs.nature.textContent = (APP.t("natureLabel") + "：" + APP.L(m.nature));
    rec.refs.stills.querySelectorAll("button").forEach(function (b, i) {
      b.classList.toggle("is-active", i === rec.mediaIndex);
    });
  }

  /* ---------------- 展开 / 收起 ---------------- */
  function openTape(rec) {
    tapes.forEach(function (t) { t.el.classList.remove("is-open"); });
    rec.el.classList.add("is-open");
    rowEl.classList.add("has-open");
    state.openId = rec.project.id;
    saveState();
    history.replaceState(null, "", "#" + rec.project.id);
  }
  function closeTape(rec) {
    rec.el.classList.remove("is-open");
    rowEl.classList.remove("has-open");
    if (rec.video) rec.video.pause();
    state.openId = null;
    saveState();
    history.replaceState(null, "", location.pathname + location.search);
  }

  /* ---------------- 行渲染 ---------------- */
  function renderRow() {
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

    if (state.openId) {
      var target = tapes.filter(function (t) { return t.project.id === state.openId; })[0];
      if (target) openTape(target);
    }
  }

  /* ---------------- 页面接入 ---------------- */
  window.PAGE = {
    id: "work",
    init: function () {
      readState();
      var h = document.querySelector("#page .container");
      var head = document.createElement("div");
      head.className = "section-label";
      head.style.marginBottom = "18px";
      h.appendChild(head);
      buildFilter();
      buildLightbox();
      renderRow();
      APP.onLang(function () {
        head.textContent = APP.t("workTitle");
        tapes.forEach(function (t) { t.paint(); });
      });
      head.textContent = APP.t("workTitle");
    },
    renderLang: function () {}
  };
})();
