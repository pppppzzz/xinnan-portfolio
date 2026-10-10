/* 关于页：紫色标题 + 照片（可拖拽贴纸）+ 红色斜体引言 + 自述。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function makeDraggable(stickerEl, host) {
    var dragging = false, sx = 0, sy = 0, left = 0, top = 0;
    function place(x, y) {
      var r = stickerEl.getBoundingClientRect();
      var padX = Math.max(0, (r.width - stickerEl.offsetWidth) / 2);
      var padY = Math.max(0, (r.height - stickerEl.offsetHeight) / 2);
      stickerEl.style.left = Math.max(padX, Math.min(x, host.clientWidth - stickerEl.offsetWidth - padX)) + "px";
      stickerEl.style.top = Math.max(padY, Math.min(y, host.clientHeight - stickerEl.offsetHeight - padY)) + "px";
      stickerEl.style.right = "auto"; stickerEl.style.bottom = "auto";
    }
    stickerEl.addEventListener("pointerdown", function (e) {
      if (!e.isPrimary || e.button !== 0) return;
      dragging = true;
      stickerEl.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY;
      left = stickerEl.offsetLeft; top = stickerEl.offsetTop;
      stickerEl.style.zIndex = 20;
      e.preventDefault();
    });
    stickerEl.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      place(left + e.clientX - sx, top + e.clientY - sy);
    });
    function stop() { dragging = false; }
    stickerEl.addEventListener("pointerup", stop);
    stickerEl.addEventListener("pointercancel", stop);
    stickerEl.addEventListener("lostpointercapture", stop);
    new ResizeObserver(function () {
      if (stickerEl.style.left.endsWith("px")) place(stickerEl.offsetLeft, stickerEl.offsetTop);
    }).observe(host);
  }

  window.PAGE = {
    id: "about",
    init: function () {
      var page = document.querySelector("#page");
      var painters = [];

      var head = el('<h1 class="about-head display"></h1>');
      painters.push(function () { head.textContent = APP.t("aboutTitle"); });
      page.appendChild(el('<div class="container">')).appendChild(head);

      var container = page.querySelector(".container");
      var grid = el('<div class="about-grid"></div>');

      /* 左：照片 + 贴纸 + 引言 */
      var photoWrap = el('<div class="about-photo"></div>');
      var photoStage = el('<div class="about-photo-stage"></div>');
      var frame = el('<div class="photo-frame"><img alt=""></div>');
      frame.querySelector("img").src = window.SITE.portrait;
      photoStage.appendChild(frame); photoWrap.appendChild(photoStage);
      (window.DECORATIONS.about || []).forEach(function (s) {
        var st = el('<div class="about-sticker' + (s.compact === false ? ' sticker-desktop' : '') + '" data-sticker-id="' + s.id + '" style="width:' + s.width + '"></div>');
        Object.keys(s.pos).forEach(function (k) { st.style[k] = s.pos[k]; });
        st.style.transform = "rotate(" + (s.rotate || 0) + "deg)";
        st.innerHTML = '<img src="' + s.src + '" alt="">';
        photoStage.appendChild(st);
        if (s.draggable) makeDraggable(st, photoStage);
      });
      var quote = el('<p class="about-quote"></p>');
      painters.push(function () { quote.textContent = APP.t("photoQuote"); });
      photoWrap.appendChild(quote);
      grid.appendChild(photoWrap);

      /* 右：自述 + 爱好 */
      var bio = el('<div class="about-bio"></div>');
      var paras = (window.SITE.copy.bio && window.SITE.copy.bio[APP.lang]) || [];
      function paintBio() {
        bio.innerHTML = "";
        ((window.SITE.copy.bio || {})[APP.lang] || []).forEach(function (t) {
          bio.appendChild(el("<p></p>")).textContent = t;
        });
        var hb = el('<div class="about-hobbies"></div>');
        hb.textContent = APP.L(window.SITE.copy.hobbies);
        bio.appendChild(hb);
      }
      painters.push(paintBio);
      grid.appendChild(bio);

      container.appendChild(grid);

      function paintAll() { painters.forEach(function (f) { f(); }); }
      paintAll();
      APP.onLang(paintAll);
    },
    renderLang: function () {}
  };
})();
