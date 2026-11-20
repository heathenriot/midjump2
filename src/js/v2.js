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
