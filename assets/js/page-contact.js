/* 联系页（深色）：原联系信息/版式与复制，留白中的动态掉落贴纸。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function copyText(text) {
    return new Promise(function (resolve) {
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        resolve();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(resolve, fallback);
      } else {
        fallback();
      }
    });
  }

  /* Only moving pointers or blank-area touch taps emit stickers; no emission timer. */
  function initStickerRain() {
    var config = window.DECORATIONS.contactRain;
    var layer = el('<div class="contact-rain" aria-hidden="true"></div>');
    document.body.appendChild(layer);
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
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || !fine.matches || !enabled()) { lastPoint = null; return; }
      if (!lastPoint) { lastPoint = { x: e.clientX, y: e.clientY }; return; }
      var dx = e.clientX - lastPoint.x, dy = e.clientY - lastPoint.y;
      var now = performance.now();
      if (Math.hypot(dx, dy) < config.distance || now - lastTime < config.interval) return;
      emit(e.clientX, e.clientY, dx * .65);
      lastPoint = { x: e.clientX, y: e.clientY }; lastTime = now;
    }, options);
    document.addEventListener("click", function (e) {
      if ((e.pointerType !== "touch" && fine.matches) || !e.detail || !enabled()) return;
      if (e.target.closest("a,button,input,textarea,select,label,[role='button'],[contenteditable],.topbar,.menu,.contact-list,.contact-title,.contact-wordmark,.footer")) return;
      emit(e.clientX, e.clientY, random(-25, 25));
      if (Math.random() < .5) emit(e.clientX + random(-16, 16), e.clientY + random(-8, 8), random(-25, 25));
    }, options);
    document.addEventListener("pointerleave", function () { lastPoint = null; }, options);
    document.addEventListener("visibilitychange", function () { if (document.hidden) clear(); }, options);
    reduced.addEventListener("change", clear, options);
    return function () { controller.abort(); clear(); layer.remove(); };
  }

  window.PAGE = {
    id: "contact",
    init: function () {
      var page = document.querySelector("#page");
      var painters = [];

      var wrap = el('<div class="contact-wrap container"></div>');
      page.appendChild(wrap);

      var title = el('<h1 class="contact-title display"></h1>');
      painters.push(function () { title.textContent = APP.t("contactTitle"); });
      wrap.appendChild(title);

      /* 旋转圆贴纸 */
      var spin = el('<div class="contact-spin"></div>');
      spin.innerHTML = '<img src="' + window.DECORATIONS.contact[0].src + '" alt="">';
      wrap.appendChild(spin);

      /* 联系行 */
      var list = el('<div class="contact-list"></div>');
      function row(icon, valueText, href, copyable) {
        var r = el('<div class="contact-row"></div>');
        var ic = el('<span class="c-icon">' + icon + '</span>');
        r.appendChild(ic);
        var val = el('<span class="c-value"></span>');
        val.textContent = valueText;
        if (href) {
          var a = el('<a></a>');
          a.href = href; a.target = "_blank"; a.rel = "noopener";
          a.appendChild(val);
          r.appendChild(a);
        } else {
          r.appendChild(val);
        }
        var flag = el('<span class="copied-flag"></span>');
        r.appendChild(flag);
        if (copyable) {
          var cp = el('<button class="c-icon" aria-label="copy">&#x2398;</button>');
          cp.addEventListener("click", function () {
            copyText(valueText).then(function () {
              val.classList.add("is-copied");
              flag.textContent = APP.t("copied");
              flag.classList.add("is-show");
              setTimeout(function () {
                val.classList.remove("is-copied");
                flag.classList.remove("is-show");
              }, 1600);
            });
          });
          painters.push(function () { cp.setAttribute("aria-label", APP.t("copy")); });
          r.appendChild(cp);
        }
        return r;
      }

      var c = window.SITE.contact;
      list.appendChild(row("✉", c.email, "mailto:" + c.email, true));
      list.appendChild(row("✆", c.phone, "tel:" + c.phone, true));
      wrap.appendChild(list);

      /* 描边大字 */
      var mark = el('<div class="contact-wordmark display"></div>');
      painters.push(function () { mark.textContent = APP.L(window.SITE.brand); });
      wrap.appendChild(mark);

      /* 三条色带 */
      page.appendChild(el('<div class="contact-stripes"><i></i><i></i><i></i></div>'));

      function paintAll() { painters.forEach(function (f) { f(); }); }
      paintAll();
      APP.onLang(paintAll);
      window.PAGE.destroy = initStickerRain();
      window.addEventListener("pagehide", function () { window.PAGE.destroy(); });
      window.addEventListener("pageshow", function (e) {
        if (e.persisted) window.PAGE.destroy = initStickerRain();
      });
    },
    renderLang: function () {}
  };
})();
