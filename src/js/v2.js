// Behaviour for pages on the new design: phone menu, FAQ accordion, phone card slider.
(function () {
  "use strict";
  var phone = window.matchMedia("(max-width: 640px)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- phone menu ---------- */
  var btn = document.querySelector(".pmb"), menu = document.querySelector(".pmm"), over = document.querySelector(".pmo");
  if (btn && menu) {
    var setMenu = function (open) {
      btn.dataset.open = open ? "1" : "0";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("open", open);
      if (over) over.classList.toggle("open", open);
    };
    btn.addEventListener("click", function () { setMenu(btn.dataset.open !== "1"); });
    if (over) over.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    phone.addEventListener("change", function () { setMenu(false); });
  }

  /* ---------- FAQ: one open at a time, starts closed ---------- */
  document.querySelectorAll(".faql").forEach(function (list) {
    list.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq"), open = !item.classList.contains("open");
        list.querySelectorAll(".faq.open").forEach(function (o) { o.classList.remove("open"); o.querySelector(".faq-q").setAttribute("aria-expanded", "false"); });
        if (open) { item.classList.add("open"); q.setAttribute("aria-expanded", "true"); }
      });
    });
  });

  /* ---------- gallery: category tabs (dim others; phones hide them), 1/2 per row on phones ---------- */
  var grid = document.querySelector(".gal-grid");
  if (grid) {
    var tabs = document.querySelectorAll(".tab[data-cat]"), cardsEls = grid.querySelectorAll(".pol");
    var pick = function (cat, push) {
      var hit = false;
      tabs.forEach(function (t) { var on = t.dataset.cat === cat; if (on) hit = true; t.classList.toggle("on", on); t.setAttribute("aria-selected", on ? "true" : "false"); });
      if (!hit) return pick("All", push);
      cardsEls.forEach(function (c) { c.classList.toggle("dim", cat !== "All" && c.dataset.cats.split("|").indexOf(cat) < 0); });
      if (push && history.replaceState) history.replaceState(null, "", cat === "All" ? location.pathname : "?category=" + encodeURIComponent(cat));
    };
    tabs.forEach(function (t) { t.addEventListener("click", function () { pick(t.dataset.cat, true); }); });
    var q = new URLSearchParams(location.search).get("category");
    if (q) { var m = [].filter.call(tabs, function (t) { return t.dataset.cat.toLowerCase() === q.toLowerCase(); })[0]; if (m) pick(m.dataset.cat, false); }
    document.querySelectorAll(".pvs button").forEach(function (b, i, all) {
      b.addEventListener("click", function () {
        all.forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        grid.classList.toggle("v1", b.dataset.vw === "1");
      });
    });
  }

  /* ---------- domain page: logo concept carousel (arrows, dots, swipe) ---------- */
  document.querySelectorAll(".dpg .stage").forEach(function (st) {
    var track = st.querySelector(".track"), slides = st.querySelectorAll(".slide"), dots = st.querySelectorAll(".dot"), n = slides.length, i = 0;
    if (n < 2) return;
    var show = function (k, dx) {
      i = (k + n) % n;
      track.style.transform = "translateX(calc(" + (-i * 100) + "% + " + (dx || 0) + "px))";
      slides.forEach(function (s, j) { s.classList.toggle("off", j !== i); });
      dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
    };
    st.querySelectorAll(".arr.pv").forEach(function (b) { b.addEventListener("click", function () { show(i - 1); }); });
    st.querySelectorAll(".arr.nx").forEach(function (b) { b.addEventListener("click", function () { show(i + 1); }); });
    dots.forEach(function (d, j) { d.addEventListener("click", function () { show(j); }); });
    var plate = st.querySelector(".plate"), drag = null;
    plate.style.touchAction = "pan-y";
    plate.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, dx: 0 }; track.style.transition = "none"; try { plate.setPointerCapture(e.pointerId); } catch (_) {} });
    plate.addEventListener("pointermove", function (e) { if (!drag) return; drag.dx = e.clientX - drag.x; show(i, drag.dx * 0.9); });
    var end = function () { if (!drag) return; var dx = drag.dx; drag = null; track.style.transition = ""; if (dx < -40) show(i + 1); else if (dx > 40) show(i - 1); else show(i); };
    plate.addEventListener("pointerup", end); plate.addEventListener("pointercancel", end);
  });

  /* ---------- inquiry forms (Web3Forms; the access key is a public client key by design) ---------- */
  document.querySelectorAll("form[data-key]").forEach(function (f) {
    var card = f.parentElement, ok = card.querySelector(".fok"), err = f.querySelector(".ferr"), extra = card.querySelectorAll(".ndiv,.trust");
    var domain = f.getAttribute("data-domain") || "";
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {}; new FormData(f).forEach(function (v, k) { data[k] = v; });
      if (data.botcheck) return;
      delete data.botcheck;
      data.access_key = f.getAttribute("data-key");
      data.subject = domain ? "Inquiry (" + domain + ")" : "Inquiry: Contact Page";
      data.from_name = "Midjump — " + (domain ? "Domain Inquiry" : "Contact Form");
      if (domain) data.domain = domain;
      var toastOk = document.querySelector(".c-ok"), toastErr = card.querySelector(".toast.err");
      if (err) err.hidden = true;
      if (toastErr) toastErr.hidden = true;
      f.classList.remove("failed"); f.classList.add("sending");
      fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          f.reset();
          if (ok) { f.hidden = true; ok.hidden = false; }                       // domain page: thank-you inside the card
          if (toastOk) { toastOk.hidden = false; clearTimeout(f._t); f._t = setTimeout(function () { toastOk.hidden = true; }, 7000); } // contact: toast
        })
        .catch(function () { if (err) err.hidden = false; if (toastErr) { toastErr.hidden = false; f.classList.add("failed"); } })
        .then(function () { f.classList.remove("sending"); });
    });
    document.querySelectorAll(".toast-x").forEach(function (x) { x.addEventListener("click", function () { x.closest(".toast").hidden = true; f.classList.remove("failed"); }); });
    var again = ok && ok.querySelector(".fok-again");
    if (again) again.addEventListener("click", function () { ok.hidden = true; f.hidden = false; });
  });

  /* ---------- back to top (tablet + phone): shows when scrolling back up after 1200px ---------- */
  var top = document.querySelector(".ptop");
  if (top) {
    var lastY = window.scrollY, shown = false;
    window.addEventListener("scroll", function () {
      var y = window.scrollY, up = y < lastY - 3, down = y > lastY + 3;
      if (up || down) lastY = y;
      var s = y > 1200 && (up ? true : down ? false : shown);
      if (s !== shown) { shown = s; top.classList.toggle("show", s); }
    }, { passive: true });
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced.matches ? "auto" : "smooth" }); });
  }

  /* ---------- phone slider: two sets of four, auto-advance, swipe, dots ---------- */
  var vp = document.querySelector(".mqv");
  if (vp) {
    var track = vp.querySelector(".g4"), dots = document.querySelectorAll(".mqd button");
    var SETS = 2, DWELL = 3500, SLIDE = 700, SWIPE = 40;
    var page = 0, last = Date.now(), drag = null, offscreen = false;
    var paint = function (dx) { track.style.transform = "translateX(calc(" + (-page) + " * (100% + 10px) + " + (dx || 0) + "px))"; };
    var markDots = function () { dots.forEach(function (d, i) { d.classList.toggle("on", page % SETS === i); }); };
    var go = function (k) {
      if (k > SETS) k = SETS;
      if (k < 0) { // step back from the first set: jump to the copy at the end, then slide
        track.classList.add("noanim"); page = SETS; paint(); void track.offsetWidth;
        track.classList.remove("noanim"); k = SETS - 1;
      }
      page = k; paint(); markDots();
      if (page === SETS) setTimeout(function () { // reached the copy of set 1: snap back without animating
        track.classList.add("noanim"); page = 0; paint(); markDots(); void track.offsetWidth; track.classList.remove("noanim");
      }, SLIDE + 60);
    };
    var paused = function () { return !phone.matches || reduced.matches || drag || offscreen || document.hidden; };
    setInterval(function () {
      if (paused() || Date.now() - last < DWELL + SLIDE) return;
      last = Date.now(); go(page + 1);
    }, 200);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { offscreen = !es[0].isIntersecting; if (!offscreen) last = Date.now(); }, { threshold: 0.35 }).observe(vp);
    dots.forEach(function (d, i) { d.addEventListener("click", function () { last = Date.now(); go(i); }); });
    vp.addEventListener("pointerdown", function (e) {
      if (!phone.matches) return;
      drag = { x: e.clientX, dx: 0, moved: false }; last = Date.now(); track.classList.add("noanim");
      try { vp.setPointerCapture(e.pointerId); } catch (_) {}
    });
    vp.addEventListener("pointermove", function (e) { if (!drag) return; drag.dx = e.clientX - drag.x; if (Math.abs(drag.dx) > 6) drag.moved = true; paint(drag.dx); });
    var end = function () {
      if (!drag) return; var dx = drag.dx; track.classList.remove("noanim"); last = Date.now();
      vp._justDragged = drag.moved; drag = null;
      if (dx < -SWIPE) go(page + 1); else if (dx > SWIPE) go(page - 1); else paint();
    };
    vp.addEventListener("pointerup", end);
    vp.addEventListener("pointercancel", end);
    vp.addEventListener("click", function (e) { if (vp._justDragged) { e.preventDefault(); vp._justDragged = false; } }, true);
  }
})();
