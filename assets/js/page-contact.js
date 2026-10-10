/* 联系页（深色）：邮箱/电话 + 复制 + 旋转圆贴纸 + 描边大字 + 三条色带。 */
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
    },
    renderLang: function () {}
  };
})();
