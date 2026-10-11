/* 关于页：紫色标题 + 照片（可拖拽贴纸）+ 红色斜体引言 + 自述。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function makeDraggable(stickerEl, host, frame, config) {
    var dragging = false, pointerId, sx = 0, sy = 0, left = 0, top = 0;
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
      widthRatio = Math.hypot(faceDX, faceDY) / Math.hypot(holeDX, holeDY) * fit.imageSize[0] / fit.portraitSize[0];
      rotation = (Math.atan2(faceDY, faceDX) - Math.atan2(holeDY, holeDX)) * 180 / Math.PI;
    }
    stickerEl.style.transform = "rotate(" + rotation + "deg)";

    function place(x, y) {
      var r = stickerEl.getBoundingClientRect();
      var w = parseFloat(getComputedStyle(stickerEl).width), h = parseFloat(getComputedStyle(stickerEl).height);
      var padX = Math.max(0, (r.width - w) / 2), padY = Math.max(0, (r.height - h) / 2);
      /* 面具的飘带对齐脸部时会稍微越过照片左缘，允许进入页边留白。
         舞台本身不裁切贴纸；仍守住视口边缘与右侧正文。 */
      var minX = fit ? -host.getBoundingClientRect().left + padX : padX;
      stickerEl.style.left = Math.max(minX, Math.min(x, host.clientWidth - w - padX)) + "px";
      stickerEl.style.top = Math.max(padY, Math.min(y, host.clientHeight - h - padY)) + "px";
    }
    function remember() {
      /* 保存相对照片的位置，窗口/手机横竖屏改变后仍跟随照片比例。 */
      movedPosition = {
        x: (parseFloat(stickerEl.style.left) - frame.offsetLeft) / frame.clientWidth,
        y: (parseFloat(stickerEl.style.top) - frame.offsetTop) / frame.clientHeight
      };
    }
    function layout() {
      if (!frame.clientWidth) return;
      var initial = window.matchMedia("(max-width: 900px)").matches ? (config.mobile || config.layout) : config.layout;
      var position = movedPosition || initial;
      stickerEl.style.width = frame.clientWidth * (widthRatio || initial.size) + "px";
      place(frame.offsetLeft + position.x * frame.clientWidth, frame.offsetTop + position.y * frame.clientHeight);
    }
    stickerEl.addEventListener("pointerdown", function (e) {
      if (!config.draggable || dragging || !e.isPrimary || e.button !== 0) return;
      dragging = true; pointerId = e.pointerId;
      stickerEl.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY;
      left = parseFloat(stickerEl.style.left); top = parseFloat(stickerEl.style.top);
      stickerEl.style.zIndex = fit ? 30 : 20;
      e.preventDefault();
    });
    stickerEl.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pointerId) return;
      place(left + e.clientX - sx, top + e.clientY - sy);
      remember();
      e.preventDefault();
    });
    function stop(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      remember(); dragging = false;
    }
    stickerEl.addEventListener("pointerup", stop);
    stickerEl.addEventListener("pointercancel", stop);
    stickerEl.addEventListener("lostpointercapture", stop);
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
      var grid = el('<div class="about-grid"></div>');

      /* 左：照片 + 贴纸 + 引言 */
      var photoWrap = el('<div class="about-photo"></div>');
      var photoStage = el('<div class="about-photo-stage"></div>');
      var frame = el('<div class="photo-frame"><img alt="" width="825" height="1100"></div>');
      frame.querySelector("img").src = window.SITE.portrait;
      photoStage.appendChild(frame); photoWrap.appendChild(photoStage);
      var stickerLayouts = [];
      (window.DECORATIONS.about || []).forEach(function (s) {
        var st = el('<div class="about-sticker" data-sticker-id="' + s.id + '"></div>');
        st.innerHTML = '<img src="' + s.src + '" alt="" draggable="false">';
        photoStage.appendChild(st);
        stickerLayouts.push(makeDraggable(st, photoStage, frame, s));
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
      new ResizeObserver(function () { stickerLayouts.forEach(function (layout) { layout(); }); }).observe(photoStage);
      stickerLayouts.forEach(function (layout) { layout(); });

      function paintAll() { painters.forEach(function (f) { f(); }); }
      paintAll();
      APP.onLang(paintAll);
    },
    renderLang: function () {}
  };
})();
