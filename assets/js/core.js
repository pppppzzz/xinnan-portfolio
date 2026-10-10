/* 共享外壳：语言、顶栏、全屏菜单、自定义光标、页面转场、平滑滚动。
   页面脚本通过 window.PAGE = { id, init, renderLang } 接入。 */
(function () {
  "use strict";

  var LANG_KEY = "zn_lang";

  var APP = window.APP = {};

  /* ---------------- 语言 ---------------- */
  function storedLang() {
    try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
  }
  APP.lang = (storedLang() === "en" || storedLang() === "zh") ? storedLang() : (window.SITE.defaultLang || "zh");

  APP.t = function (key) {
    var d = window.I18N[APP.lang] || {};
    return (key in d) ? d[key] : (window.I18N.zh[key] || key);
  };
  /* 双语内容对象 {zh,en} → 当前语言 */
  APP.L = function (obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[APP.lang] != null ? obj[APP.lang] : (obj.zh || "");
  };
  APP.catLabel = function (id) {
    var c = (window.CATEGORIES || []).filter(function (x) { return x.id === id; })[0];
    return c ? APP.L(c) : id;
  };

  var langListeners = [];
  APP.onLang = function (fn) { langListeners.push(fn); };

  APP.setLang = function (lang) {
    if (lang === APP.lang) return;
    APP.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.documentElement.lang = (lang === "zh") ? "zh-CN" : "en";
    applyStaticI18n();
    langListeners.forEach(function (fn) { fn(lang); });
  };

  /* 静态 [data-i18n] 文本 */
  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = APP.t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", APP.t(el.getAttribute("data-i18n-aria")));
    });
  }

  /* ---------------- 自定义光标 ---------------- */
  function buildCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    var glyph = document.createElement("span"); glyph.className = "cursor-glyph";
    ring.appendChild(glyph);
    document.body.appendChild(dot); document.body.appendChild(ring);

    var x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY;
      dot.style.transform = "translate(" + (x - 3) + "px," + (y - 3) + "px)"; }, { passive: true });

    (function loop() {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
      requestAnimationFrame(loop);
    })();

    function paintCursor(target) {
      var hint = target && target.closest("[data-cursor]");
      var labelled = hint && (hint.dataset.cursor === "tape" || hint.dataset.cursor === "zoom");
      var link = target && target.closest("a,button,[role='button'],[data-cursor='link']");
      document.body.classList.toggle("cursor-tape", !!labelled);
      document.body.classList.toggle("cursor-zoom", !!hint && hint.dataset.cursor === "zoom");
      document.body.classList.toggle("cursor-link", !labelled && !!link);
      glyph.textContent = labelled ? (hint.getAttribute("data-cursor-label") || "") : "";
    }
    APP.refreshCursor = function () { paintCursor(document.elementFromPoint(x, y)); };
    document.addEventListener("mouseover", function (e) { paintCursor(e.target); });
    APP.onLang(function () { requestAnimationFrame(APP.refreshCursor); });
  }

  /* ---------------- 顶栏 ---------------- */
  function buildTopbar() {
    var bar = document.createElement("header");
    bar.className = "topbar";
    bar.innerHTML =
      '<a class="brand" href="index.html" data-nav></a>' +
      '<div class="topbar-right">' +
        '<div class="lang-toggle" role="group" aria-label="language">' +
          '<button data-lang="zh">中文</button><span>/</span><button data-lang="en">EN</button>' +
        '</div>' +
        '<button class="menu-btn" aria-label="menu"><span></span><span></span></button>' +
      '</div>';
    document.body.appendChild(bar);

    function paint() {
      bar.querySelector(".brand").textContent = APP.L(window.SITE.brand);
      bar.querySelectorAll(".lang-toggle button").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-lang") === APP.lang);
      });
      var titleKey = { home: null, work: "workTitle", about: "aboutTitle", contact: "contactTitle" }[
        (window.PAGE && window.PAGE.id) || "home"];
      document.title = APP.L(window.SITE.brand) + (titleKey ? " · " + APP.t(titleKey) : "");
    }
    paint();
    APP.onLang(paint);

    bar.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.addEventListener("click", function () { APP.setLang(b.getAttribute("data-lang")); });
    });
    bar.querySelector(".menu-btn").addEventListener("click", function () { setMenu(true); });
  }

  /* ---------------- 全屏菜单 ---------------- */
  var menuEl = null, menuOpen = false;

  function buildMenu() {
    menuEl = document.createElement("div");
    menuEl.className = "menu";
    menuEl.setAttribute("aria-hidden", "true");

    var stripes = '<div class="menu-stripes"><i></i><i></i><i></i><i></i></div>';
    var nav = window.SITE.nav.map(function (n) {
      return '<a href="' + n.href + '" data-page="' + n.id + '" data-nav></a>';
    }).join("");
    var stickers = (window.DECORATIONS.menu || []).map(function (s) {
      var pos = Object.keys(s.pos).map(function (k) { return k + ":" + s.pos[k]; }).join(";");
      return '<div class="menu-sticker" data-rot="' + (s.rotate || 0) + '" style="' + pos + ';width:' + s.width + '">' +
             '<img src="' + s.src + '" alt=""></div>';
    }).join("");

    menuEl.innerHTML =
      '<div class="menu-panel">' + stripes +
        '<button class="menu-close" aria-label="close"></button>' +
        '<nav class="menu-nav">' + nav + '</nav>' +
        '<div class="menu-meta"></div>' +
        stickers +
      '</div>';
    document.body.appendChild(menuEl);

    menuEl.querySelector(".menu-close").addEventListener("click", function () { setMenu(false); });
    addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen) setMenu(false); });

    /* hover 时其余项变暗 */
    var links = menuEl.querySelectorAll(".menu-nav a");
    links.forEach(function (a) {
      a.addEventListener("mouseenter", function () {
        links.forEach(function (o) { o.classList.toggle("is-dim", o !== a); });
      });
    });
    menuEl.querySelector(".menu-nav").addEventListener("mouseleave", function () {
      links.forEach(function (o) { o.classList.remove("is-dim"); });
    });

    function paint() {
      var cur = (window.PAGE && window.PAGE.id) || "";
      links.forEach(function (a) {
        var item = window.SITE.nav.filter(function (n) { return n.id === a.getAttribute("data-page"); })[0];
        a.textContent = APP.L(item);
        a.classList.toggle("is-current", a.getAttribute("data-page") === cur);
      });
      menuEl.querySelector(".menu-meta").textContent = APP.L(window.SITE.copy.directions);
    }
    paint();
    APP.onLang(paint);
  }

  function setMenu(open) {
    if (!menuEl || open === menuOpen) return;
    menuOpen = open;
    menuEl.classList.toggle("is-open", open);
    menuEl.setAttribute("aria-hidden", open ? "false" : "true");
    var panel = menuEl.querySelector(".menu-panel");
    var stickers = menuEl.querySelectorAll(".menu-sticker");
    if (window.gsap) {
      if (open) {
        gsap.fromTo(panel, { yPercent: 102 }, { yPercent: 0, duration: .7, ease: "power3.inOut" });
        gsap.fromTo(stickers,
          { scale: 0, rotate: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: .55, ease: "back.out(2.2)", stagger: .06, delay: .35,
            rotate: function (i, el) { return parseFloat(el.getAttribute("data-rot")) || 0; } });
      } else {
        gsap.to(panel, { yPercent: 102, duration: .55, ease: "power3.inOut" });
        gsap.to(stickers, { scale: 0, opacity: 0, duration: .3, ease: "power2.in" });
      }
    } else {
      panel.style.transform = open ? "translateY(0)" : "translateY(102%)";
      stickers.forEach(function (s) { s.style.opacity = open ? 1 : 0; s.style.transform = open ? "scale(1)" : "scale(0)"; });
    }
  }
  APP.setMenu = setMenu;

  /* ---------------- 页面转场幕布 ---------------- */
  var curtain = null;
  function buildCurtain() {
    curtain = document.createElement("div");
    curtain.className = "transition-curtain";
    curtain.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
    document.body.appendChild(curtain);
  }
  function curtainIn(done) {
    var bars = curtain.children;
    if (!window.gsap) { done(); return; }
    gsap.set(bars, { scaleY: 0, transformOrigin: "bottom" });
    gsap.to(bars, { scaleY: 1, duration: .45, ease: "power3.inOut", stagger: .05, onComplete: done });
  }
  function curtainOut() {
    var bars = curtain.children;
    if (!window.gsap) return;
    gsap.set(bars, { scaleY: 1, transformOrigin: "top" });
    gsap.to(bars, { scaleY: 0, duration: .5, ease: "power3.inOut", stagger: .06, delay: .1 });
  }

  /* 拦截站内链接 */
  function interceptNav() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-nav]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      e.preventDefault();
      if (menuOpen) setMenu(false);
      curtainIn(function () { location.href = href; });
    });
  }

  /* ---------------- 平滑滚动 ---------------- */
  function initLenis() {
    if (!window.Lenis) return;
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    APP.lenis = lenis;
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { ScrollTrigger.update(); });
    }
  }

  /* ---------------- BGM 播放器（src 留空则不显示；默认不自动播放） ---------------- */
  function buildBgm() {
    var cfg = window.SITE.bgm;
    if (!cfg || !cfg.src) return;
    var audio = new Audio(cfg.src);
    audio.loop = true;
    audio.preload = "none";

    var btn = document.createElement("button");
    btn.className = "bgm-btn";
    btn.innerHTML = '<span class="bgm-icon">&#9835;</span><span class="bgm-label"></span>';
    document.body.appendChild(btn);

    function paint() {
      btn.querySelector(".bgm-label").textContent =
        (audio.paused ? APP.t("bgmPlay") : APP.t("bgmPause")) +
        (cfg.title && APP.L(cfg.title) ? " · " + APP.L(cfg.title) : "");
      btn.title = (cfg.credit && APP.L(cfg.credit)) ? APP.L(cfg.credit) : "";
    }
    paint();
    APP.onLang(paint);

    btn.addEventListener("click", function () {
      if (audio.paused) audio.play(); else audio.pause();
    });
    audio.addEventListener("play", paint);
    audio.addEventListener("pause", paint);
  }

  /* ---------------- 页脚 ---------------- */
  function buildFooter() {
    var page = document.querySelector("#page");
    if (!page) return;
    var f = document.createElement("footer");
    f.className = "footer container";
    f.innerHTML = '<span class="f-brand"></span><span class="f-thanks"></span>';
    page.appendChild(f);
    function paint() {
      f.querySelector(".f-brand").textContent = "© " + new Date().getFullYear() + " " + APP.L(window.SITE.brand);
      f.querySelector(".f-thanks").textContent = APP.L(window.SITE.copy.footer);
    }
    paint();
    APP.onLang(paint);
  }

  /* ---------------- 启动 ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.lang = (APP.lang === "zh") ? "zh-CN" : "en";
    buildCursor();
    buildCurtain();
    buildTopbar();
    buildMenu();
    interceptNav();
    initLenis();
    applyStaticI18n();
    if (window.PAGE && window.PAGE.init) window.PAGE.init();
    buildFooter();
    buildBgm();
    curtainOut();
  });
})();
