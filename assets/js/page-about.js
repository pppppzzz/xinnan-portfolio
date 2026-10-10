/* 关于页：紫色标题 + 照片（可拖拽贴纸）+ 红色斜体引言 + 自述。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function makeDraggable(stickerEl, host) {
    var dragging = false, ox = 0, oy = 0;
    stickerEl.addEventListener("pointerdown", function (e) {
      dragging = true;
      stickerEl.setPointerCapture(e.pointerId);
      var r = stickerEl.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      stickerEl.style.zIndex = 20;
      e.preventDefault();
    });
    stickerEl.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var hr = host.getBoundingClientRect();
      stickerEl.style.left = (e.clientX - hr.left - ox) + "px";
      stickerEl.style.top = (e.clientY - hr.top - oy) + "px";
      stickerEl.style.right = "auto";
      stickerEl.style.bottom = "auto";
    });
    stickerEl.addEventListener("pointerup", function () { dragging = false; });
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
      var frame = el('<div class="photo-frame"><img alt=""></div>');
      frame.querySelector("img").src = window.SITE.portrait;
      photoWrap.appendChild(frame);
      (window.DECORATIONS.about || []).forEach(function (s) {
        var st = el('<div class="about-sticker" style="width:' + s.width + '"></div>');
        Object.keys(s.pos).forEach(function (k) { st.style[k] = s.pos[k]; });
        st.style.transform = "rotate(" + (s.rotate || 0) + "deg)";
        st.innerHTML = '<img src="' + s.src + '" alt="">';
        photoWrap.appendChild(st);
        if (s.draggable) makeDraggable(st, photoWrap);
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
