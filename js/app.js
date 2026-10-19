/*
 * Travel Journey portfolio
 * ------------------------------------------------------------
 * The visitor starts at the home airport (About Me), picks a
 * destination on the route map, gets a boarding pass, and flies
 * there. Each destination city is one portfolio section.
 *
 * Sections of this file:
 *   1. Setup & state
 *   2. Small helpers
 *   3. Map geometry (projection, routes)
 *   4. Split-flap board
 *   5. Renderers (home, cities, map, pass, passport)
 *   6. Navigation: map → boarding pass → flight → arrival
 *   7. Controls (theme, sound, keyboard, hash routing)
 *   8. Boot
 */
(function () {
  "use strict";

  /* ============================================================
   * 1. Setup & state
   * ============================================================ */
  var P = window.PORTFOLIO;
  var CITIES = P.cities;
  var DESTINATIONS = ["projects", "skills", "languages", "education"];
  var ALL = ["home"].concat(DESTINATIONS);

  var hasGSAP = !!(window.gsap && window.MotionPathPlugin);
  if (hasGSAP) gsap.registerPlugin(MotionPathPlugin);

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var smallScreen = window.matchMedia("(max-width: 760px)");

  // The single source of truth for the journey
  var state = {
    current: "home",          // key of the city we are in
    visited: new Set(["home"]),
    stampedAt: {},            // key -> date string for the passport
    passenger: "",
    completeShown: false,
    flying: false,
    target: null              // destination picked on the map
  };

  var STORE_KEY = "tj-journey";

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!saved) return;
      (saved.visited || []).forEach(function (k) { if (CITIES[k]) state.visited.add(k); });
      state.stampedAt = saved.stampedAt || {};
      state.passenger = saved.passenger || "";
      state.completeShown = !!saved.completeShown;
    } catch (e) { /* storage unavailable: start fresh */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        visited: Array.from(state.visited),
        stampedAt: state.stampedAt,
        passenger: state.passenger,
        completeShown: state.completeShown
      }));
    } catch (e) { /* ignore */ }
  }

  /* ============================================================
   * 2. Small helpers
   * ============================================================ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function keyFromHash(hash) {
    var id = (hash || "").replace(/^#/, "").toLowerCase();
    for (var i = 0; i < ALL.length; i++) if (CITIES[ALL[i]].id === id) return ALL[i];
    return null;
  }

  function motionOK() { return hasGSAP && !reducedMotion.matches; }

  // Stable pseudo-random number from a string (seats, barcodes, stamp tilt)
  function hashCode(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function seatFor(flight) {
    var h = hashCode(flight);
    return (1 + (h % 28)) + "ABCDEF".charAt((h >>> 5) % 6);
  }

  function clock(date, tz) {
    try {
      return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(date);
    } catch (e) {
      return String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0");
    }
  }

  function shortDate(date) {
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  function coords(c) {
    var lat = Math.abs(c.lat).toFixed(2) + "°" + (c.lat >= 0 ? "N" : "S");
    var lon = Math.abs(c.lon).toFixed(2) + "°" + (c.lon >= 0 ? "E" : "W");
    return lat + " " + lon;
  }

  function passengerName() { return (state.passenger || "").trim() || "Guest Traveller"; }

  var toastTimer = null;
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  // Barcode as an SVG string, generated from text
  function barcode(text, height) {
    var h = hashCode(text), x = 0, bars = "";
    for (var i = 0; i < 46; i++) {
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      var w = 1 + (h % 3);
      if (i % 2 === 0) bars += '<rect x="' + x + '" y="0" width="' + w + '" height="' + height + '"/>';
      x += w + (i % 2 ? 1 : 0);
    }
    return '<svg class="barcode" viewBox="0 0 ' + x + " " + height + '" preserveAspectRatio="none" aria-hidden="true">' + bars + "</svg>";
  }

  var PLANE_PATH = "M14 0C14-1.2 12-2 10-2H3L-4-12h-3l4 10h-6l-3-4h-2l1.5 6-1.5 6h2l3-4h6l-4 10h3l7-10h7c2 0 4-.8 4-2z";
  function planeIcon(cls) {
    return '<svg class="' + (cls || "plane-ico") + '" viewBox="-16 -14 32 28" aria-hidden="true"><path d="' + PLANE_PATH + '"/></svg>';
  }

  /* ============================================================
   * 3. Map geometry
   * The SVG map uses an equirectangular projection in a 1000 x 500
   * space; the visible window is y 40..420 (viewBox "0 40 1000 380").
   * ============================================================ */
  var VIEW = { y: 40, h: 380 };

  function project(c) {
    return { x: (c.lon + 180) / 360 * 1000, y: (90 - c.lat) / 180 * 500 };
  }

  // Curved route: quadratic Bézier bowed "upwards" (towards the north)
  function routePath(fromKey, toKey) {
    var a = project(CITIES[fromKey]), b = project(CITIES[toKey]);
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    var dx = b.x - a.x, dy = b.y - a.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var nx = -dy / dist, ny = dx / dist;
    if (ny > 0) { nx = -nx; ny = -ny; }             // always bow north
    var bow = Math.min(dist * 0.32, 160);
    var cx = mx + nx * bow, cy = Math.max(VIEW.y + 8, my + ny * bow);
    return "M" + a.x.toFixed(1) + " " + a.y.toFixed(1) + "Q" + cx.toFixed(1) + " " + cy.toFixed(1) + " " + b.x.toFixed(1) + " " + b.y.toFixed(1);
  }

  function pinPosition(key) {
    var p = project(CITIES[key]);
    return { left: p.x / 10, top: (p.y - VIEW.y) / VIEW.h * 100 };   // percentages
  }

  function drawWorld() {
    $("#land").setAttribute("d", window.WORLD_DOTS || "");
    var g = "";
    for (var lon = -150; lon <= 150; lon += 30) g += '<line x1="' + (lon + 180) / 360 * 1000 + '" y1="40" x2="' + (lon + 180) / 360 * 1000 + '" y2="420"/>';
    for (var lat = -60; lat <= 60; lat += 30) g += '<line x1="0" y1="' + (90 - lat) / 180 * 500 + '" x2="1000" y2="' + (90 - lat) / 180 * 500 + '"/>';
    $("#graticule").innerHTML = g;
  }

  /* ============================================================
   * 4. Split-flap board
   * Each character is its own cell that rattles through random
   * characters before settling, like an airport departure board.
   * ============================================================ */
  var FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-:·";

  function flapCells(width) {
    var s = "";
    for (var i = 0; i < width; i++) s += '<span class="flap"><span> </span></span>';
    return s;
  }

  function flapSet(el, text) {
    var cells = $$(".flap", el);
    var target = String(text).toUpperCase().padEnd(cells.length).slice(0, cells.length);
    var animate = !reducedMotion.matches;
    cells.forEach(function (cell, i) {
      var inner = cell.firstChild;
      var finalChar = target.charAt(i);
      clearTimeout(cell._t);
      if (!animate || inner.textContent === finalChar) { inner.textContent = finalChar; return; }
      var steps = 3 + Math.floor(Math.random() * 4) + Math.floor(i / 2);
      (function tick() {
        cell.classList.remove("flip"); void cell.offsetWidth; cell.classList.add("flip");
        if (steps-- <= 0) { inner.textContent = finalChar; return; }
        inner.textContent = FLAP_CHARS.charAt(Math.floor(Math.random() * FLAP_CHARS.length));
        cell._t = setTimeout(tick, 55);
      })();
    });
    if (animate) Sound.flap();
  }

  /* ============================================================
   * 5. Renderers
   * ============================================================ */

  /* ---------- City poster art (simple silhouettes) ---------- */
  var SKYLINES = {
    // Chennai: temple gopuram, palms and the Bay of Bengal
    home: '<g class="far"><rect x="60" y="112" width="70" height="38"/><rect x="140" y="98" width="40" height="52"/><rect x="420" y="104" width="56" height="46"/><rect x="486" y="118" width="70" height="32"/></g>' +
      '<g class="near"><path d="M250 150h100l-6-18h-88zM258 132h84l-6-16h-72zM266 116h68l-6-15h-56zM274 101h52l-6-14h-40zM282 87h36l-5-13h-26zM288 74h24c0-10-24-10-24 0z"/><rect x="298" y="56" width="4" height="10"/>' +
      '<path d="M200 150h40l-4-12h-32zM204 138h32l-4-10h-24zM208 128h24c0-8-24-8-24 0z"/><path d="M360 150h40l-4-12h-32zM364 138h32l-4-10h-24zM368 128h24c0-8-24-8-24 0z"/>' +
      '<path d="M90 150c4-26 6-40 4-58M94 92c-14-6-24-2-30 6M94 92c12-8 24-6 30 2M94 92c-6-10-16-12-24-10M94 92c4-10 14-14 22-12" class="palm"/>' +
      '<path d="M520 150c-3-22-3-34 0-50M520 100c-12-6-22-2-28 6M520 100c10-8 22-6 28 2M520 100c-6-10-16-12-22-10M520 100c4-10 14-14 22-12" class="palm"/></g>',
    // San Francisco: Golden Gate Bridge over the bay
    projects: '<g class="far"><path d="M0 150c60-30 120-36 170-20s60 4 100-6 80 10 130 0 120-24 200 26z"/></g>' +
      '<g class="near"><rect x="160" y="40" width="12" height="110"/><rect x="420" y="40" width="12" height="110"/><rect x="156" y="62" width="20" height="5"/><rect x="156" y="90" width="20" height="5"/><rect x="416" y="62" width="20" height="5"/><rect x="416" y="90" width="20" height="5"/>' +
      '<rect x="0" y="112" width="600" height="6"/><path class="cable" d="M0 70Q83 112 166 42Q296 128 426 42Q513 112 600 70"/>' +
      '<path class="cable thin" d="M40 84v28M80 96v16M120 84v28M206 70v42M246 92v20M286 104v8M306 104v8M346 92v20M386 70v42M466 84v28M506 96v16M546 84v28"/></g>',
    // Tokyo: Mount Fuji, Tokyo Tower and towers
    skills: '<g class="far"><path d="M300 150 400 62l16 10 14-8 120 86z"/><path class="snow" d="M400 62l-26 23 14-4 12 8 14-9 16 6-30-24z"/></g>' +
      '<g class="near"><rect x="40" y="96" width="34" height="54"/><rect x="80" y="76" width="26" height="74"/><rect x="112" y="108" width="40" height="42"/><rect x="470" y="100" width="30" height="50"/><rect x="506" y="84" width="40" height="66"/>' +
      '<path d="M230 150l20-64h-8l14-46 4-24 4 24 14 46h-8l20 64h-14l-14-44h-4l-14 44z"/><rect x="238" y="86" width="44" height="6"/><rect x="246" y="52" width="28" height="5"/></g>',
    // London: Big Ben, the London Eye and the Thames
    languages: '<g class="far"><rect x="40" y="110" width="80" height="40"/><rect x="130" y="96" width="50" height="54"/><rect x="460" y="112" width="100" height="38"/></g>' +
      '<g class="near"><rect x="200" y="56" width="34" height="94"/><path d="M196 56h42l-21-34z"/><rect x="215" y="10" width="4" height="14"/><circle class="cut" cx="217" cy="74" r="10"/>' +
      '<rect x="234" y="104" width="120" height="46"/><path d="M240 104v-10h8v10M262 104v-10h8v10M284 104v-10h8v10M306 104v-10h8v10M328 104v-10h8v10"/>' +
      '<g class="wheel"><circle cx="430" cy="82" r="56" fill="none"/><path d="M430 26v112M374 82h112M390 42l80 80M470 42l-80 80"/></g><path d="M422 150l8-60 8 60z"/></g>',
    // Boston: a domed university hall and the Charles River
    education: '<g class="far"><rect x="20" y="92" width="40" height="58"/><rect x="66" y="74" width="30" height="76"/><rect x="480" y="86" width="36" height="64"/><rect x="522" y="66" width="44" height="84"/></g>' +
      '<g class="near"><path d="M200 96c0-56 200-56 200 0z"/><rect x="186" y="96" width="228" height="10"/><rect x="176" y="140" width="248" height="10"/><path d="M196 106h12v34h-12zM226 106h12v34h-12zM256 106h12v34h-12zM286 106h12v34h-12zM316 106h12v34h-12zM346 106h12v34h-12zM376 106h12v34h-12z"/>' +
      '<path d="M120 150h64v-30h-64zM416 150h64v-30h-64z"/></g>'
  };

  function poster(key) {
    return '<svg class="skyline" viewBox="0 0 600 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
      '<circle class="sun" cx="' + (key === "skills" ? 120 : 470) + '" cy="58" r="44"/>' + SKYLINES[key] +
      '<rect class="ground" x="0" y="148" width="600" height="2"/></svg>';
  }

  /* ---------- Departure board rows ---------- */
  var BOARD_COLS = [5, 7, 13, 2, 9]; // time, flight, destination, gate, remarks

  function boardRemarks(key, i) {
    if (state.visited.has(key)) return "VISITED";
    var firstOpen = DESTINATIONS.filter(function (k) { return !state.visited.has(k); })[0];
    return key === firstOpen ? "BOARDING" : "ON TIME";
  }

  function boardTime(i) {
    var d = new Date(Date.now() + (12 + i * 15) * 60000);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
    return clock(d, CITIES.home.tz);
  }

  function refreshBoard() {
    $$(".board-row").forEach(function (row, i) {
      var key = row.dataset.city, c = CITIES[key];
      var values = [boardTime(i), c.flight, c.city, c.gate, boardRemarks(key, i)];
      $$(".flap-group", row).forEach(function (g, j) {
        setTimeout(function () { flapSet(g, values[j]); }, i * 120 + j * 60);
      });
      row.classList.toggle("is-visited", state.visited.has(key));
      row.classList.toggle("is-boarding", values[4] === "BOARDING");
    });
  }

  /* ---------- HOME CITY: About Me ---------- */
  function renderHome() {
    var c = CITIES.home;
    var initials = P.name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2);
    var avatar = P.photo
      ? '<img src="' + esc(P.photo) + '" alt="Portrait of ' + esc(P.name) + '">'
      : '<span class="monogram" aria-hidden="true">' + esc(initials) + "</span>";

    // Machine-readable zone at the bottom of the passport page
    var mrzLine1 = ("P<IND" + P.name.toUpperCase().replace(/\s+/g, "<<") + "<".repeat(40)).slice(0, 44);
    var mrzLine2 = (P.role.toUpperCase().replace(/\s+/g, "<") + "<SWIFT<SWIFTUI<<" + "<".repeat(40)).slice(0, 44);

    var rows = DESTINATIONS.map(function (key) {
      var d = CITIES[key];
      return '<li><button class="board-row" data-city="' + key + '" data-action="pick" aria-label="Board flight ' + d.flight + " to " + d.city + ", " + d.section + '">' +
        BOARD_COLS.map(function (w) { return '<span class="flap-group">' + flapCells(w) + "</span>"; }).join("") +
        '<span class="board-section mono">' + esc(d.section) + "</span></button></li>";
    }).join("");

    var links = [
      ["Email", "mailto:" + P.contact.email, P.contact.email],
      ["GitHub", P.contact.github, P.contact.github.replace(/^https?:\/\/(www\.)?/, "")],
      ["LinkedIn", P.contact.linkedin, "linkedin.com/in/jahaan-suthar"]
    ].map(function (l) {
      return '<li><span class="mono">' + l[0] + '</span><a href="' + esc(l[1]) + '"' + (l[1].indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : "") + ">" + esc(l[2]) + "</a></li>";
    }).join("");

    $("#scene-home").innerHTML =
      '<header class="terminal-sign reveal">' +
        '<div class="sign-text">' +
          '<p class="eyebrow mono">' + esc(c.city) + " International · Terminal 1 · " + esc(c.section) + "</p>" +
          '<h1 class="display city-title" id="home-title" tabindex="-1">' + esc(c.city) + "</h1>" +
          '<p class="sign-meta mono"><span>' + c.code + "</span><span>" + coords(c) + '</span><span>Local time <b data-clock="' + c.tz + '">' + clock(new Date(), c.tz) + "</b></span></p>" +
        "</div>" + poster("home") +
      "</header>" +

      '<div class="home-grid">' +
        '<article class="id-card reveal" aria-labelledby="id-name">' +
          '<header class="id-head mono"><span>Passport · Passeport</span><span>Type P · IND</span></header>' +
          '<div class="id-body">' +
            '<div class="id-photo">' + avatar + '<span class="id-photo-stamp mono">' + c.code + "</span></div>" +
            '<div class="id-fields">' +
              '<p class="field"><span class="mono">Surname / Given name</span><b id="id-name" class="id-name">' + esc(P.name) + "</b></p>" +
              '<p class="field"><span class="mono">Occupation</span><b>' + esc(P.role) + "</b></p>" +
              '<p class="field"><span class="mono">Based in</span><b>' + esc(P.location) + "</b></p>" +
            "</div>" +
          "</div>" +
          '<div class="id-bio">' + P.bio.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" +
          '<ul class="id-links">' + links + "</ul>" +
          '<div class="id-actions"><a class="btn btn-ghost" href="' + esc(P.resume) + '" target="_blank" rel="noopener">Download résumé <span aria-hidden="true">↓</span></a></div>' +
          '<p class="mrz mono" aria-hidden="true">' + esc(mrzLine1) + "<br>" + esc(mrzLine2) + "</p>" +
        "</article>" +

        '<div class="home-col">' +
        '<section class="board reveal" aria-labelledby="board-title">' +
          '<header class="board-head"><h2 id="board-title" class="mono">Departures</h2><span class="mono board-clock" data-clock="' + c.tz + '">' + clock(new Date(), c.tz) + "</span></header>" +
          '<div class="board-cols mono" aria-hidden="true"><span>Time</span><span>Flight</span><span>Destination</span><span>Gate</span><span>Remarks</span></div>' +
          '<ol class="board-rows">' + rows + "</ol>" +
          '<p class="board-foot mono">Tap any flight to board it directly</p>' +
        "</section>" +
        '<aside class="now-card reveal"><p class="eyebrow mono">Now boarding · side project</p><p>' + esc(P.now) + "</p></aside>" +
        "</div>" +
      "</div>" +

      '<div class="board-cta reveal">' +
        '<button class="btn btn-board" data-action="board">Board Your Flight <span class="plane-glyph" aria-hidden="true">✈</span></button>' +
        '<p class="mono">4 destinations · any order · free upgrades</p>' +
      "</div>" +

      '<div class="home-extra">' +
        '<ul class="tags-row reveal">' + P.stats.map(function (s) {
          return '<li class="bag-tag"><b>' + esc(s.value) + '</b><span>' + esc(s.label) + "</span></li>";
        }).join("") + "</ul>" +
      "</div>";

    refreshBoard();
  }

  /* ---------- PROJECTS: postcards ---------- */
  var POSTCARD_ART = {
    harbour: '<rect class="pa-sky" width="300" height="180"/><circle class="pa-sun" cx="220" cy="70" r="34"/><path class="pa-hill" d="M0 120c50-30 90-30 130-10s90 10 170-20v90H0z"/>' +
      '<rect class="pa-ink" x="70" y="40" width="7" height="90"/><rect class="pa-ink" x="200" y="40" width="7" height="90"/><rect class="pa-ink" x="0" y="112" width="300" height="5"/>' +
      '<path class="pa-line" d="M0 70Q36 112 73 42Q140 126 203 42Q250 112 300 70"/><path class="pa-sea" d="M0 140h300v40H0z"/><path class="pa-wave" d="M10 152h40M80 162h50M170 150h40M230 166h50"/>',
    campus: '<rect class="pa-sky" width="300" height="180"/><circle class="pa-sun" cx="70" cy="60" r="30"/><path class="pa-hill" d="M0 140c80-24 160-24 300 0v40H0z"/>' +
      '<path class="pa-ink" d="M100 92c0-40 100-40 100 0z"/><rect class="pa-ink" x="90" y="92" width="120" height="8"/><path class="pa-ink" d="M98 100h8v36h-8zM122 100h8v36h-8zM146 100h8v36h-8zM170 100h8v36h-8zM194 100h8v36h-8z"/><rect class="pa-ink" x="84" y="134" width="132" height="8"/>' +
      '<circle class="pa-tree" cx="40" cy="122" r="18"/><circle class="pa-tree" cx="258" cy="118" r="22"/><rect class="pa-ink" x="38" y="128" width="4" height="16"/><rect class="pa-ink" x="256" y="126" width="4" height="18"/>',
    city: '<rect class="pa-sky" width="300" height="180"/><circle class="pa-sun" cx="236" cy="54" r="28"/>' +
      '<path class="pa-ink" d="M20 180V100h30v80zM56 180V70h34v110zM96 180V120h24v60zM126 180V84h40v96zM172 180V110h28v70zM206 180V60h36v120zM248 180V104h32v76z"/>' +
      '<path class="pa-win" d="M62 80h6v6h-6zM76 80h6v6h-6zM62 96h6v6h-6zM76 96h6v6h-6zM134 94h6v6h-6zM150 94h6v6h-6zM134 110h6v6h-6zM214 72h6v6h-6zM228 72h6v6h-6zM214 88h6v6h-6zM228 104h6v6h-6z"/>' +
      '<path class="pa-line chart" d="M10 150 60 128 110 136 160 104 210 112 290 70"/>'
  };

  function renderProjects() {
    return '<div class="postcards">' + P.projects.map(function (p, i) {
      var links = "";
      if (p.links.live) links += '<a class="btn btn-small" href="' + esc(p.links.live) + '" target="_blank" rel="noopener">Live demo ↗</a>';
      if (p.links.code) links += '<a class="btn btn-small btn-ghost" href="' + esc(p.links.code) + '" target="_blank" rel="noopener">GitHub ↗</a>';
      if (!links) links = '<span class="mono muted small">Code &amp; demo on request</span>';
      return '<article class="postcard reveal" style="--tilt:' + [-1.4, 1.1, -0.6][i % 3] + 'deg">' +
        '<div class="postcard-inner">' +
          '<div class="pc-face pc-front">' +
            '<svg class="pc-art" viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + POSTCARD_ART[p.postcard || "city"] + "</svg>" +
            '<div class="pc-title"><span class="mono">Greetings from</span><h3 class="display">' + esc(p.name) + "</h3></div>" +
            '<span class="pc-stamp" aria-hidden="true"><span class="mono">' + esc(p.year) + "</span>" + planeIcon() + "</span>" +
            '<span class="pc-postmark mono" aria-hidden="true">SFO<br>' + esc(p.kind.toUpperCase()) + "</span>" +
          "</div>" +
          '<div class="pc-face pc-back">' +
            '<div class="pc-message">' +
              '<p class="pc-kind mono">' + esc(p.kind) + " · " + esc(p.year) + "</p>" +
              '<h3 class="pc-name">' + esc(p.name) + "</h3>" +
              '<p class="pc-summary">' + esc(p.summary) + "</p>" +
              "<ul>" + p.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" +
            "</div>" +
            '<div class="pc-address">' +
              '<p class="mono small">Role</p><p class="pc-role">' + esc(p.role) + "</p>" +
              '<p class="mono small">Tech stack</p><ul class="chips">' + p.tech.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
              '<div class="pc-links">' + links + "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<button class="pc-flip mono" data-action="flip" aria-pressed="false">Flip postcard <span aria-hidden="true">↻</span></button>' +
      "</article>";
    }).join("") + "</div>";
  }

  /* ---------- SKILLS: passport stamps ---------- */
  var LEVELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

  function renderSkills() {
    return '<p class="legend mono">Proficiency: <span class="dots">●○○○</span> Beginner · <span class="dots">●●○○</span> Intermediate · <span class="dots">●●●○</span> Advanced · <span class="dots">●●●●</span> Expert</p>' +
      '<div class="stamp-pages">' + P.skills.map(function (g, gi) {
        return '<section class="stamp-page reveal ink-' + (gi % 5) + '">' +
          '<header><h3 class="display">' + esc(g.group) + '</h3><p class="mono small">' + esc(g.note) + "</p></header>" +
          '<ul class="skill-stamps">' + g.items.map(function (s, si) {
            var tilt = (hashCode(s.name) % 13) - 6;
            var shape = ["round", "rect", "oval"][(gi + si) % 3];
            return '<li class="skill-stamp ' + shape + '" style="--tilt:' + tilt + 'deg" aria-label="' + esc(s.name) + ", " + LEVELS[s.level] + '">' +
              '<span class="mono st-top">' + esc(CITIES.skills.code) + " · " + esc(g.group.toUpperCase()) + "</span>" +
              '<b class="st-name">' + esc(s.name) + "</b>" +
              '<span class="st-dots" aria-hidden="true">' + "●●●●".slice(0, s.level) + "○○○○".slice(s.level) + "</span>" +
              '<span class="mono st-level">' + LEVELS[s.level] + "</span></li>";
          }).join("") + "</ul></section>";
      }).join("") + "</div>";
  }

  /* ---------- LANGUAGES: exchange board + luggage tags ---------- */
  function renderLanguages() {
    var rows = P.codeLanguages.map(function (l) {
      return '<li class="fx-row" data-code="' + esc(l.code) + '" data-name="' + esc(l.name) + '" data-level="' + esc(l.level) + '">' +
        '<span class="flap-group fx-code">' + flapCells(3) + "</span>" +
        '<span class="flap-group fx-name">' + flapCells(10) + "</span>" +
        '<span class="flap-group fx-level">' + flapCells(12) + "</span>" +
        '<span class="fx-rate"><span class="fx-bar" style="--rate:' + l.rate + '%"></span><b class="mono">' + l.rate + "</b></span>" +
        '<span class="sr-only">' + esc(l.name) + ": " + esc(l.level) + "</span></li>";
    }).join("");

    var tags = P.spokenLanguages.map(function (l, i) {
      return '<li class="lug-tag reveal" style="--tilt:' + [-4, 3, -2][i % 3] + 'deg">' +
        '<span class="lug-hole" aria-hidden="true"></span>' +
        '<p class="mono small">Spoken language</p>' +
        '<h3 class="display">' + esc(l.name) + "</h3>" +
        '<dl class="mono"><div><dt>Level</dt><dd>' + esc(l.level) + "</dd></div><div><dt>Origin</dt><dd>" + esc(l.origin) + "</dd></div></dl>" +
        barcode(l.name, 24) + "</li>";
    }).join("");

    return '<section class="exchange reveal" aria-labelledby="fx-title">' +
        '<header class="fx-head"><h3 id="fx-title" class="mono">Bureau de change · Programming languages</h3><span class="mono fx-clock">Rates live <b data-clock="' + CITIES.languages.tz + '">' + clock(new Date(), CITIES.languages.tz) + "</b></span></header>" +
        '<div class="fx-cols mono" aria-hidden="true"><span>Code</span><span>Language</span><span>Level</span><span>Rate</span></div>' +
        '<ol class="fx-rows">' + rows + "</ol>" +
      "</section>" +
      '<h3 class="sub-title display reveal">Spoken languages</h3>' +
      '<ul class="lug-tags">' + tags + "</ul>";
  }

  /* ---------- EDUCATION: flight log ---------- */
  function renderEducation() {
    return '<ol class="flight-log">' + P.education.map(function (e, i) {
      var leg = "LEG " + String(i + 1).padStart(2, "0");
      return '<li class="leg reveal">' +
        '<div class="leg-when mono"><b>' + esc(e.from) + "</b>" + (e.to ? "<span>→ " + esc(e.to) + "</span>" : "") + "</div>" +
        '<div class="leg-node" aria-hidden="true">' + planeIcon() + "</div>" +
        '<article class="leg-card">' +
          '<header class="leg-head mono"><span>' + leg + " · " + esc(e.type) + '</span><span class="leg-status ' + (e.status === "Landed" ? "landed" : "") + '">' + esc(e.status) + "</span></header>" +
          "<h3>" + esc(e.title) + "</h3>" +
          '<p class="leg-org">' + esc(e.org) + "</p>" +
          "<ul>" + e.highlights.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>" +
          (e.photo ? '<figure class="leg-photo"><img src="' + esc(e.photo) + '" alt="' + esc(e.title) + '" loading="lazy"><figcaption class="mono small">' + esc(e.org) + "</figcaption></figure>" : "") +
        "</article></li>";
    }).join("") + "</ol>";
  }

  var CITY_RENDERERS = { projects: renderProjects, skills: renderSkills, languages: renderLanguages, education: renderEducation };
  var CITY_INTROS = {
    projects: "Three things I've built and shipped. Tap a postcard to flip it over.",
    skills: "Every skill is a visa stamp, grouped by the part of the stack it belongs to.",
    languages: "Today's exchange rates for the languages I write, and the ones I speak.",
    education: "My flight log so far: degree, internship and a trophy from the cricket pitch."
  };

  /* ---------- DESTINATION CITY ---------- */
  function renderCity(key, fromKey) {
    var c = CITIES[key], from = CITIES[fromKey || "home"];
    var next = DESTINATIONS.filter(function (k) { return !state.visited.has(k) && k !== key; });
    $("#scene-city").innerHTML =
      '<header class="arrival">' +
        '<div class="arrival-text">' +
          '<p class="eyebrow mono arrival-meta">Arrived · Flight ' + c.flight + " from " + esc(from.city) + " (" + from.code + ") · Gate " + c.gate + ' · Local time <b data-clock="' + c.tz + '">' + clock(new Date(), c.tz) + "</b></p>" +
          '<h1 class="display city-title" id="city-title" tabindex="-1"><span class="welcome">Welcome to</span> ' + esc(c.city) + "</h1>" +
          '<p class="section-tag mono"><span>' + c.code + "</span>" + esc(c.section) + "</p>" +
          '<p class="intro">' + CITY_INTROS[key] + "</p>" +
        "</div>" + poster(key) +
      "</header>" +
      '<div class="city-body city-' + key + '">' + CITY_RENDERERS[key]() + "</div>" +
      '<footer class="city-foot reveal">' +
        '<p class="mono small">' + (next.length ? "Still to visit: " + next.map(function (k) { return CITIES[k].city; }).join(", ") : "Every city visited. Thanks for flying with me.") + "</p>" +
        '<div class="foot-actions">' +
          '<button class="btn btn-board" data-action="board">Board Next Flight <span class="plane-glyph" aria-hidden="true">✈</span></button>' +
          '<button class="btn btn-ghost" data-action="home">Return Home <span aria-hidden="true">⌂</span></button>' +
        "</div>" +
      "</footer>";

    // Exchange board flaps in after render
    if (key === "languages") {
      $$(".fx-row").forEach(function (row, i) {
        setTimeout(function () {
          flapSet($(".fx-code", row), row.dataset.code);
          flapSet($(".fx-name", row), row.dataset.name);
          flapSet($(".fx-level", row), row.dataset.level);
        }, reducedMotion.matches ? 0 : 500 + i * 160);
      });
    }
  }

  /* ---------- Map pins & mobile destination list ---------- */
  function cityStatus(key) {
    if (key === state.current) return "here";
    if (state.visited.has(key) && key !== "home") return "visited";
    return "open";
  }

  function renderMap() {
    var cur = CITIES[state.current];
    $("#map-title").textContent = "Choose your destination";
    $("#map-origin").textContent = "Departing from " + cur.city + " (" + cur.code + ") · " + passengerName();

    $("#pins").innerHTML = ALL.map(function (key) {
      var c = CITIES[key], pos = pinPosition(key), status = cityStatus(key);
      var tip = key === "home" ? "Flight " + c.flight + " → Return home · Gate " + c.gate : "Flight " + c.flight + " → " + c.section + " · Gate " + c.gate;
      if (status === "here") tip = "You are here · " + c.section;
      var tipSide = pos.left > 70 ? "tip-left" : pos.left < 20 ? "tip-right" : "";
      return '<button class="pin is-' + status + (key === "home" ? " is-home" : "") + " " + tipSide + '" style="left:' + pos.left + "%;top:" + pos.top + '%" data-city="' + key + '" data-action="pick"' +
        ' aria-label="' + esc(c.city + ", " + c.section + ". " + tip + (status === "visited" ? ". Visited" : "")) + '">' +
        '<span class="pin-dot" aria-hidden="true"></span>' +
        '<span class="pin-label mono" aria-hidden="true"><b>' + c.code + "</b> " + esc(key === "home" ? "Home" : c.section) + "</span>" +
        (status === "visited" ? '<span class="pin-stamp mono" aria-hidden="true">Visited</span>' : "") +
        '<span class="pin-tip mono" aria-hidden="true">' + esc(tip) + "</span>" +
      "</button>";
    }).join("");

    $("#dest-list").innerHTML = DESTINATIONS.concat(state.current !== "home" ? ["home"] : []).map(function (key) {
      var c = CITIES[key], status = cityStatus(key);
      return '<li><button class="dest is-' + status + '" data-city="' + key + '" data-action="pick">' +
        '<span class="dest-code display">' + c.code + "</span>" +
        '<span class="dest-main"><b>' + esc(key === "home" ? "Return home" : c.section) + "</b><span>" + esc(c.city) + "</span></span>" +
        '<span class="dest-meta mono">' + c.flight + "<br>Gate " + c.gate + "</span>" +
        '<span class="dest-status mono">' + (status === "here" ? "You are here" : status === "visited" ? "Visited" : "Boarding") + "</span>" +
      "</button></li>";
    }).join("");
  }

  /* ---------- Boarding pass ---------- */
  function renderPass(toKey) {
    var from = CITIES[state.current], to = CITIES[toKey];
    var now = new Date();
    var boarding = new Date(now.getTime() + 2 * 60000);
    $("#pass").innerHTML =
      '<div class="pass-main">' +
        '<header class="pass-head"><span class="brand-text">Jahaan<b>Air</b></span><span class="mono">Boarding pass · Business</span></header>' +
        '<div class="pass-route">' +
          '<div class="pass-city"><span class="code display">' + from.code + '</span><span class="mono">' + esc(from.city) + "</span></div>" +
          '<div class="pass-line" aria-hidden="true">' + planeIcon() + "</div>" +
          '<div class="pass-city to"><span class="code display">' + to.code + '</span><span class="mono">' + esc(to.city) + "</span></div>" +
        "</div>" +
        '<h2 class="sr-only" id="pass-title">Boarding pass: ' + esc(from.city) + " to " + esc(to.city) + ", " + esc(toKey === "home" ? "About Me" : to.section) + "</h2>" +
        '<dl class="pass-grid mono">' +
          '<div class="wide"><dt><label for="pass-name">Passenger</label></dt><dd><input id="pass-name" maxlength="28" autocomplete="name" placeholder="Guest Traveller" value="' + esc(state.passenger) + '"></dd></div>' +
          "<div><dt>Flight</dt><dd>" + to.flight + "</dd></div>" +
          "<div><dt>Gate</dt><dd>" + to.gate + "</dd></div>" +
          "<div><dt>Seat</dt><dd>" + seatFor(to.flight + from.code) + "</dd></div>" +
          "<div><dt>Boarding</dt><dd>" + clock(boarding, from.tz) + "</dd></div>" +
          "<div><dt>Date</dt><dd>" + shortDate(now) + "</dd></div>" +
          '<div><dt>Purpose</dt><dd>' + esc(toKey === "home" ? "About Me" : to.section) + "</dd></div>" +
        "</dl>" +
        barcode(to.flight + from.code + passengerName(), 40) +
      "</div>" +
      '<div class="pass-stub mono" aria-hidden="true">' +
        "<p><span>Flight</span><b>" + to.flight + "</b></p><p><span>From</span><b>" + from.code + "</b></p><p><span>To</span><b>" + to.code + "</b></p><p><span>Seat</span><b>" + seatFor(to.flight + from.code) + "</b></p>" +
        '<span class="stub-zone">Zone 1</span>' +
      "</div>" +
      '<div class="pass-actions">' +
        '<button class="btn btn-board" data-action="takeoff">Take off <span class="plane-glyph" aria-hidden="true">✈</span></button>' +
        '<button class="btn btn-ghost" data-action="cancel-pass">Change destination</button>' +
      "</div>";
  }

  /* ---------- Passport widget ---------- */
  function renderPassport() {
    var count = ALL.filter(function (k) { return state.visited.has(k); }).length;
    $("#passport-count").textContent = count;
    $("#passport-total").textContent = ALL.length;
    $("#passport").classList.toggle("complete", count === ALL.length);
    $("#stamp-grid").innerHTML = ALL.map(function (key, i) {
      var c = CITIES[key];
      if (!state.visited.has(key)) return '<div class="stamp-slot empty"><span class="mono">' + c.code + "</span></div>";
      var tilt = (hashCode(key) % 17) - 8;
      return '<div class="stamp-slot"><div class="visa ink-' + (i % 5) + (i % 2 ? " oval" : "") + '" style="--tilt:' + tilt + 'deg" data-city="' + key + '">' +
        '<span class="mono">' + esc(c.city.toUpperCase()) + "</span><b>" + c.code + '</b><span class="mono">' + esc(state.stampedAt[key] || "") + "</span></div></div>";
    }).join("");
    $("#passport-note").textContent = count === ALL.length
      ? "Journey complete. Every city stamped."
      : count + " of " + ALL.length + " cities visited. " + (ALL.length - count) + " to go.";
  }

  function renderComplete() {
    $("#complete-card").innerHTML =
      '<p class="eyebrow mono">All ' + ALL.length + " cities stamped · " + esc(passengerName()) + "</p>" +
      '<h2 class="display" id="complete-title">Journey Complete <span aria-hidden="true">🌍</span></h2>' +
      "<p>You've seen it all: projects, skills, languages and education. Thanks for flying JahaanAir. If you liked the trip, let's build something together.</p>" +
      '<div class="complete-stamps" aria-hidden="true">' + ALL.map(function (k, i) {
        return '<span class="visa small ink-' + (i % 5) + '" style="--tilt:' + ((hashCode(k) % 17) - 8) + 'deg"><b>' + CITIES[k].code + "</b></span>";
      }).join("") + "</div>" +
      '<div class="complete-actions">' +
        '<a class="btn btn-board" href="' + esc(P.contact.bookCall) + '">Let\'s work together – Book a call</a>' +
        '<a class="btn btn-ghost" href="' + esc(P.resume) + '" target="_blank" rel="noopener">Download résumé</a>' +
        '<button class="text-btn" data-action="close-complete">Keep exploring</button>' +
      "</div>";
  }

  /* ============================================================
   * 6. Navigation: map → boarding pass → flight → arrival
   * ============================================================ */
  var lastFocus = null;

  function showOverlay(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.classList.add("no-scroll");
    if (motionOK()) gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
  }

  function hideOverlay(el, cb) {
    function done() {
      el.hidden = true;
      if (hasGSAP) gsap.set(el, { clearProps: "opacity,visibility" });
      if (!$$(".overlay").some(function (o) { return !o.hidden; })) document.body.classList.remove("no-scroll");
      if (cb) cb();
    }
    if (el.hidden) { if (cb) cb(); return; }
    if (motionOK()) gsap.to(el, { autoAlpha: 0, duration: 0.25, onComplete: done }); else done();
  }

  function openMap() {
    if (state.flying) return;
    renderMap();
    var overlay = $("#map-overlay");
    overlay.classList.remove("flying", "mobile-flight");
    $("#hud").hidden = true;
    $("#mini-flight").hidden = true;
    if (overlay.hidden) showOverlay(overlay);
    if (motionOK() && !smallScreen.matches) {
      gsap.fromTo(".pin", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.06, ease: "back.out(2)", delay: 0.15, clearProps: "transform,opacity" });
    }
    setTimeout(function () {
      var first = smallScreen.matches ? $(".dest") : $(".pin:not(.is-here)");
      if (first) first.focus({ preventScroll: true });
    }, 60);
  }

  function closeMap() { hideOverlay($("#map-overlay"), restoreFocus); }

  function restoreFocus() { if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); }

  // A destination was picked (map pin, list row, or departure board)
  function pick(key) {
    if (state.flying) return;
    if (key === state.current) {
      toast("You're already in " + CITIES[key].city + ".");
      return;
    }
    state.target = key;
    if ($("#map-overlay").hidden) { renderMap(); showOverlay($("#map-overlay")); }
    renderPass(key);
    var overlay = $("#pass-overlay");
    overlay.hidden = false;
    if (motionOK()) {
      gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
      gsap.fromTo("#pass", { y: 60, rotate: -3, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 0.55, ease: "back.out(1.4)" });
    }
    Sound.ding();
    setTimeout(function () { var b = $('[data-action="takeoff"]'); if (b) b.focus({ preventScroll: true }); }, 50);
  }

  function cancelPass() {
    hideOverlay($("#pass-overlay"), function () {
      var pin = $('.pin[data-city="' + state.target + '"]') || $('.dest[data-city="' + state.target + '"]');
      if (pin) pin.focus({ preventScroll: true });
    });
  }

  var flightTL = null, stopEngine = function () {}, flightDone = null;

  function takeoff() {
    var to = state.target;
    if (!to || state.flying) return;
    state.flying = true;
    var from = state.current;
    $("#map-title").textContent = "Now flying to " + CITIES[to].city;

    // Tear the pass off: slide it up and away
    var passOverlay = $("#pass-overlay");
    var afterPass = function () {
      passOverlay.hidden = true;
      if (hasGSAP) gsap.set([passOverlay, "#pass"], { clearProps: "all" });
      if (!motionOK()) return quickArrive(from, to);
      if (smallScreen.matches) miniFlight(from, to); else mapFlight(from, to);
    };
    if (motionOK()) gsap.to("#pass", { y: -80, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: afterPass });
    else afterPass();
  }

  // Reduced motion or no GSAP: a quick fade instead of the flight
  function quickArrive(from, to) {
    var overlay = $("#map-overlay");
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
    arrive(to, from);
  }

  function hudUpdate(alt, speed, remaining) {
    $("#hud-alt").textContent = Math.round(alt).toLocaleString("en-US");
    $("#hud-speed").textContent = Math.round(speed);
    var s = Math.max(0, Math.ceil(remaining));
    $("#hud-eta").textContent = "00:" + String(s).padStart(2, "0");
  }

  function hudMsg(msg) { $("#hud-msg").textContent = msg; }

  // Shared flight timeline; `svgPlane` follows `routeEl`, `maskPath` reveals the dashed route
  function buildFlight(opts) {
    var to = CITIES[opts.to];
    var L = opts.maskPath.getTotalLength();
    var telemetry = { alt: 0, speed: 0 };
    var hud = $("#hud");
    hud.hidden = false;
    $("#hud-flight").textContent = to.flight;
    hudUpdate(0, 0, opts.total);
    hudMsg("Taxiing to runway");

    gsap.set(opts.maskPath, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set(opts.plane, { opacity: 1, scale: opts.small, transformOrigin: "50% 50%" });

    var tl = gsap.timeline({
      onUpdate: function () { hudUpdate(telemetry.alt, telemetry.speed, tl.duration() - tl.time()); }
    });

    var mp = function (start, end) {
      return { path: opts.route, align: opts.route, alignOrigin: [0.5, 0.5], autoRotate: true, start: start, end: end };
    };

    // a. Taxi slowly along the first few percent of the route
    tl.to(opts.plane, { motionPath: mp(0, 0.04), duration: opts.taxi, ease: "power1.in" }, 0)
      .to(opts.maskPath, { strokeDashoffset: L * 0.96, duration: opts.taxi, ease: "power1.in" }, 0)
      .to(telemetry, { speed: 140, duration: opts.taxi }, 0)
      .add(function () { hudMsg("Cleared for take-off"); }, opts.taxi * 0.7);

    // b. Take off, cruise and land along the curve while the route draws itself
    var t0 = opts.taxi, d = opts.cruise;
    tl.to(opts.plane, { motionPath: mp(0.04, 1), duration: d, ease: "power1.inOut" }, t0)
      .to(opts.maskPath, { strokeDashoffset: 0, duration: d, ease: "power1.inOut" }, t0)
      .to(opts.plane, { scale: opts.big, duration: d * 0.35, ease: "power2.out" }, t0)
      .to(opts.plane, { scale: opts.small, duration: d * 0.3, ease: "power2.in" }, t0 + d * 0.7)
      .to(telemetry, { alt: 35000, speed: 485, duration: d * 0.35, ease: "power2.out" }, t0)
      .to(telemetry, { alt: 0, speed: 130, duration: d * 0.3, ease: "power2.in" }, t0 + d * 0.7)
      .add(function () { hudMsg("Cruising altitude 35,000 ft"); }, t0 + d * 0.3)
      .add(function () { hudMsg("Beginning descent into " + to.city); }, t0 + d * 0.68)
      .add(function () { hudMsg("Welcome to " + to.city); Sound.ding(); }, t0 + d * 0.98);

    // c. In-flight clouds drift past at different speeds (parallax)
    if (opts.clouds) {
      var clouds = $$("#clouds .cloud");
      tl.to("#clouds", { autoAlpha: 1, duration: 0.4 }, t0 + d * 0.2)
        .to("#clouds", { autoAlpha: 0, duration: 0.5 }, t0 + d * 0.72);
      clouds.forEach(function (c, i) {
        tl.fromTo(c, { xPercent: 0, x: window.innerWidth * (0.9 + i * 0.12) },
          { x: -window.innerWidth * (0.6 + i * 0.1), duration: d * (0.55 + i * 0.07), ease: "none" }, t0 + d * 0.15);
      });
    }
    return tl;
  }

  function mapFlight(from, to) {
    var overlay = $("#map-overlay");
    overlay.classList.add("flying");
    $$(".pin").forEach(function (p) { p.classList.toggle("is-endpoint", p.dataset.city === from || p.dataset.city === to); });

    var d = routePath(from, to);
    $("#route").setAttribute("d", d);
    $("#route-ghost").setAttribute("d", d);
    $("#route-mask-path").setAttribute("d", d);

    stopEngine = Sound.engine(4.6);
    var dest = pinPosition(to);
    flightTL = buildFlight({
      to: to, route: "#route", maskPath: $("#route-mask-path"), plane: "#plane",
      taxi: 0.6, cruise: 3.0, total: 4.5, small: 0.7, big: 1.35, clouds: true
    });
    // d. Land, then the camera zooms into the destination city
    flightTL.to("#map-stage", { scale: 3.2, transformOrigin: dest.left + "% " + dest.top + "%", duration: 0.9, ease: "power2.in" })
      .to(overlay, { autoAlpha: 0, duration: 0.35 }, "-=0.35");
    flightDone = function () { finishFlight(from, to); };
    flightTL.eventCallback("onComplete", flightDone);
  }

  // Mobile: a simplified flight across a small arc between the two airport codes
  function miniFlight(from, to) {
    var overlay = $("#map-overlay");
    overlay.classList.add("flying", "mobile-flight");
    $("#mini-from").textContent = CITIES[from].code;
    $("#mini-to").textContent = CITIES[to].code;
    $("#mini-flight").hidden = false;
    stopEngine = Sound.engine(3);
    flightTL = buildFlight({
      to: to, route: "#mini-route", maskPath: $("#mini-mask-path"), plane: "#mini-plane",
      taxi: 0.35, cruise: 2.1, total: 2.9, small: 0.8, big: 1.25, clouds: false
    });
    flightTL.to(overlay, { autoAlpha: 0, duration: 0.35 });
    flightDone = function () { finishFlight(from, to); };
    flightTL.eventCallback("onComplete", flightDone);
  }

  function skipFlight() {
    if (!state.flying || !flightTL) return;
    var done = flightDone;
    flightTL.kill();
    flightTL = null;
    stopEngine();
    if (done) done();
  }

  function finishFlight(from, to) {
    if (!state.flying) return;
    flightDone = null;
    var overlay = $("#map-overlay");
    overlay.hidden = true;
    overlay.classList.remove("flying", "mobile-flight");
    $("#hud").hidden = true;
    $("#mini-flight").hidden = true;
    gsap.set([overlay, "#map-stage", "#clouds", "#plane", "#mini-plane", ".cloud"], { clearProps: "all" });
    $("#plane").setAttribute("opacity", "0");
    $("#route").removeAttribute("d"); $("#route-ghost").removeAttribute("d");
    document.body.classList.remove("no-scroll");
    arrive(to, from);
  }

  // Land in a city: render it, stamp the passport, update the URL
  function arrive(to, from, opts) {
    opts = opts || {};
    state.flying = false;
    state.current = to;
    var firstVisit = !state.visited.has(to);
    state.visited.add(to);
    if (!state.stampedAt[to]) state.stampedAt[to] = shortDate(new Date());
    saveState();

    var id = CITIES[to].id;
    if (!opts.fromHistory && location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    document.title = (to === "home" ? P.name + " · " + P.role : CITIES[to].section + " · " + CITIES[to].city + " · " + P.name);

    var home = $("#scene-home"), city = $("#scene-city");
    if (to === "home") {
      city.hidden = true; city.innerHTML = "";
      home.hidden = false;
      refreshBoard();
    } else {
      renderCity(to, from);
      home.hidden = true;
      city.hidden = false;
    }
    updateTopbar();
    window.scrollTo(0, 0);

    var scene = to === "home" ? home : city;
    playArrival(scene, to);
    var title = $(".city-title", scene);
    if (title && !opts.initial) title.focus({ preventScroll: true });

    renderPassport();
    if (firstVisit && to !== "home") {
      setTimeout(function () {
        Sound.stamp();
        toast("Passport stamped: " + CITIES[to].city);
        var btn = $("#passport-btn");
        btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
      }, opts.initial ? 400 : 900);
    }
    if (state.visited.size === ALL.length && !state.completeShown) {
      state.completeShown = true;
      saveState();
      setTimeout(function () { renderComplete(); showOverlay($("#complete-overlay")); Sound.ding(); var b = $('#complete-card .btn'); if (b) b.focus({ preventScroll: true }); }, 1800);
    }
  }

  // Arrival banner first, then the content slides in
  function playArrival(scene, key) {
    if (!motionOK()) {
      scene.classList.remove("fade-in"); void scene.offsetWidth; scene.classList.add("fade-in");
      return;
    }
    var tl = gsap.timeline();
    if (key !== "home") {
      tl.from(".arrival .welcome", { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" })
        .from(".arrival .city-title", { y: 40, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.2")
        .from(".arrival .arrival-meta, .arrival .section-tag, .arrival .intro", { y: 16, opacity: 0, stagger: 0.08, duration: 0.4 }, "-=0.3")
        .from(".arrival .skyline", { y: 30, opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.6");
    }
    var reveals = $$(".reveal", scene);
    tl.from(reveals, { y: 40, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out", clearProps: "transform,opacity" }, key === "home" ? 0 : "-=0.3");
    if (key === "skills") {
      tl.from(".skill-stamp", { scale: 1.8, opacity: 0, duration: 0.35, stagger: 0.035, ease: "back.out(2.5)", clearProps: "transform,opacity",
        onStart: function () { Sound.stamp(); } }, "-=0.4");
    }
  }

  // Back / forward buttons and manual hash edits: jump without the full flight
  function goDirect(key, fromHistory) {
    if (!key || key === state.current || state.flying) return;
    ["#map-overlay", "#pass-overlay"].forEach(function (s) { $(s).hidden = true; });
    document.body.classList.remove("no-scroll");
    arrive(key, state.current, { fromHistory: fromHistory });
  }

  /* ============================================================
   * 7. Controls
   * ============================================================ */
  function updateTopbar() {
    var c = CITIES[state.current];
    $("#topbar-status").innerHTML = '<span class="dot" aria-hidden="true"></span>Now in <b>' + esc(c.city) + "</b> · " + c.code + " · " + esc(state.current === "home" ? "About Me" : c.section);
    $("#btn-home").hidden = state.current === "home";
  }

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("tj-theme", t); } catch (e) {}
    $("#btn-theme").setAttribute("title", t === "dark" ? "Switch to day flight" : "Switch to night flight");
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0b1326" : "#f3e9d2");
  }

  function makeStars() {
    var html = "";
    for (var i = 0; i < 110; i++) {
      var size = Math.random() < 0.85 ? 1 : 2;
      html += '<i style="left:' + (Math.random() * 100).toFixed(2) + "%;top:" + (Math.random() * 100).toFixed(2) + "%;width:" + size + "px;height:" + size + "px;animation-delay:" + (Math.random() * 4).toFixed(2) + 's"></i>';
    }
    $("#stars").innerHTML = html;
  }

  function tickClocks() {
    var now = new Date();
    $$("[data-clock]").forEach(function (el) { el.textContent = clock(now, el.dataset.clock); });
  }

  function togglePassport(force) {
    var panel = $("#passport-panel"), btn = $("#passport-btn");
    var open = typeof force === "boolean" ? force : panel.hidden;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open && motionOK()) gsap.from(".visa", { scale: 1.6, opacity: 0, stagger: 0.06, duration: 0.3, ease: "back.out(2)", clearProps: "transform,opacity" });
  }

  function resetJourney() {
    state.visited = new Set([state.current, "home"]);
    state.stampedAt = {};
    ALL.forEach(function (k) { if (state.visited.has(k)) state.stampedAt[k] = shortDate(new Date()); });
    state.completeShown = false;
    saveState();
    renderPassport();
    if (state.current === "home") refreshBoard();
    toast("Fresh passport issued.");
  }

  function onClick(e) {
    var el = e.target.closest("[data-action]");
    if (!el) {
      // Clicking a postcard face flips it (links inside still work)
      var card = e.target.closest(".postcard");
      if (card && !e.target.closest("a")) flipCard(card);
      if (!e.target.closest(".passport")) togglePassport(false);
      return;
    }
    var action = el.dataset.action;
    if (action !== "reset" && !e.target.closest(".passport")) togglePassport(false);
    switch (action) {
      case "board": e.preventDefault(); openMap(); break;
      case "home":
        e.preventDefault();
        if (state.current === "home") { window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" }); break; }
        pick("home");
        break;
      case "pick": pick(el.dataset.city); break;
      case "close-map": closeMap(); break;
      case "cancel-pass": cancelPass(); break;
      case "takeoff": takeoff(); break;
      case "skip": skipFlight(); break;
      case "flip": flipCard(el.closest(".postcard")); break;
      case "reset": resetJourney(); break;
      case "close-complete": hideOverlay($("#complete-overlay"), restoreFocus); break;
    }
  }

  function flipCard(card) {
    var flipped = card.classList.toggle("flipped");
    var btn = $(".pc-flip", card);
    btn.setAttribute("aria-pressed", String(flipped));
  }

  function onKey(e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""));
    if (e.key === "Escape") {
      if (state.flying) { skipFlight(); return; }
      if (!$("#complete-overlay").hidden) { hideOverlay($("#complete-overlay"), restoreFocus); return; }
      if (!$("#pass-overlay").hidden) { cancelPass(); return; }
      if (!$("#map-overlay").hidden) { closeMap(); return; }
      togglePassport(false);
      return;
    }
    if (e.key === "Enter" && e.target.id === "pass-name") { takeoff(); return; }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "b" || e.key === "B") openMap();
    if ((e.key === "h" || e.key === "H") && state.current !== "home") pick("home");
    if (e.key === "Tab") trapFocus(e);
  }

  // Keep keyboard focus inside whichever overlay is open
  function trapFocus(e) {
    var open = ["#complete-overlay", "#pass-overlay", "#map-overlay"].map(function (s) { return $(s); }).filter(function (o) { return !o.hidden; })[0];
    if (!open) return;
    var items = $$("button, a[href], input", open).filter(function (x) { return x.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!open.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }

  /* ============================================================
   * 8. Boot
   * ============================================================ */
  function boot() {
    loadState();
    drawWorld();
    makeStars();
    setTheme(document.documentElement.dataset.theme || "light");
    if (!state.stampedAt.home) state.stampedAt.home = shortDate(new Date());
    renderHome();
    renderPassport();

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("input", function (e) {
      if (e.target.id === "pass-name") { state.passenger = e.target.value; saveState(); }
    });
    $("#passport-btn").addEventListener("click", function (e) { e.stopPropagation(); togglePassport(); });
    $("#btn-theme").addEventListener("click", function () {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
    $("#btn-sound").addEventListener("click", function () {
      Sound.set(!Sound.enabled);
      this.setAttribute("aria-pressed", String(Sound.enabled));
      this.title = "Sound effects (" + (Sound.enabled ? "on" : "off") + ")";
      if (Sound.enabled) Sound.ding();
    });
    window.addEventListener("popstate", function () { goDirect(keyFromHash(location.hash) || "home", true); });
    // A resize mid-flight would misplace the plane, so just finish the flight
    smallScreen.addEventListener && smallScreen.addEventListener("change", function () { if (state.flying) skipFlight(); });
    setInterval(tickClocks, 15000);

    // Deep link: #projects, #skills, #languages, #education land straight in that city
    var start = keyFromHash(location.hash);
    if (start && start !== "home") {
      arrive(start, "home", { fromHistory: true, initial: true });
      toast("Landed in " + CITIES[start].city + " via direct flight.");
    } else {
      arrive("home", null, { fromHistory: true, initial: true });
      if (!location.hash) history.replaceState(null, "", "#about");
    }
  }

  boot();
})();
