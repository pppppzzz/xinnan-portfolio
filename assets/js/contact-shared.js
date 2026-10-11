/* Shared real contact data, accurate clipboard feedback and scoped sticker rain. */
(function () {
  "use strict";
  var rains = new WeakMap();
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea'), focused = document.activeElement;
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.setAttribute('readonly', '');
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } finally {
        ta.remove(); if (focused && focused.focus) focused.focus({preventScroll:true});
      }
      if (!ok) throw new Error('Copy failed');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(fallback);
    }
    return Promise.resolve().then(fallback);
  }
  function buildContactList(painters) {
    var list = el('<div class="contact-list"></div>'), disposers = [];
    function row(icon, label, text, href, copyable) {
      var r = el('<div class="contact-row"><span class="c-icon" aria-hidden="true"></span><a><span class="c-value"></span></a><span class="copied-flag" role="status" aria-live="polite"></span></div>');
      r.querySelector('.c-icon').textContent = icon;
      var link = r.querySelector('a'), value = r.querySelector('.c-value'), flag = r.querySelector('.copied-flag');
      link.href = href; link.target = '_blank'; link.rel = 'noopener';
      var state = '', timer = 0, alive = true, copy;
      function paint() {
        value.textContent = APP.L(text);
        link.setAttribute('aria-label', APP.L(label) + ': ' + APP.L(text));
        if (copy) copy.setAttribute('aria-label', APP.t('copy') + ' ' + APP.L(label));
        flag.textContent = state ? APP.t(state) : '';
        flag.classList.toggle('is-show', !!state);
        r.classList.toggle('is-copy-failed', state === 'copyFailed');
        value.classList.toggle('is-copied', state === 'copied');
      }
      function feedback(next) {
        if (!alive) return;
        state = next; clearTimeout(timer); paint();
        timer = setTimeout(function () { state = ''; paint(); }, next === 'copied' ? 1600 : 3200);
      }
      if (copyable) {
        copy = el('<button class="c-icon contact-copy" type="button">&#x2398;</button>');
        copy.addEventListener('click', function () {
          copyText(APP.L(text)).then(function () { feedback('copied'); }, function () { feedback('copyFailed'); });
        });
        r.appendChild(copy);
      }
      painters.push(paint); paint(); list.appendChild(r);
      disposers.push(function () { alive = false; clearTimeout(timer); });
    }
    var c = SITE.contact;
    if (c.email) row('✉', {zh:'邮箱',en:'Email'}, c.email, 'mailto:'+c.email, true);
    if (c.phone) row('✆', {zh:'电话',en:'Phone'}, c.phone, 'tel:'+c.phone, true);
    (c.socials || []).forEach(function (s) { if (s.url) row('↗', s.label, s.label, s.url, false); });
    return { node:list, destroy:function () { disposers.forEach(function (f) { f(); }); } };
  }

  // Both entry points use the original contact page composition and style classes.
  function mountContact(container, painters, options) {
    options = options || {};
    var wrap = el('<div class="contact-wrap container"></div>');
    var title = document.createElement(options.titleTag || 'h1');
    title.className = 'contact-title display';
    if (options.titleId) title.id = options.titleId;
    painters.push(function () { title.textContent = APP.t('contactTitle'); });
    wrap.appendChild(title);
    var spin = el('<div class="contact-spin"><img alt=""></div>');
    spin.querySelector('img').src = DECORATIONS.contact[0].src;
    wrap.appendChild(spin);
    var contacts = buildContactList(painters);
    wrap.appendChild(contacts.node);
    var mark = el('<div class="contact-wordmark display"></div>');
    painters.push(function () { mark.textContent = APP.L(SITE.brand); });
    wrap.appendChild(mark);
    container.appendChild(wrap);
    container.appendChild(el('<div class="contact-stripes"><i></i><i></i><i></i></div>'));
    return contacts;
  }

  /* Only moving pointers or blank-area touch taps emit stickers; no emission timer. */
  function initStickerRain(scope) {
    scope = scope || document;
    if (rains.has(scope)) rains.get(scope)();
    var config = window.DECORATIONS.contactRain;
    var layer = el('<div class="contact-rain" aria-hidden="true"></div>');
    document.body.appendChild(layer);
    var clipFrame = 0;
    function clipToScope() {
      clipFrame = 0;
      if (scope === document) return;
      var rect = scope.getBoundingClientRect();
      layer.style.clipPath = 'inset(' + Math.max(0,rect.top) + 'px ' + Math.max(0,innerWidth-rect.right) + 'px ' + Math.max(0,innerHeight-rect.bottom) + 'px ' + Math.max(0,rect.left) + 'px)';
    }
    function scheduleClip() { if (!clipFrame) clipFrame = requestAnimationFrame(clipToScope); }
    var controller = new AbortController();
    var options = { signal: controller.signal, passive: true };
    var reduced = matchMedia("(prefers-reduced-motion: reduce)");
    var fine = matchMedia("(hover: hover) and (pointer: fine)");
    var active = [], lastPoint = null, lastTime = 0, previous = null;
    var sources = config.pool.map(function (entry) {
      var image = new Image();
      image.src = entry.src;
      image.onerror = function () { console.error("Missing contact sticker: " + entry.src.split("/").pop()); };
      return { entry: entry, image: image };
    });
    function random(min, max) { return min + Math.random() * (max - min); }
    function remove(item) {
      item.animation.onfinish = null;
      item.animation.cancel();
      item.node.remove();
      var index = active.indexOf(item);
      if (index !== -1) active.splice(index, 1);
    }
    function clear() {
      active.slice().forEach(remove);
      lastPoint = null; lastTime = 0;
    }
    function enabled() {
      return !reduced.matches && !document.hidden && !document.querySelector(".menu.is-open");
    }
    function choose() {
      var available = sources.filter(function (s) { return s.image.complete && s.image.naturalWidth && s.entry.src !== previous; });
      var total = available.reduce(function (sum, s) { return sum + s.entry.weight; }, 0);
      var pick = Math.random() * total;
      for (var i = 0; i < available.length; i++) {
        pick -= available[i].entry.weight;
        if (pick < 0) return available[i].entry;
      }
      return null;
    }
    function emit(x, y, inertia) {
      if (!enabled()) return;
      var entry = choose();
      if (!entry) return;
      previous = entry.src;
      while (active.length >= config.maxActive) remove(active[0]);
      var box = entry.bodyBox;
      var scale = random(config.bodySize[0], config.bodySize[1]) / Math.max(box[2] - box[0], box[3] - box[1]);
      var img = new Image(); img.src = entry.src; img.alt = ""; img.draggable = false;
      img.style.width = entry.canvas[0] * scale + "px";
      // Position the visible body near the pointer, accounting for transparent margins.
      img.style.left = x - (box[0] + box[2]) / 2 * scale + random(-8, 8) + "px";
      img.style.top = y - (box[1] + box[3]) / 2 * scale + random(-5, 10) + "px";
      layer.appendChild(img);
      var duration = random(config.duration[0], config.duration[1]);
      var velocity = random(20, 45), gravity = random(170, 230);
      var drift = Math.max(-65, Math.min(65, inertia)) + random(-18, 18);
      var angle = random(-22, 22), turn = random(35, 100) * (Math.random() < .5 ? -1 : 1);
      var frames = [0, .15, .3, .45, .6, .75, .9, 1].map(function (progress) {
        var seconds = duration / 1000 * progress;
        var drop = velocity * seconds + .5 * gravity * seconds * seconds;
        return { offset: progress, opacity: progress <= .6 ? 1 : (1 - progress) / .4,
          transform: "translate(" + drift * progress + "px," + drop + "px) rotate(" + (angle + turn * progress) + "deg)" };
      });
      var animation = img.animate(frames, { duration: duration, easing: "linear", fill: "forwards" });
      var item = { node: img, animation: animation };
      active.push(item);
      animation.onfinish = function () { remove(item); };
    }
    scope.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || !fine.matches || !enabled()) { lastPoint = null; return; }
      if (!lastPoint) { lastPoint = { x: e.clientX, y: e.clientY }; return; }
      var dx = e.clientX - lastPoint.x, dy = e.clientY - lastPoint.y;
      var now = performance.now();
      if (Math.hypot(dx, dy) < config.distance || now - lastTime < config.interval) return;
      emit(e.clientX, e.clientY, dx * .65);
      lastPoint = { x: e.clientX, y: e.clientY }; lastTime = now;
    }, options);
    scope.addEventListener("click", function (e) {
      if ((e.pointerType !== "touch" && fine.matches) || !e.detail || !enabled()) return;
      if (e.target.closest("a,button,input,textarea,select,label,[role='button'],[contenteditable],.topbar,.menu,.contact-list,.contact-title,.contact-wordmark,.footer")) return;
      emit(e.clientX, e.clientY, random(-25, 25));
      if (Math.random() < .5) emit(e.clientX + random(-16, 16), e.clientY + random(-8, 8), random(-25, 25));
    }, options);
    scope.addEventListener("pointerleave", function () { lastPoint = null; }, options);
    document.addEventListener("visibilitychange", function () { if (document.hidden) clear(); }, options);
    reduced.addEventListener("change", clear, options);
    if (scope !== document) {
      window.addEventListener('scroll', scheduleClip, options);
      window.addEventListener('resize', scheduleClip, options);
      clipToScope();
    }
    var destroyed = false;
    var destroy = function () {
      if (destroyed) return;
      destroyed = true; controller.abort(); cancelAnimationFrame(clipFrame); clear(); layer.remove();
      if (rains.get(scope) === destroy) rains.delete(scope);
    };
    rains.set(scope, destroy);
    return destroy;
  }

  window.CONTACT = { mount:mountContact, initRain:initStickerRain };
})();
