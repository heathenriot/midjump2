(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* desktop nav: sliding underline */
  var nav = $(".mj-nav"), line = $(".mj-navline");
  if (nav && line) {
    var show = function (el) { line.style.left = el.offsetLeft + "px"; line.style.width = el.offsetWidth + "px"; line.style.opacity = 1; };
    $$(".mj-navlink", nav).forEach(function (a) { a.addEventListener("mouseenter", function () { show(a); }); a.addEventListener("focus", function () { show(a); }); });
    nav.addEventListener("mouseleave", function () { line.style.opacity = 0; });
  }

  /* desktop margin nav: appears once the header has scrolled away */
  var side = $(".mj-side"), dh = $(".d-header");
  if (side && dh && "IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      var on = !es[es.length - 1].isIntersecting;
      side.classList.toggle("is-on", on);
      side.setAttribute("aria-hidden", on ? "false" : "true");
    }).observe(dh);
  }

  /* phone menu */
  var btn = $(".mj-menu-btn"), menu = $("#mj-menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      btn.setAttribute("data-open", open ? "1" : "0");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  /* gallery: category filter (matches first, rest dimmed), synced across both layouts */
  var grids = $$(".dg, .pg");
  if (grids.length) {
    var groups = JSON.parse($("#mj-groups").textContent);
    var names = Object.keys(groups);
    var apply = function (cat) {
      grids.forEach(function (g) {
        var cards = $$(".k-card", g);
        var inCat = function (c) { return cat === "All" || groups[cat].indexOf(c.getAttribute("data-slug")) > -1; };
        var hit = cards.filter(inCat), miss = cards.filter(function (c) { return !inCat(c); });
        hit.concat(miss).forEach(function (c, i) {
          var dim = hit.indexOf(c) === -1;
          c.style.order = i;
          c.classList.toggle("is-dim", dim);
          c.setAttribute("aria-hidden", dim ? "true" : "false");
          c.setAttribute("tabindex", dim ? "-1" : "0");
        });
      });
      $$(".g-tab, .p-tab").forEach(function (t) {
        var on = t.getAttribute("data-cat") === cat;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      try {
        var u = new URL(location.href);
        if (cat === "All") u.searchParams.delete("c"); else u.searchParams.set("c", cat.toLowerCase());
        history.replaceState(null, "", u);
      } catch (e) {}
    };
    $$(".g-tab, .p-tab").forEach(function (t) { t.addEventListener("click", function () { apply(t.getAttribute("data-cat")); }); });
    var q = (new URLSearchParams(location.search).get("c") || "").toLowerCase();
    var start = names.filter(function (n) { return n.toLowerCase() === q; })[0];
    if (start) apply(start);

    /* phone tabs: drag to scroll with edge fades */
    var el = $(".mj-tabs");
    if (el) {
      var st = { down: false, id: null, x0: 0, s0: 0, moved: 0, captured: false };
      var fades = function () {
        var max = el.scrollWidth - el.clientWidth, x = el.scrollLeft;
        el.style.setProperty("--fl", x > 2 ? "32px" : "0px");
        el.style.setProperty("--fr", x < max - 2 ? "32px" : "0px");
      };
      el.addEventListener("scroll", fades, { passive: true });
      window.addEventListener("resize", fades);
      fades();
      el.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        st.down = true; st.captured = false; st.moved = 0; st.id = e.pointerId; st.x0 = e.clientX; st.s0 = el.scrollLeft;
      });
      el.addEventListener("pointermove", function (ev) {
        if (!st.down || ev.pointerId !== st.id || ev.pointerType !== "mouse") return;
        var dx = ev.clientX - st.x0; st.moved = Math.max(st.moved, Math.abs(dx));
        if (!st.captured && st.moved > 5) { st.captured = true; try { el.setPointerCapture(st.id); } catch (_) {} el.classList.add("is-dragging"); }
        if (st.captured) el.scrollLeft = st.s0 - dx;
      });
      var up = function (ev) {
        if (!st.down || (ev && ev.pointerId !== st.id)) return;
        st.down = false; el.classList.remove("is-dragging");
        if (st.moved > 5) {
          var stop = function (c) { c.preventDefault(); c.stopPropagation(); el.removeEventListener("click", stop, true); };
          el.addEventListener("click", stop, true);
          setTimeout(function () { el.removeEventListener("click", stop, true); }, 400);
        }
      };
      el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
      el.addEventListener("dragstart", function (d) { d.preventDefault(); });
    }
  }

  /* back to top (phone) */
  var top = $(".k-top");
  if (top) top.addEventListener("click", function (e) {
    e.preventDefault();
    var h = $(".mj-header");
    if (h && h.scrollIntoView) h.scrollIntoView({ behavior: "smooth", block: "start" }); else window.scrollTo(0, 0);
  });
})();
