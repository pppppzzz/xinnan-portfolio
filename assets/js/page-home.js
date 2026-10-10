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
    item._paint = function (txt) { item.querySelector(".drop-label").textContent = txt; };
    return item;
  }

  window.PAGE = {
    id: "home",
    init: function () {
      var page = document.querySelector("#page");
      var painters = [];

      /* ---- hero ---- */
      var hero = el('<section class="hero"></section>');
      if (window.SITE.hero && window.SITE.hero.video) {
        var v = el('<video autoplay muted loop playsinline></video>');
        v.src = window.SITE.hero.video;
        if (window.SITE.hero.poster) v.poster = window.SITE.hero.poster;
        hero.appendChild(v);
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
        var titles = (window.PROJECTS || []).filter(function (p) {
          return (p.types || []).indexOf(c.id) >= 0;
        }).map(function (p) { return el("<span></span>"); });
        var item = dropItem("", titles);
        item._cat = c;
        item._paintTitles = function () {
          var inner = item.querySelector(".drop-body-inner");
          inner.innerHTML = "";
          (window.PROJECTS || []).filter(function (p) { return (p.types || []).indexOf(c.id) >= 0; })
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
      (window.PROJECTS || []).filter(function (p) { return p.featured || p.status === "ongoing"; })
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

      function paintAll() { painters.forEach(function (f) { f(); }); }
      paintAll();
      APP.onLang(paintAll);
    },
    renderLang: function () {}
  };
})();
