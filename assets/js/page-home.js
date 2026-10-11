/* 首页：已确认滚动封面 → 三张精选录像带 → 关于我 → 共享联系方式。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
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

      var config = SITE.home;
      var featured = el('<section class="home-section home-featured container" aria-labelledby="home-featured-title"><div class="home-section-head"><h2 id="home-featured-title" class="section-label"></h2><a class="home-link home-all-work" href="work.html" data-nav></a></div><div class="vhs-row home-featured-row"></div></section>');
      var row = featured.querySelector('.home-featured-row');
      config.featuredIds.forEach(function (id, index) {
        var p = PROJECTS.find(function (p) { return p.id === id; });
        if (!p) return;
        var item = el('<div class="home-feature-item"></div>');
        item.style.setProperty('--enter-delay', (index*90)+'ms');
        var tape = el('<a class="tape home-tape" data-nav><div class="tape-spine" aria-hidden="true"><span class="spine-title"></span></div><div class="home-tape-face"><div class="home-tape-cover"><img alt=""></div><div class="home-tape-label"><h3 class="home-tape-title"></h3><p class="home-tape-category"></p></div></div></a>');
        tape.href = 'work.html#'+p.id; tape.dataset.status = p.status || 'normal';
        tape.querySelector('img').src = p.cover;
        tape.querySelector('img').loading = 'lazy';
        tape.style.setProperty('--tape-angle', [-3,2,-1.5][index]+'deg');
        painters.push(function () {
          var title = APP.L(p.title);
          var categories = (p.types || []).map(function (id) {
            return CATEGORIES.find(function (c) { return c.id === id; });
          }).filter(Boolean).map(APP.L).join(' · ');
          tape.querySelector('.home-tape-title').textContent = title;
          tape.querySelector('.spine-title').textContent = title;
          tape.querySelector('.home-tape-category').textContent = categories;
          tape.setAttribute('aria-label', title + ' — ' + categories);
        });
        item.appendChild(tape); row.appendChild(item);
      });
      painters.push(function () {
        featured.querySelector('h2').textContent = APP.L(config.featuredTitle);
        featured.querySelector('.home-all-work').textContent = APP.L(config.allWork);
      });
      page.appendChild(featured);

      var about = el('<section class="home-section home-about container" aria-labelledby="home-about-title"><div class="home-about-copy"><h2 id="home-about-title" class="display"></h2><p class="home-about-description"></p><a class="home-link" href="about.html" data-nav></a></div></section>');
      var bird = DECORATIONS.about.find(function (entry) { return entry.id === 'a-budgie'; });
      if (bird) {
        var sticker = el('<img class="home-about-bird" alt="" aria-hidden="true" draggable="false" loading="lazy">');
        sticker.src = bird.src; about.appendChild(sticker);
      }
      painters.push(function () {
        var h = about.querySelector('h2'); h.textContent = APP.L(config.aboutTitle);
        if (APP.lang === 'zh') {
          h.textContent = h.textContent.slice(0,-1);
          var accent = el('<span class="hero-accent"></span>'); accent.textContent = '嘛'; h.appendChild(accent);
        }
        about.querySelector('p').textContent = APP.L(config.aboutDescription);
        about.querySelector('a').textContent = APP.L(config.aboutLink);
      });
      page.appendChild(about);

      var contact = el('<section class="home-section home-contact" data-footer-slot aria-labelledby="home-contact-title"><div class="home-contact-inner container"><h2 id="home-contact-title" class="home-contact-title display"></h2><p class="home-contact-intro"></p></div></section>');
      var contacts = CONTACT.buildList(painters);
      contact.querySelector('.home-contact-inner').appendChild(contacts.node);
      painters.push(function () {
        contact.querySelector('h2').textContent = APP.L(config.contactTitle);
        contact.querySelector('.home-contact-intro').textContent = APP.L(config.contactDescription);
      });
      page.appendChild(contact);
      var stopRain = CONTACT.initRain(contact);

      /* Entrance runs once; hover belongs to the inner tape so transforms never compete. */
      var reduced = matchMedia('(prefers-reduced-motion: reduce)'), observer;
      function showCards() {
        row.querySelectorAll('.home-feature-item').forEach(function (item) { item.classList.add('is-visible'); });
        if (observer) observer.disconnect();
      }
      if (!reduced.matches && window.IntersectionObserver) {
        row.classList.add('will-reveal');
        observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
          });
        }, {threshold:.12});
        row.querySelectorAll('.home-feature-item').forEach(function (item) { observer.observe(item); });
      } else showCards();
      reduced.addEventListener('change', function () { if (reduced.matches) showCards(); });
      window.PAGE.destroy = function () { stopHero(); stopRain(); if (observer) observer.disconnect(); };
      window.addEventListener('pagehide', window.PAGE.destroy);
      window.addEventListener('pageshow', function (event) {
        if (event.persisted) { stopRain = CONTACT.initRain(contact); showCards(); }
      });
      function paintAll() {
        page.classList.toggle('home-english', APP.lang === 'en');
        painters.forEach(function (f) { f(); });
      }
      paintAll(); APP.onLang(paintAll);
    },
    renderLang: function () {},
    destroy: function () { stopHero(); }
  };
})();
