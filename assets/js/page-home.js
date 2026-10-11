/* 首页：sticky 滚动展开视频/占位 + 专长下拉 + 精选录像带行 + 跑马灯 + 合作下拉。 */
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
    var stage = el('<div class="hero-stage"><div class="hero-media"><div class="hero-reveal"></div><div class="hero-seam" aria-hidden="true"></div><div class="hero-controls"><button class="hero-play" type="button"></button><button class="hero-sound" type="button" aria-pressed="false"></button></div><p class="hero-error" role="status"></p></div><h1 class="hero-heading display"><span class="hero-line hero-top"></span><span class="hero-line hero-bottom"></span></h1><p class="hero-hint"></p></div>');
    hero.appendChild(stage);
    var media = stage.querySelector('.hero-media'), reveal = stage.querySelector('.hero-reveal');
    var top = stage.querySelector('.hero-top'), bottom = stage.querySelector('.hero-bottom');
    var hint = stage.querySelector('.hero-hint'), controls = stage.querySelector('.hero-controls');
    var play = controls.querySelector('.hero-play'), sound = controls.querySelector('.hero-sound');
    var error = stage.querySelector('.hero-error'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
    var v = el('<video muted playsinline preload="auto"></video>');
    v.defaultMuted = true; v.muted = true; v.playsInline = true; v.loop = false;
    if (SITE.hero.poster) {
      v.poster = SITE.hero.poster;
      var poster = el('<img class="hero-poster" alt="">');
      poster.src = v.poster; reveal.appendChild(poster);
    }
    reveal.appendChild(v);
    var hasPlayed = false, attempted = false, visible = false, resume = false, userPaused = false;
    var frame = 0, active = true, travel = 0, distance = 0;
    hero.classList.add('show-poster');
    function paintVideo() {
      play.textContent = APP.t(v.ended ? 'heroReplay' : v.paused ? 'play' : 'pause');
      play.setAttribute('aria-label', play.textContent);
      play.setAttribute('data-cursor', v.paused || v.ended ? 'play' : 'link');
      sound.textContent = APP.t(v.muted ? 'heroSoundOff' : 'heroSoundOn');
      sound.setAttribute('aria-label', APP.t(v.muted ? 'heroEnableSound' : 'heroDisableSound'));
      sound.setAttribute('aria-pressed', String(!v.muted));
      v.setAttribute('aria-label', APP.L(SITE.brand));
      error.textContent = v.error ? APP.t('heroLoadError') : '';
      hero.classList.toggle('show-poster', !hasPlayed);
    }
    function tryPlay() {
      resume = true;
      var promise = v.play();
      if (promise) promise.then(function () {
        // A pending play promise must not start sound after the window closes.
        if (!visible || !active || userPaused) v.pause();
      }).catch(function () { resume = false; paintVideo(); });
    }
    function visibility(next) {
      if (next === visible) return;
      visible = next;
      if (!next) {
        resume = !v.ended && !userPaused && (!v.paused || resume);
        v.pause();
      } else if (!reduced.matches && !userPaused && !v.ended) {
        if (!attempted) { attempted = true; tryPlay(); }
        else if (resume) tryPlay();
      }
    }
    play.addEventListener('click', function () {
      if (!visible) return;
      attempted = true;
      if (v.paused) {
        if (v.error) { hasPlayed = false; v.load(); }
        if (v.ended) v.currentTime = 0;
        userPaused = false; tryPlay();
      } else { userPaused = true; resume = false; v.pause(); }
    });
    sound.addEventListener('click', function () { v.muted = !v.muted; paintVideo(); });
    v.addEventListener('playing', function () { hasPlayed = true; paintVideo(); });
    v.addEventListener('ended', function () { resume = false; paintVideo(); });
    ['pause', 'volumechange', 'error'].forEach(function (name) { v.addEventListener(name, paintVideo); });
    function update() {
      frame = 0;
      if (!active) return;
      var r = hero.getBoundingClientRect(), mr = media.getBoundingClientRect();
      var p = reduced.matches ? 1 : Math.max(0, Math.min(1, -r.top / distance));
      // No tween or wheel handler: the actual scroll position is the sole progress source.
      hero.dataset.progress = p.toFixed(4);
      reveal.style.clipPath = 'inset(' + ((1-p)*50) + '% 0)';
      top.style.transform = 'translate(-50%, -100%) translateY(' + (-p*travel) + 'px)';
      bottom.style.transform = 'translateX(-50%) translateY(' + (p*travel) + 'px)';
      var alpha = reduced.matches ? 1 : Math.max(0, Math.min(1, (1-p)/.23));
      top.style.opacity = bottom.style.opacity = alpha;
      hint.style.opacity = reduced.matches ? 1 : Math.max(0, 1-p*5);
      stage.querySelector('.hero-seam').style.opacity = Math.max(0, 1-p*10);
      // Keep the small controls below the moving lower line on narrow screens.
      // They are siblings of the mask, so even a narrow slit cannot crop a button.
      var baseTop = media.clientHeight + 14;
      var belowTitle = bottom.getBoundingClientRect().bottom - mr.top + 14;
      var controlTop = baseTop + Math.max(0, belowTitle-baseTop)*alpha;
      controls.style.top = Math.min(controlTop, innerHeight-mr.top-45)+'px';
      controls.hidden = p <= .015;
      error.hidden = controls.hidden;
      visibility(p > .015 && mr.bottom > 90 && mr.top < innerHeight-40 && !document.hidden);
    }
    function schedule() { if (active && !frame) frame = requestAnimationFrame(update); }
    function measure() {
      hero.classList.toggle('is-reduced', reduced.matches);
      // Stable viewport height avoids resizing the cover when mobile browser chrome moves.
      var h = stage.clientHeight || innerHeight;
      var ratio = v.videoWidth && v.videoHeight ? v.videoWidth/v.videoHeight : 3842/2160;
      var w = Math.min(innerWidth * (innerWidth < 700 ? .9 : .84), Math.max(140,h-210)*ratio);
      media.style.width = w+'px'; media.style.height = w/ratio+'px';
      travel = w/ratio/2 + 14;
      distance = Math.max(1, h*.95);
      hero.style.setProperty('--hero-distance', distance+'px');
      schedule();
    }
    function paint() {
      top.textContent = APP.L(SITE.hero.titleTop);
      bottom.textContent = APP.L(SITE.hero.titleBottom);
      if (document.documentElement.lang.indexOf('zh') === 0) {
        bottom.textContent = bottom.textContent.slice(0,-1);
        var accent = el('<span class="hero-accent"></span>');
        accent.textContent = APP.L(SITE.hero.titleBottom).slice(-1); bottom.appendChild(accent);
      }
      hero.classList.toggle('hero-english', document.documentElement.lang.indexOf('en') === 0);
      hint.textContent = APP.L(SITE.hero.scrollHint);
      paintVideo(); measure();
    }
    function suspend() { active = false; visibility(false); cancelAnimationFrame(frame); frame = 0; }
    function awaken() { active = true; measure(); }
    stopHero = suspend;
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', measure);
    window.addEventListener('pagehide', suspend);
    window.addEventListener('pageshow', awaken);
    document.addEventListener('visibilitychange', schedule);
    reduced.addEventListener('change', function () {
      if (reduced.matches) { userPaused = true; resume = false; v.pause(); }
      measure();
    });
    v.addEventListener('loadedmetadata', measure);
    painters.push(paint);
    v.src = SITE.hero.video;
    paint(); // Preload only. Playback begins when the slit becomes visible.
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
