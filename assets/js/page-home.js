/* 首页：hero 视频/占位 + 专长下拉 + 精选录像带行 + 跑马灯 + 合作下拉。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function dropItem(headText, bodyNodes) {
    var item = el('<div class="drop-item"><button class="drop-head"><span class="drop-label"></span><span class="drop-sign">+</span></button><div class="drop-body"><div class="drop-body-inner"></div></div></div>');
    item.querySelector(".drop-label").textContent = headText;
    var body = item.querySelector(".drop-body");
    var inner = item.querySelector(".drop-body-inner");
    bodyNodes.forEach(function (n) { inner.appendChild(n); });
    item.querySelector(".drop-head").addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      body.style.height = open ? (inner.scrollHeight + "px") : "0px";
    });
    /* 展开高度是写死的 px，内容变长（切英文）或视口变窄时必须重算，否则会截断 */
    item._sync = function () {
      if (item.classList.contains("is-open")) body.style.height = inner.scrollHeight + "px";
    };
    item._paint = function (txt) { item.querySelector(".drop-label").textContent = txt; };
    return item;
  }

  var stopHero = function () {};
  function buildHeroVideo(hero, painters) {
    var v = el('<video muted playsinline preload="auto"></video>');
    v.defaultMuted = true; v.muted = true; v.playsInline = true; v.loop = false;
    v.setAttribute("aria-label", APP.L(window.SITE.brand));
    if (window.SITE.hero.poster) {
      v.poster = window.SITE.hero.poster;
      var poster = el('<img class="hero-poster" alt="">');
      poster.src = v.poster; hero.appendChild(poster);
    }
    var hasPlayed = false;
    hero.classList.add("has-video", "show-poster");
    hero.appendChild(v);
    var controls = el('<div class="hero-controls"><button class="hero-play" type="button"></button><button class="hero-sound" type="button" aria-pressed="false"></button></div>');
    var play = controls.querySelector(".hero-play"), sound = controls.querySelector(".hero-sound");
    hero.appendChild(controls);
    function paintVideo() {
      play.textContent = APP.t(v.ended ? "heroReplay" : v.paused ? "play" : "pause");
      play.setAttribute("aria-label", play.textContent);
      play.setAttribute("data-cursor", v.paused || v.ended ? "play" : "link");
      sound.textContent = APP.t(v.muted ? "heroSoundOff" : "heroSoundOn");
      sound.setAttribute("aria-label", APP.t(v.muted ? "heroEnableSound" : "heroDisableSound"));
      sound.setAttribute("aria-pressed", String(!v.muted));
      v.setAttribute("aria-label", APP.L(window.SITE.brand));
      hero.classList.toggle("show-poster", !hasPlayed);
    }
    function tryPlay() {
      // Muted playback may still be denied (e.g. power saving); retain poster + explicit play.
      var promise = v.play();
      if (promise) promise.catch(function () { paintVideo(); });
    }
    play.addEventListener("click", function () {
      if (v.error) { hasPlayed = false; v.load(); }
      if (v.ended) v.currentTime = 0;
      if (v.paused) tryPlay(); else v.pause();
    });
    sound.addEventListener("click", function () {
      v.muted = !v.muted;
      if (!v.muted && v.paused && !v.ended) tryPlay();
      paintVideo();
    });
    v.addEventListener("playing", function () { hasPlayed = true; paintVideo(); });
    ["pause", "ended", "volumechange", "error"].forEach(function (name) { v.addEventListener(name, paintVideo); });
    stopHero = function () { v.pause(); };
    window.addEventListener("pagehide", stopHero);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stopHero(); });
    painters.push(paintVideo);
    v.src = window.SITE.hero.video;
    paintVideo();
    tryPlay(); // One automatic attempt, never a retry loop or repeat after ended.
  }

  window.PAGE = {
    id: "home",
    init: function () {
      var page = document.querySelector("#page");
      var painters = [];

      /* ---- hero ---- */
      var hero = el('<section class="hero"></section>');
      if (window.SITE.hero && window.SITE.hero.video) {
        buildHeroVideo(hero, painters);
      } else {
        hero.appendChild(el('<div class="hero-placeholder"><span></span></div>'));
        painters.push(function () {
          hero.querySelector(".hero-placeholder span").textContent = APP.t("heroPlaceholder");
        });
      }
      var ht = el('<h1 class="hero-title display"></h1>');
      hero.appendChild(ht);
      painters.push(function () { ht.textContent = APP.L(window.SITE.brand); });
      page.appendChild(hero);

      var wrap = el('<div class="container"></div>');
      page.appendChild(wrap);

      /* ---- 专长下拉 ---- */
      var sec1 = el('<section class="home-section"></section>');
      var lab1 = el('<div class="section-label" style="margin-bottom:16px"></div>');
      sec1.appendChild(lab1);
      var list1 = el('<div class="drop-list"></div>');
      (window.CATEGORIES || []).filter(function (c) { return c.enabled; }).forEach(function (c) {
        var titles = window.PROJECT_DATA.sorted().filter(function (p) {
          return (p.types || []).indexOf(c.id) >= 0;
        }).map(function (p) { return el("<span></span>"); });
        var item = dropItem("", titles);
        item._cat = c;
        item._paintTitles = function () {
          var inner = item.querySelector(".drop-body-inner");
          inner.innerHTML = "";
          window.PROJECT_DATA.sorted().filter(function (p) { return (p.types || []).indexOf(c.id) >= 0; })
            .forEach(function (p) {
              var s = el("<span></span>");
              s.textContent = APP.L(p.title);
              inner.appendChild(s);
            });
        };
        painters.push(function () { item._paint(APP.L(c)); item._paintTitles(); });
        list1.appendChild(item);
      });
      sec1.appendChild(list1);
      painters.push(function () { lab1.textContent = APP.t("expertises"); });
      wrap.appendChild(sec1);

      /* ---- 精选/在制 录像带行 ---- */
      var sec2 = el('<section class="home-section"></section>');
      var lab2 = el('<div class="section-label" style="margin-bottom:16px"></div>');
      sec2.appendChild(lab2);
      var row = el('<div class="vhs-row"></div>');
      window.PROJECT_DATA.sorted().filter(function (p) { return p.featured || p.status === "ongoing"; })
        .forEach(function (p) {
          var t = el('<a class="tape" data-status="' + (p.status || "normal") + '"></a>');
          t.href = "work.html#" + p.id;
          t.setAttribute("data-nav", "");
          t.innerHTML = '<div class="tape-preview"><img src="' + p.cover + '" alt=""></div>' +
                        '<div class="tape-spine"><span class="spine-title"></span></div>';
          t._paint = function () { t.querySelector(".spine-title").textContent = APP.L(p.title); };
          painters.push(t._paint);
          row.appendChild(t);
        });
      sec2.appendChild(row);
      painters.push(function () { lab2.textContent = APP.t("featured"); });
      wrap.appendChild(sec2);

      /* ---- 跑马灯 ---- */
      var mq = el('<div class="marquee"><div class="marquee-track"></div></div>');
      var track = mq.querySelector(".marquee-track");
      for (var i = 0; i < 8; i++) track.appendChild(el("<span></span>"));
      painters.push(function () {
        track.querySelectorAll("span").forEach(function (s, idx) {
          s.textContent = (idx % 2 === 0) ? APP.L(window.SITE.copy.tagline) : APP.L(window.SITE.copy.directions);
        });
      });
      page.appendChild(mq);
      if (window.gsap) {
        gsap.to(track, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
      }

      /* ---- 合作下拉 ---- */
      var sec3 = el('<section class="home-section container"></section>');
      var lab3 = el('<div class="section-label" style="margin-bottom:16px"></div>');
      sec3.appendChild(lab3);
      var list3 = el('<div class="drop-list"></div>');
      var cItem = dropItem("", []);
      cItem._paintClients = function () {
        var inner = cItem.querySelector(".drop-body-inner");
        inner.innerHTML = "";
        (window.SITE.clients || []).forEach(function (c) {
          var s = el("<span></span>");
          s.textContent = APP.L(c);
          inner.appendChild(s);
        });
      };
      painters.push(function () { cItem._paint(APP.t("clients")); cItem._paintClients(); });
      list3.appendChild(cItem);
      sec3.appendChild(list3);
      painters.push(function () { lab3.textContent = APP.t("clients"); });
      page.appendChild(sec3);

      function syncDrops() {
        document.querySelectorAll(".drop-item").forEach(function (it) { it._sync(); });
      }
      function paintAll() { painters.forEach(function (f) { f(); }); syncDrops(); }
      paintAll();
      APP.onLang(paintAll);
      addEventListener("resize", syncDrops);
    },
    renderLang: function () {},
    destroy: function () { stopHero(); }
  };
})();
