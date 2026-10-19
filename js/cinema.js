/*
 * Cinematic layer
 * ------------------------------------------------------------
 * Everything that makes the site feel like a film rather than a page:
 *   - intro():       a skippable movie-style opening sequence
 *   - enterScene():  scroll-driven animations for whichever city is showing
 *   - cloudWipe():   a fly-through-the-clouds transition between scenes
 *   - progress bar:  a plane that flies across the top as you scroll
 * Requires GSAP + ScrollTrigger + MotionPathPlugin. With reduced motion
 * (or if GSAP failed to load) every function quietly does nothing.
 */
window.Cinema = (function () {
  "use strict";

  var hasGSAP = !!(window.gsap && window.ScrollTrigger && window.MotionPathPlugin);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  function on() { return hasGSAP && !reduced.matches; }

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var PLANE = "M14 0C14-1.2 12-2 10-2H3L-4-12h-3l4 10h-6l-3-4h-2l1.5 6-1.5 6h2l3-4h6l-4 10h3l7-10h7c2 0 4-.8 4-2z";

  /* ============================================================
   * Opening sequence
   * ============================================================ */
  var introTL = null;

  function buildIntro(name, role) {
    // One span per letter (for the stagger), grouped per word so words never break apart
    var letters = name.toUpperCase().split(/\s+/).map(function (word) {
      return '<span class="word">' + word.split("").map(function (ch) { return '<span class="ch">' + ch + "</span>"; }).join("") + "</span>";
    }).join(" ");
    var clouds = "";
    for (var i = 0; i < 9; i++) clouds += '<span class="i-cloud" style="--x:' + (8 + (i * 37) % 84) + "%;--y:" + (14 + (i * 23) % 70) + '%"></span>';

    var el = document.createElement("div");
    el.className = "film";
    el.id = "film";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Opening sequence");
    el.innerHTML =
      '<div class="i-sky"></div><div class="i-sun"></div>' +
      '<div class="i-clouds">' + clouds + "</div>" +
      '<svg class="i-flight" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
        '<path id="i-route" d="M-120 820C300 760 560 520 820 430S1350 230 1740 90" fill="none"/>' +
        '<path id="i-trail" d="M-120 820C300 760 560 520 820 430S1350 230 1740 90" fill="none"/>' +
        '<g id="i-plane"><path d="' + PLANE + '"/></g>' +
      "</svg>" +
      '<div class="i-text">' +
        '<p class="i-line i-l1 mono">JahaanAir presents</p>' +
        '<p class="i-line i-l2 mono">Flight JS-2026 · Chennai → The World</p>' +
        '<h1 class="i-title display" aria-label="' + name + '">' + letters + "</h1>" +
        '<p class="i-sub mono">' + role + " · Swift · SwiftUI</p>" +
      "</div>" +
      '<div class="i-grain" aria-hidden="true"></div><div class="i-vignette" aria-hidden="true"></div>' +
      '<div class="i-bar top" aria-hidden="true"></div><div class="i-bar bottom" aria-hidden="true">' +
        '<span class="mono i-rec"><i></i>REC</span><span class="mono i-tc" id="i-tc">00:00:00:00</span><span class="mono i-scene">Scene 01 · Take-off</span>' +
      "</div>" +
      '<button class="i-skip mono" type="button">Skip intro ⏭</button>';
    document.body.appendChild(el);
    return el;
  }

  function intro(name, role, done) {
    if (!on()) { done(); return; }
    var el = buildIntro(name, role);
    document.body.classList.add("no-scroll");
    var finished = false;
    var tc = { t: 0 };

    function finish() {
      if (finished) return;
      finished = true;
      if (introTL) introTL.kill();
      gsap.to(el, {
        clipPath: "circle(0% at 50% 50%)", duration: 0.9, ease: "power3.inOut",
        onComplete: function () { el.remove(); }
      });
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKey);
      done();
    }
    function onKey(e) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(); } }
    $(".i-skip", el).addEventListener("click", finish);
    document.addEventListener("keydown", onKey);
    setTimeout(function () { $(".i-skip", el).focus({ preventScroll: true }); }, 50);

    var trail = $("#i-trail", el);
    var L = trail.getTotalLength();
    gsap.set(trail, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set(el, { clipPath: "circle(150% at 50% 50%)" });

    var tl = introTL = gsap.timeline({ onComplete: finish, onUpdate: function () {
      var f = Math.floor(tc.t * 24), s = Math.floor(tc.t);
      $("#i-tc").textContent = "00:00:" + String(s).padStart(2, "0") + ":" + String(f % 24).padStart(2, "0");
    } });
    tl.to(tc, { t: 6.4, duration: 6.4, ease: "none" }, 0)
      // letterbox bars close in, the sky fades up from black
      .from(".i-bar.top", { yPercent: -100, duration: 0.7, ease: "power3.out" }, 0)
      .from(".i-bar.bottom", { yPercent: 100, duration: 0.7, ease: "power3.out" }, 0)
      .from(".i-sky", { opacity: 0, duration: 1.2 }, 0)
      .from(".i-sun", { y: 220, scale: 0.6, duration: 3.2, ease: "power2.out" }, 0.2)
      // camera flies through the clouds
      .fromTo(".i-cloud", { scale: 0.3 }, { scale: 3.2, duration: 2.4, ease: "power1.in", stagger: { each: 0.2, repeat: 1 } }, 0.1)
      .fromTo(".i-cloud", { opacity: 0 }, { keyframes: { opacity: [0, 0.95, 0.85, 0] }, duration: 2.4, ease: "none", stagger: { each: 0.2, repeat: 1 } }, 0.1)
      .fromTo(".i-l1", { opacity: 0, y: 20, letterSpacing: "0.6em" }, { opacity: 1, y: 0, letterSpacing: "0.3em", duration: 0.8 }, 0.6)
      .to(".i-l1", { opacity: 0, y: -16, duration: 0.5 }, 1.8)
      // the plane crosses the frame and leaves a contrail
      .fromTo("#i-plane", { scale: 2.2 }, {
        motionPath: { path: "#i-route", align: "#i-route", alignOrigin: [0.5, 0.5], autoRotate: true },
        scale: 4.5, duration: 2.8, ease: "power1.inOut"
      }, 1.4)
      .to(trail, { strokeDashoffset: 0, duration: 2.8, ease: "power1.inOut" }, 1.4)
      .fromTo(".i-l2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 2.2)
      .to(".i-l2", { opacity: 0, y: -16, duration: 0.5 }, 3.3)
      // title card
      .from(".i-title .ch", { yPercent: 110, rotateX: -80, opacity: 0, duration: 0.7, stagger: 0.045, ease: "back.out(1.8)" }, 3.5)
      .from(".i-sub", { opacity: 0, y: 14, duration: 0.6 }, 4.3)
      .to(".i-title", { scale: 1.06, duration: 1.6, ease: "none" }, 4.4)
      .to({}, { duration: 0.3 });
  }

  /* ============================================================
   * Cloud wipe transition (used for back / forward jumps)
   * ============================================================ */
  function cloudWipe(midway) {
    if (!on()) { midway(); return; }
    var wipe = document.createElement("div");
    wipe.className = "cloud-wipe";
    wipe.innerHTML = "<span></span><span></span><span></span><span></span>";
    document.body.appendChild(wipe);
    gsap.timeline({ onComplete: function () { wipe.remove(); } })
      .fromTo(wipe, { xPercent: 110 }, { xPercent: 0, duration: 0.45, ease: "power2.in" })
      .add(midway)
      .to(wipe, { xPercent: -110, duration: 0.55, ease: "power2.out" }, "+=0.05");
  }

  /* ============================================================
   * Scroll progress: a small plane flying along a dashed route
   * ============================================================ */
  function progressBar() {
    var bar = document.createElement("div");
    bar.className = "flight-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<span class="fp-line"></span><svg class="fp-plane" viewBox="-16 -14 32 28"><path d="' + PLANE + '"/></svg>';
    document.body.appendChild(bar);
    if (!on()) return;
    gsap.to(".fp-line", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: 0, end: "max", scrub: 0.3 } });
    gsap.to(".fp-plane", { left: "100%", ease: "none", scrollTrigger: { trigger: document.documentElement, start: 0, end: "max", scrub: 0.3 } });
  }

  /* ============================================================
   * Scroll-driven scene animations
   * ============================================================ */
  var sceneCtx = null;

  function inView(el) { return el.getBoundingClientRect().top < window.innerHeight * 0.92; }

  // Reveal anything below the fold as it scrolls into view
  function scrollReveal(els, from) {
    els.forEach(function (el) {
      gsap.from(el, Object.assign({
        y: 60, opacity: 0, duration: 0.8, ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 90%", once: true }
      }, from || {}));
    });
  }

  function heroParallax(scene) {
    var header = $(".terminal-sign, .arrival", scene);
    if (!header) return;
    var st = { trigger: header, start: "top top+=60", end: "bottom top", scrub: true };
    gsap.to($(".skyline .sun", header), { y: 70, ease: "none", scrollTrigger: st });
    gsap.to($(".skyline .far", header), { y: 25, ease: "none", scrollTrigger: st });
    gsap.to($(".city-title", header), { yPercent: -18, opacity: 0.25, ease: "none", scrollTrigger: st });
  }

  var SPECIALS = {
    // Postcards are dealt onto the table one by one
    projects: function (scene) {
      $$(".postcard", scene).forEach(function (card, i) {
        gsap.from(card, {
          x: -260, y: 120, rotate: -28, opacity: 0, duration: 0.9, delay: i * 0.12, ease: "back.out(1.2)", clearProps: "transform,opacity",
          scrollTrigger: { trigger: card, start: "top 92%", once: true }
        });
      });
    },
    // Each page of stamps slams down when it reaches the screen
    skills: function (scene) {
      $$(".stamp-page", scene).forEach(function (page) {
        var tl = gsap.timeline({ scrollTrigger: { trigger: page, start: "top 85%", once: true } });
        tl.from(page, { y: 50, opacity: 0, duration: 0.5, ease: "power2.out", clearProps: "transform,opacity" })
          .from($$(".skill-stamp", page), {
            scale: 2.2, opacity: 0, duration: 0.32, stagger: 0.09, ease: "back.out(3)", clearProps: "transform,opacity",
            onStart: function () { window.Sound && Sound.stamp(); }
          }, "-=0.15");
      });
    },
    // Luggage tags swing in on their strings
    languages: function (scene) {
      $$(".lug-tag", scene).forEach(function (tag, i) {
        gsap.from(tag, {
          rotate: -40, y: -80, opacity: 0, transformOrigin: "50% 0%", duration: 1.4, delay: i * 0.15, ease: "elastic.out(1, 0.35)", clearProps: "transform,opacity",
          scrollTrigger: { trigger: tag, start: "top 92%", once: true }
        });
      });
      gsap.from(".fx-row", { x: 40, opacity: 0, stagger: 0.1, duration: 0.5, clearProps: "transform,opacity", scrollTrigger: { trigger: ".exchange", start: "top 85%", once: true } });
    },
    // The flight log draws itself and a plane flies down it as you scroll
    education: function (scene) {
      var log = $(".flight-log", scene);
      if (!log) return;
      var trail = document.createElement("span");
      trail.className = "log-trail";
      var plane = document.createElement("span");
      plane.className = "log-plane";
      plane.innerHTML = '<svg viewBox="-16 -14 32 28"><path d="' + PLANE + '"/></svg>';
      log.appendChild(trail); log.appendChild(plane);
      var st = { trigger: log, start: "top 70%", end: "bottom 60%", scrub: 0.6 };
      gsap.fromTo(trail, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: st });
      gsap.fromTo(plane, { top: "0%" }, { top: "100%", ease: "none", scrollTrigger: st });
      $$(".leg", scene).forEach(function (leg) {
        var node = $(".leg-node", leg), card = $(".leg-card", leg);
        var tl = gsap.timeline({ scrollTrigger: { trigger: leg, start: "top 75%", once: true } });
        tl.from(node, { scale: 0, rotate: -180, duration: 0.5, ease: "back.out(2)", clearProps: "transform" })
          .from(card, { x: 80, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "transform,opacity" }, "-=0.25")
          .from($$("li", card), { x: 20, opacity: 0, stagger: 0.07, duration: 0.4, clearProps: "transform,opacity" }, "-=0.35");
      });
    },
    // Home: the bag tags drop in and the board flickers on
    home: function (scene) {
      $$(".bag-tag", scene).forEach(function (tag, i) {
        gsap.from(tag, { y: -60, rotate: i % 2 ? 8 : -8, opacity: 0, duration: 0.9, delay: i * 0.12, ease: "bounce.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: tag, start: "top 95%", once: true } });
      });
    }
  };

  // Called by app.js every time a scene is shown. Returns the elements it will animate
  // on scroll, so app.js can leave them out of its own arrival animation.
  function enterScene(scene, key) {
    if (sceneCtx) { sceneCtx.revert(); sceneCtx = null; }
    if (!on()) return [];
    var handled = [];
    sceneCtx = gsap.context(function () {
      heroParallax(scene);
      if (SPECIALS[key]) SPECIALS[key](scene);
      var below = $$(".reveal", scene).filter(function (el) { return !inView(el); });
      // Special cases animate their own items; reveal the rest generically
      var own = { projects: ".postcard", skills: ".stamp-page", languages: ".lug-tag", education: ".leg", home: ".tags-row" }[key];
      below.forEach(function (el) { if (!own || !el.matches(own)) handled.push(el); });
      scrollReveal(handled);
      handled = handled.concat(own ? $$(own, scene) : []);
    }, scene);
    requestAnimationFrame(function () { ScrollTrigger.refresh(); });
    return handled;
  }

  return {
    get enabled() { return on(); },
    intro: intro,
    cloudWipe: cloudWipe,
    enterScene: enterScene,
    progressBar: progressBar
  };
})();
