/* 联系页（深色）：原联系信息/版式与复制，留白中的动态掉落贴纸。 */
(function () {
  "use strict";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
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

      /* Shared data and clipboard behavior with the home contact ending. */
      var contacts = CONTACT.buildList(painters);
      wrap.appendChild(contacts.node);

      /* 描边大字 */
      var mark = el('<div class="contact-wordmark display"></div>');
      painters.push(function () { mark.textContent = APP.L(window.SITE.brand); });
      wrap.appendChild(mark);

      /* 三条色带 */
      page.appendChild(el('<div class="contact-stripes"><i></i><i></i><i></i></div>'));

      function paintAll() { painters.forEach(function (f) { f(); }); }
      paintAll();
      APP.onLang(paintAll);
      var stopRain = CONTACT.initRain(document);
      window.PAGE.destroy = function () { stopRain(); };
      window.addEventListener("pagehide", function () { window.PAGE.destroy(); });
      window.addEventListener("pageshow", function (e) {
        if (e.persisted) stopRain = CONTACT.initRain(document);
      });
    },
    renderLang: function () {}
  };
})();
