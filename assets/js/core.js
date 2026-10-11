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
    var cfg = window.DECORATIONS.cursors;
    if (!cfg) return;
    Object.keys(cfg).forEach(function (key) {
      var c = cfg[key];
      // Custom-property URLs resolve at the consuming stylesheet, not this inline style.
      var src = new URL(c.src, document.baseURI).href;
      document.body.style.setProperty("--cursor-" + key,
        'url("' + src + '") ' + c.hotspot.join(" ") + ", " + c.fallback);
    });
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    var glyph = document.createElement("span");
    glyph.className = "cursor-glyph"; glyph.hidden = true;
    glyph.setAttribute("aria-hidden", "true");
    document.body.appendChild(glyph);
    var x = 0, y = 0, enabled = false;

    function paintCursor(target) {
      var hint = enabled && target && !target.closest(".lightbox") && target.closest("[data-cursor]");
      var labelled = hint && (hint.dataset.cursor === "tape" || hint.dataset.cursor === "zoom");
      glyph.textContent = labelled ? (hint.getAttribute("data-cursor-label") || "") : "";
      glyph.hidden = !glyph.textContent;
      glyph.style.left = Math.min(x + 24, innerWidth - glyph.offsetWidth - 8) + "px";
      glyph.style.top = Math.min(y + 22, innerHeight - glyph.offsetHeight - 8) + "px";
    }
    APP.refreshCursor = function () { paintCursor(document.elementFromPoint(x, y)); };
    function syncCursor() {
      enabled = fine.matches && !reduced.matches;
      document.body.classList.toggle("has-cursor", enabled);
      APP.refreshCursor();
    }
    syncCursor();
    fine.addEventListener("change", syncCursor); reduced.addEventListener("change", syncCursor);
    document.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY; paintCursor(e.target);
    }, { passive: true });
    document.addEventListener("mouseover", function (e) { paintCursor(e.target); });
    document.documentElement.addEventListener("mouseleave", function () { glyph.hidden = true; });
    addEventListener("blur", function () { glyph.hidden = true; });
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
      return '<div class="menu-sticker' + (s.compact === false ? ' sticker-desktop' : '') + '" data-sticker-id="' + s.id + '" data-rot="' + (s.rotate || 0) + '" style="' + pos + ';width:' + s.width + '">' +
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
      if (window.PAGE && window.PAGE.destroy) window.PAGE.destroy();
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

  /* ---------------- 单一 BGM：手动开启、跨页续播、有声视频优先 ---------------- */
  function buildBgm() {
    var cfg = window.SITE.bgm;
    if (!cfg || !cfg.src) return;
    var key = 'zn_bgm_lobby_v1', saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(key)); } catch (e) {}
    var wanted = !!(saved && saved.on), seeking = saved && Number(saved.time) || 0;
    var audio = document.createElement('audio');
    audio.id = 'bgm-audio'; audio.src = cfg.src; audio.loop = true; audio.preload = 'none';
    audio.hidden = true; audio.volume = 0; document.body.appendChild(audio);
    var targetVolume = Math.max(0, Math.min(1, Number(cfg.volume) || .15));
    var fade = 0, request = 0, leaving = false, loading = false, unavailable = false, blocked = false;
    var pending = false, lastSave = 0;
    var tools = document.createElement('div'); tools.className = 'bgm-tools';
    tools.innerHTML = '<button class="bgm-btn" type="button"><span class="bgm-icon" aria-hidden="true"></span><span class="bgm-label"></span><span class="bgm-status" aria-live="polite"></span></button>' +
      '<details class="bgm-credit"><summary>ⓘ</summary><div><a class="music-source" target="_blank" rel="noopener"></a><br><a class="music-license" target="_blank" rel="noopener"></a></div></details>';
    document.body.appendChild(tools);
    var btn = tools.querySelector('button'), status = tools.querySelector('.bgm-status');
    var source = tools.querySelector('.music-source'), license = tools.querySelector('.music-license');
    source.textContent = cfg.credit; source.href = cfg.source;
    license.textContent = 'Licensed under Creative Commons: By Attribution 4.0 License'; license.href = cfg.licenseUrl;
    function audibleVideo() {
      return Array.from(document.querySelectorAll('video')).some(function (v) {
        return !v.paused && !v.ended && !v.muted && v.volume > 0;
      });
    }
    function persist() {
      try { sessionStorage.setItem(key, JSON.stringify({on:wanted, time:audio.readyState ? audio.currentTime : seeking})); } catch (e) {}
    }
    function cancelFade() { cancelAnimationFrame(fade); fade = 0; }
    function fadeTo(volume, done) {
      cancelFade();
      var from = audio.volume, start = performance.now();
      function tick(now) {
        // The first frame's timestamp can precede performance.now() by a fraction.
        var p = Math.max(0, Math.min(1, (now-start)/350));
        audio.volume = from + (volume-from)*p;
        if (p < 1) fade = requestAnimationFrame(tick);
        else { fade = 0; if (done) done(); }
      }
      fade = requestAnimationFrame(tick);
    }
    function stopNow() {
      request++; pending = loading = false; cancelFade(); audio.pause(); audio.volume = 0;
    }
    function paint() {
      var playing = !audio.paused && !audio.ended && !loading;
      var state = unavailable ? 'bgmMissing' : wanted && audibleVideo() ? 'bgmVideo' : blocked ? 'bgmResume' : loading ? 'bgmLoading' : playing ? 'bgmPlaying' : 'bgmOff';
      btn.querySelector('.bgm-label').textContent = APP.t('bgmPrompt');
      status.textContent = APP.t(state); btn.dataset.state = state;
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', APP.t(wanted && !blocked ? 'bgmPause' : 'bgmPlay') + ' · Lobby Time · ' + APP.t(state));
      btn.setAttribute('data-cursor', playing ? 'link' : 'play');
      btn.title = APP.t(state);
      tools.querySelector('summary').setAttribute('aria-label', APP.t('bgmCredit'));
    }
    function fail(error) {
      if (leaving || !wanted) return;
      loading = pending = false;
      if (error && error.name === 'NotAllowedError') blocked = true;
      else { unavailable = true; wanted = false; }
      persist(); paint();
    }
    function start() {
      if (!wanted || leaving || audibleVideo() || pending) { paint(); return; }
      if (!audio.paused) { fadeTo(targetVolume); paint(); return; }
      if (audio.error) audio.load();
      unavailable = blocked = false; loading = pending = true; audio.volume = 0;
      var token = ++request; paint();
      audio.play().then(function () {
        if (token !== request || !wanted || leaving || audibleVideo()) { if (token === request) stopNow(); return; }
        pending = loading = false; blocked = false; fadeTo(targetVolume); persist(); paint();
      }).catch(function (e) { if (token === request) fail(e); });
    }
    btn.addEventListener('click', function () {
      if (wanted && !blocked) {
        wanted = false; request++; pending = loading = false; blocked = false; persist();
        fadeTo(0, function () { audio.pause(); paint(); }); paint();
      } else { wanted = true; persist(); start(); }
    });
    audio.addEventListener('loadedmetadata', function () {
      if (seeking && isFinite(audio.duration)) audio.currentTime = seeking % audio.duration;
      seeking = 0;
    });
    audio.addEventListener('error', function () { fail(audio.error); });
    audio.addEventListener('playing', function () {
      if (!wanted || leaving || audibleVideo()) stopNow();
      else { loading = false; paint(); }
    });
    audio.addEventListener('pause', paint);
    audio.addEventListener('timeupdate', function () { if (performance.now()-lastSave > 1000) { persist(); lastSave = performance.now(); } });
    function syncVideo() {
      if (audibleVideo()) { stopNow(); paint(); }
      else if (wanted) start();
      else paint();
    }
    ['play','playing','pause','ended','volumechange','emptied','error'].forEach(function (event) {
      document.addEventListener(event, function (e) { if (e.target.tagName === 'VIDEO') syncVideo(); }, true);
    });
    // Also catch closing/removing a video without a final media event.
    var videos = new Set(document.querySelectorAll('video'));
    var observer = new MutationObserver(function () {
      var next = new Set(document.querySelectorAll('video'));
      if (next.size !== videos.size || Array.from(next).some(function (v) { return !videos.has(v); })) { videos = next; syncVideo(); }
    });
    observer.observe(document.querySelector('#page'), {childList:true, subtree:true});
    window.addEventListener('pagehide', function () { persist(); leaving = true; stopNow(); observer.disconnect(); });
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      leaving = false; observer.observe(document.querySelector('#page'), {childList:true, subtree:true}); syncVideo();
    });
    APP.onLang(paint); paint();
    // Check the configured local file without autoplay or downloading a substitute.
    fetch(cfg.src, {method:'HEAD', cache:'no-store'}).then(function (r) {
      if (!r.ok && audio.paused && !pending) { unavailable = true; wanted = false; persist(); paint(); }
    }).catch(function () { /* A real play attempt reports network/decoding failures. */ });
    if (wanted) start(); // Prior explicit opt-in only; browsers may require a new click.
  }

  /* ---------------- 页脚 ---------------- */
  function buildFooter() {
    var page = document.querySelector("#page");
    if (!page) return;
    var f = document.createElement("footer");
    f.className = "footer container";
    f.innerHTML = '<span class="f-brand"></span><span class="f-thanks"></span>';
    (page.querySelector("[data-footer-slot]") || page).appendChild(f);
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
