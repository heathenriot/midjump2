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

  /* forms (Web3Forms; the access key is a public client key by design): contact page + domain inquiries */
  $$("form[data-key]").forEach(function (cf) {
    var wrap = cf.closest(".c-wrap"), err = $(".mj-err", cf), sendBtn = $(".mj-send", cf);
    var dom = "";
    try { var d = new URLSearchParams(location.search).get("domain"); if (d && /^[\w.-]{1,80}$/.test(d)) dom = d; } catch (e) {}
    var fixed = cf.getAttribute("data-domain") || "";
    var msg = cf.elements.message;
    if (dom && !fixed && msg && !msg.value) msg.value = "I'm interested in " + dom + ".\n\n";
    cf.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {}; new FormData(cf).forEach(function (v, k) { data[k] = v; });
      if (data.botcheck) return;
      delete data.botcheck;
      var sub = fixed || dom;
      data.access_key = cf.getAttribute("data-key");
      data.subject = (fixed ? "Inquiry" : "Inquiry: Contact Page") + (sub ? " (" + sub + ")" : "");
      data.from_name = "Midjump \u2014 " + (fixed ? "Domain Inquiry" : "Contact Form");
      if (fixed) data.domain = fixed;
      err.hidden = true; sendBtn.disabled = true;
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); wrap.classList.add("is-sent"); cf.reset(); })
        .catch(function () { err.hidden = false; })
        .then(function () { sendBtn.disabled = false; });
    });
    $(".mj-again", wrap).addEventListener("click", function () { wrap.classList.remove("is-sent"); });
  });

  /* domain page: logo concept carousel (drag, arrows) */
  $$(".dm-viewer").forEach(function (v) {
    var track = $(".dm-track", v), n = track.children.length, sel = 0, g = null, dx = 0;
    var prev = $(".dm-prev"), next = $(".dm-next");
    var show = function () {
      track.style.transform = "translateX(-" + (sel * 100) + "%)";
      if (prev) prev.disabled = sel === 0;
      if (next) next.disabled = sel === n - 1;
    };
    if (prev) prev.addEventListener("click", function () { sel = Math.max(0, sel - 1); show(); });
    if (next) next.addEventListener("click", function () { sel = Math.min(n - 1, sel + 1); show(); });
    show();
    if (n < 2) return;
    v.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      g = { id: e.pointerId, x: e.clientX, y: e.clientY, axis: null, w: v.clientWidth || 1 };
      if (e.pointerType === "mouse" && v.setPointerCapture) v.setPointerCapture(e.pointerId);
    });
    v.addEventListener("pointermove", function (e) {
      if (!g || e.pointerId !== g.id) return;
      var x = e.clientX - g.x, y = e.clientY - g.y;
      if (g.axis === null) { if (Math.abs(x) < 6 && Math.abs(y) < 6) return; g.axis = Math.abs(x) > Math.abs(y) ? "h" : "v"; }
      if (g.axis !== "h") return;
      if ((sel === 0 && x > 0) || (sel === n - 1 && x < 0)) x = x * 0.35;
      dx = Math.max(-g.w, Math.min(g.w, x));
      v.classList.add("is-dragging");
      track.style.transform = "translateX(calc(-" + (sel * 100) + "% + " + dx + "px))";
    });
    var end = function (e) {
      if (!g || e.pointerId !== g.id) return;
      var th = Math.min(70, g.w * 0.18);
      if (g.axis === "h" && Math.abs(dx) >= th) sel = dx < 0 ? Math.min(n - 1, sel + 1) : Math.max(0, sel - 1);
      g = null; dx = 0; v.classList.remove("is-dragging"); show();
    };
    v.addEventListener("pointerup", end);
    v.addEventListener("pointercancel", function () { g = null; dx = 0; v.classList.remove("is-dragging"); show(); });
  });

  /* landing: marquee (cruises, follows a drag, keeps a throw's momentum, wraps seamlessly) */
  $$(".mq-vp").forEach(function (vp) {
    var secs = +vp.getAttribute("data-secs") || 45, st = null;
    var init = function () {
      if (st) return st;
      var track = vp.firstElementChild;
      if (!track.getBoundingClientRect().width) return null;
      var m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      st = { x: -m.m41, vel: 0, half: track.getBoundingClientRect().width / 2, dir: 1, dragging: false, captured: false, moved: 0, id: null, lastX: 0, lastT: 0, prev: performance.now(), factor: 1 };
      var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      st.cruise = still ? 0 : st.half / secs;
      st.vel = still ? 0 : st.cruise;
      track.style.animation = "none";
      var frame = function (now) {
        var dt = Math.min((now - st.prev) / 1000, 0.05);
        st.prev = now;
        if (!st.dragging) {
          var want = st.dir * st.cruise * st.factor;
          if (Math.abs(st.vel) > st.cruise * 1.05) st.vel *= 0.94; else st.vel += (want - st.vel) * Math.min(1, dt * 2.5);
          st.x += st.vel * dt;
        }
        st.x = ((st.x % st.half) + st.half) % st.half;
        track.style.transform = "translate3d(" + (-st.x) + "px,0,0)";
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      return st;
    };
    vp.addEventListener("pointerenter", function () { var s = init(); if (s) s.factor = 0.8; });
    vp.addEventListener("pointerleave", function () { if (st) st.factor = 1; });
    vp.addEventListener("pointerdown", function (e) {
      var s = init(); if (!s) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      s.dragging = true; s.captured = false; s.moved = 0; s.vel = 0; s.id = e.pointerId; s.lastX = e.clientX; s.lastT = performance.now();
    });
    vp.addEventListener("pointermove", function (ev) {
      if (!st || !st.dragging || ev.pointerId !== st.id) return;
      var dx = ev.clientX - st.lastX, now = performance.now();
      st.x -= dx; st.moved += Math.abs(dx);
      if (now - st.lastT > 0) st.vel = (-dx / (now - st.lastT)) * 1000;
      st.lastX = ev.clientX; st.lastT = now;
      if (!st.captured && st.moved > 5) { st.captured = true; try { vp.setPointerCapture(st.id); } catch (_) {} vp.classList.add("is-dragging"); }
    });
    var up = function (ev) {
      if (!st || !st.dragging || (ev && ev.pointerId !== st.id)) return;
      st.dragging = false; vp.classList.remove("is-dragging");
      if (st.vel !== 0) st.dir = st.vel < 0 ? -1 : 1;
      if (st.moved > 5) {
        var stop = function (c) { c.preventDefault(); c.stopPropagation(); vp.removeEventListener("click", stop, true); };
        vp.addEventListener("click", stop, true);
        setTimeout(function () { vp.removeEventListener("click", stop, true); }, 400);
      }
    };
    vp.addEventListener("pointerup", up); vp.addEventListener("pointercancel", up);
    vp.addEventListener("dragstart", function (d) { d.preventDefault(); });
  });

  /* landing (phone): FAQ accordion, one open at a time */
  var faqs = $$(".faq");
  faqs.forEach(function (f) {
    $(".faq-q", f).addEventListener("click", function () {
      var open = !f.classList.contains("is-open");
      faqs.forEach(function (o) { o.classList.remove("is-open"); $(".faq-q", o).setAttribute("aria-expanded", "false"); });
      if (open) { f.classList.add("is-open"); $(".faq-q", f).setAttribute("aria-expanded", "true"); }
    });
  });
})();
