/* 联系页（深色）：原联系信息/版式与复制，留白中的动态掉落贴纸。 */
(function () {
  "use strict";

  window.PAGE = {
    id: "contact",
    init: function () {
      var page = document.querySelector("#page");
      var painters = [];

      CONTACT.mount(page, painters);

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
