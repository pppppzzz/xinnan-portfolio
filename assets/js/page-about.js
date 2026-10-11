/* 关于页：紫色标题、完整照片、跨内容区拖动贴纸与自述。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function makeDraggable(stickerEl, host, frame, bio, config) {
    var dragging = false, pointerId, grabX = 0, grabY = 0, lastX = 0, lastY = 0;
    var movedPosition = null;
    var fit = config.faceFit;
    var image = stickerEl.querySelector("img");
    var widthRatio, rotation = config.rotate || 0;
    if (fit) {
      /* 用两眼/两眼孔之间的向量得到等比尺寸与倾角，初始位置仍在照片旁。
         不计算吸附坐标、不改变图像；拖到脸上由用户自由对齐。 */
      var faceDX = fit.portraitEyes[1][0] - fit.portraitEyes[0][0];
      var faceDY = fit.portraitEyes[1][1] - fit.portraitEyes[0][1];
      var holeDX = fit.eyeHoles[1][0] - fit.eyeHoles[0][0];
      var holeDY = fit.eyeHoles[1][1] - fit.eyeHoles[0][1];
      /* 主体/眼孔等比放大15%，飘带不作为主体宽度的测量依据。 */
      widthRatio = Math.hypot(faceDX, faceDY) / Math.hypot(holeDX, holeDY) * fit.imageSize[0] / fit.portraitSize[0] * (fit.bodyScale || 1);
      rotation = (Math.atan2(faceDY, faceDX) - Math.atan2(holeDY, holeDX)) * 180 / Math.PI;
    }
    stickerEl.style.transform = "rotate(" + rotation + "deg)";

    function place(x, y) {
      var r = stickerEl.getBoundingClientRect();
      var w = parseFloat(getComputedStyle(stickerEl).width), h = parseFloat(getComputedStyle(stickerEl).height);
      var padX = Math.max(0, (r.width - w) / 2), padY = Math.max(0, (r.height - h) / 2);
      /* 整个内容区均可拖动；旋转后的边缘仍在视口/内容区域内。 */
      var minX = -host.getBoundingClientRect().left + padX;
      stickerEl.style.left = Math.max(minX, Math.min(x, host.clientWidth - w - padX)) + "px";
      stickerEl.style.top = Math.max(padY, Math.min(y, host.clientHeight - h - padY)) + "px";
    }
    function photoBounds() {
      var h = host.getBoundingClientRect(), f = frame.getBoundingClientRect();
      return { x: f.left - h.left, y: f.top - h.top, width: f.width, height: f.height };
    }
    function remember() {
      var f = photoBounds(), x = parseFloat(stickerEl.style.left), y = parseFloat(stickerEl.style.top);
      var cx = x + stickerEl.offsetWidth / 2, cy = y + stickerEl.offsetHeight / 2;
      // 放在照片上时随照片缩放，其余位置相对整个内容区保存。
      if (cx >= f.x && cx <= f.x + f.width && cy >= f.y && cy <= f.y + f.height) {
        movedPosition = { anchor: "photo", x: (x - f.x) / f.width, y: (y - f.y) / f.height };
      } else {
        movedPosition = { anchor: "area", x: x / host.clientWidth, y: y / host.clientHeight };
      }
    }
    function layout() {
      if (!frame.clientWidth || !image.naturalWidth) return;
      var initial = window.matchMedia("(max-width: 900px)").matches ? (config.mobile || config.layout) : config.layout;
      var position = movedPosition || initial;
      var f = photoBounds(), h = host.getBoundingClientRect(), b = bio.getBoundingClientRect();
      stickerEl.style.width = f.width * (widthRatio || initial.size) + "px";
      if (position.anchor === "area") {
        place(position.x * host.clientWidth, position.y * host.clientHeight);
      } else if (movedPosition) {
        place(f.x + position.x * f.width, f.y + position.y * f.height);
      } else {
        /* 可见主体的旋转后中心决定构图，透明画布/面具飘带不决定视觉位置。 */
        var w = parseFloat(stickerEl.style.width), scale = w / image.naturalWidth;
        var height = image.naturalHeight * scale, box = config.bodyBox;
        var cx = (box[0] + box[2]) / 2 * scale - w / 2;
        var cy = (box[1] + box[3]) / 2 * scale - height / 2;
        var angle = rotation * Math.PI / 180;
        var bodyX = w / 2 + cx * Math.cos(angle) - cy * Math.sin(angle);
        var bodyY = height / 2 + cx * Math.sin(angle) + cy * Math.cos(angle);
        var targetX = f.x + position.x * f.width;
        var targetY = f.y + position.y * f.height;
        if (position.anchor === "side") targetX = f.x + f.width + position.x * (b.right - h.left - f.x - f.width);
        if (position.anchor === "below") {
          targetX = b.left - h.left + position.x * b.width;
          targetY = b.bottom - h.top + 24 + position.y * f.width;
        }
        place(targetX - bodyX, targetY - bodyY);
        // 窄桌面/英文正文更长时让整张PNG避开正文，优先阅读留白。
        var r = stickerEl.getBoundingClientRect();
        if (r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top) {
          place(parseFloat(stickerEl.style.left), parseFloat(stickerEl.style.top) + b.bottom + 20 - r.top);
        }
      }
    }
    function followPointer() {
      var h = host.getBoundingClientRect();
      place(lastX - h.left - grabX, lastY - h.top - grabY);
      remember();
    }
    stickerEl.addEventListener("pointerdown", function (e) {
      if (!config.draggable || dragging || !e.isPrimary || e.button !== 0) return;
      dragging = true; pointerId = e.pointerId;
      stickerEl.setPointerCapture(e.pointerId);
      var h = host.getBoundingClientRect();
      lastX = e.clientX; lastY = e.clientY;
      grabX = e.clientX - h.left - parseFloat(stickerEl.style.left);
      grabY = e.clientY - h.top - parseFloat(stickerEl.style.top);
      stickerEl.style.zIndex = fit ? 30 : 20;
      e.preventDefault();
    });
    stickerEl.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      lastX = e.clientX; lastY = e.clientY;
      followPointer();
      e.preventDefault();
    });
    function stop(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      remember(); dragging = false;
    }
    stickerEl.addEventListener("pointerup", stop);
    stickerEl.addEventListener("pointercancel", stop);
    stickerEl.addEventListener("lostpointercapture", stop);
    window.addEventListener("scroll", function () { if (dragging) followPointer(); }, { passive: true });
    image.addEventListener("load", layout);
    return layout;
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
      var playground = el('<div class="about-playground"></div>');
      var grid = el('<div class="about-grid"></div>');

      /* 左：照片 + 贴纸 + 引言 */
      var photoWrap = el('<div class="about-photo"></div>');
      var photoStage = el('<div class="about-photo-stage"></div>');
      var frame = el('<div class="photo-frame"><img alt="" width="825" height="1100"></div>');
      frame.querySelector("img").src = window.SITE.portrait;
      photoStage.appendChild(frame); photoWrap.appendChild(photoStage);
      var stickerLayouts = [];
      var quote = el('<p class="about-quote"></p>');
      painters.push(function () { quote.textContent = APP.t("photoQuote"); });
      photoWrap.appendChild(quote);
      grid.appendChild(photoWrap);

      /* 右：自述 + 爱好 */
      var bio = el('<div class="about-bio"></div>');
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

      playground.appendChild(grid); container.appendChild(playground);
      var layer = el('<div class="about-sticker-layer"></div>');
      container.appendChild(layer);
      (window.DECORATIONS.about || []).forEach(function (s) {
        var st = el('<div class="about-sticker" data-sticker-id="' + s.id + '"></div>');
        st.innerHTML = '<img src="' + s.src + '" alt="" draggable="false">';
        layer.appendChild(st);
        stickerLayouts.push(makeDraggable(st, layer, frame, bio, s));
      });
      function layoutAll() { stickerLayouts.forEach(function (layout) { layout(); }); }
      var observer = new ResizeObserver(layoutAll);
      observer.observe(container); observer.observe(frame); observer.observe(bio);

      function paintAll() { painters.forEach(function (f) { f(); }); layoutAll(); }
      paintAll();
      APP.onLang(paintAll);
    },
    renderLang: function () {}
  };
})();
