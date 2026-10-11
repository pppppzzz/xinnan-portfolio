/* Per-tab, per-history-entry navigation. Only recorded adjacent site entries may go back. */
(function () {
  'use strict';
  window.createSiteNavigation = function (APP) {
    var key = 'zn_navigation_v1', store = {entries:{}, pending:null}, current, restoring = false;
    var base = new URL('.', location.href), routes = ['index.html','work.html','about.html','contact.html'];
    try { var saved = JSON.parse(sessionStorage.getItem(key)); if (saved && saved.entries) store = saved; } catch (e) {}
    function siteURL(href) {
      try {
        var url = new URL(href, location.href);
        var route = url.pathname.slice(base.pathname.length);
        if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || (route !== '' && routes.indexOf(route) < 0)) return null;
        return url.pathname + url.search + url.hash;
      } catch (e) { return null; }
    }
    function path(url) { return url && url.split(/[?#]/)[0]; }
    function save() {
      var own = store.entries[current];
      try {
        var fresh = JSON.parse(sessionStorage.getItem(key));
        if (fresh && fresh.entries) store.entries = Object.assign({}, store.entries, fresh.entries);
      } catch (e) {}
      if (own) store.entries[current] = own;
      // Bound storage, retaining recent history entries rather than page-global scroll positions.
      var ids = Object.keys(store.entries);
      if (ids.length > 100) ids.slice(0, ids.length - 100).forEach(function (id) { delete store.entries[id]; });
      try { sessionStorage.setItem(key, JSON.stringify(store)); } catch (e) {}
    }
    function id() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2); }
    function stamp(push, url) {
      var state = Object.assign({}, history.state || {}, {znEntry:current});
      history[push ? 'pushState' : 'replaceState'](state, '', url);
    }
    function adopt() {
      try { var latest = JSON.parse(sessionStorage.getItem(key)); if (latest && latest.entries) store = latest; } catch (e) {}
      var url = siteURL(location.href), candidate = history.state && history.state.znEntry;
      if (candidate && store.entries[candidate] && path(store.entries[candidate].url) === path(url)) {
        current = candidate;
      } else {
        var pending = store.pending;
        var source = pending && store.entries[pending.from];
        var referrer = document.referrer && siteURL(document.referrer);
        var prev = pending && pending.url === url && Date.now() - pending.time < 300000 && source && referrer === source.url.split('#')[0] ? pending.from : null;
        current = id(); store.entries[current] = {url:url, prev:prev, y:0, page:null};
      }
      store.pending = null;
      stamp(false, url); save();
    }
    function record() { return store.entries[current]; }
    function previous() { var r = record(); return r && r.prev && store.entries[r.prev]; }
    function capture() {
      if (restoring || !record()) return;
      record().url = siteURL(location.href); record().y = window.scrollY;
      if (window.PAGE && PAGE.captureState) record().page = PAGE.captureState();
      save();
    }
    function savedState() { return record() && record().page; }
    function restore() {
      var r = record(); if (!r) return;
      restoring = true;
      if (window.PAGE && PAGE.restoreState) PAGE.restoreState(r.page);
      function position() {
        if (APP.lenis) {
          // Its debounced ResizeObserver can still have the empty pre-render page's
          // height after a network load or BFCache restore. Measure before clamping.
          APP.lenis.resize();
          APP.lenis.scrollTo(r.y || 0, {immediate:true, force:true});
        }
        else window.scrollTo(0, r.y || 0);
        if (window.PAGE && PAGE.restoreScroll) PAGE.restoreScroll(r.page);
      }
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        position(); restoring = false;
        document.dispatchEvent(new Event('site-navigation-restored'));
      }); });
      if (document.fonts) document.fonts.ready.then(function () { position(); });
    }
    function replace(url) { stamp(false, siteURL(url)); capture(); document.dispatchEvent(new Event('site-navigation-restored')); }
    function push(url) {
      capture(); var prev = current; current = id();
      store.entries[current] = {url:siteURL(url), prev:prev, y:window.scrollY, page:null};
      stamp(true, siteURL(url)); save();
      document.dispatchEvent(new Event('site-navigation-restored'));
    }
    function prepare(url, replacing) {
      var target = siteURL(url); if (!target) return false;
      capture(); store.pending = {url:target, from:replacing ? record().prev : current, time:Date.now()}; save(); return true;
    }
    function canBackToList() {
      var p = previous(); return !!(p && path(p.url) === base.pathname + 'work.html' && !new URL(p.url, location.origin).hash && (!p.page || !p.page.openId));
    }
    function back() {
      capture();
      // The predecessor was created by our same-tab link or pushState, never by history.length/referrer alone.
      var p = previous();
      if (p && siteURL(p.url)) {
        if (PAGE.destroy) PAGE.destroy();
        history.back(); return;
      }
      APP.navigate('index.html', true);
    }
    adopt();
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.addEventListener('pagehide', capture);
    window.addEventListener('popstate', function () {
      // Location already belongs to the target entry; save the departing UI without changing its URL.
      var target = history.state && history.state.znEntry;
      // BFCache dispatches pageshow before popstate for the same entry. Do not overwrite
      // its saved scroll with the browser's temporary zero before restoration runs.
      if (record() && target !== current) { record().y = window.scrollY; if (PAGE.captureState) record().page = PAGE.captureState(); save(); }
      adopt(); restore();
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { adopt(); restore(); } });
    return {capture:capture, saved:savedState, restore:restore, replace:replace, push:push,
      prepare:prepare, previous:previous, back:back, canBackToList:canBackToList, siteURL:siteURL};
  };
})();
