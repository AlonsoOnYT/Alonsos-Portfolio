/* ==========================================================================
   ALONSO — interactions
   You shouldn't need to edit this file. Content lives in js/projects.js.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const SITE = window.SITE || {};
  const GENRES = window.GENRES || {};
  const PROJECTS = window.PROJECTS || {};
  const ORDER = ["ugc", "short", "long"].filter((k) => GENRES[k]);

  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });
  document.addEventListener("mouseleave", () => { mouse.active = false; });

  /* ------------------------------------------------------------------ helpers */
  function parseVideo(src) {
    if (!src) return { type: "none" };
    let m = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
    if (m) return {
      type: "youtube",
      embed: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      thumb: `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`,
    };
    m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { type: "vimeo", embed: `https://player.vimeo.com/video/${m[1]}?autoplay=1&title=0&byline=0&portrait=0` };
    m = src.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (m) return {
      type: "drive",
      embed: `https://drive.google.com/file/d/${m[1]}/preview`,
      // Drive serves a poster frame for link-shared videos
      thumb: `https://drive.google.com/thumbnail?id=${m[1]}&sz=w720`,
    };
    return { type: "file", src };
  }
  const toSec = (d) => String(d || "").split(":").map(Number).reduce((a, b) => a * 60 + (b || 0), 0) || 30;
  function tc(sec, fps = 24) {
    const s = Math.max(0, sec), t = Math.floor(s);
    return `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}:${pad(Math.floor((s % 1) * fps))}`;
  }
  const mmss = (sec) => `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec) % 60)}`;

  function mediaHTML(p, mini) {
    const v = parseVideo(p.video);
    const thumb = p.thumb || v.thumb;
    // no-referrer: Google Drive refuses thumbnail requests that carry another site's referrer
    if (thumb) return `<img class="m-thumb" src="${esc(thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer">` +
      "";  // no hidden scrub video when there is a cover image: it made the browser fetch whole video files
    if (v.type === "file") return `<video class="m-thumb" src="${esc(v.src)}#t=0.1" muted playsinline preload="metadata"></video>`;
    return `<span class="ph${mini ? " ph--mini" : ""}"><span class="ph__t">Media offline</span><span class="ph__s">Link a video in projects.js</span></span>`;
  }

  function clipHTML(p, key, i, hidden) {
    const g = GENRES[key] || {};
    return `<article class="clip" ${hidden ? 'tabindex="-1" aria-hidden="true"' : 'tabindex="0"'} role="button"
        aria-label="Play ${esc(p.title)}" data-genre="${key}" data-index="${i}">
      <div class="clip__media" style="--ratio:${g.ratio || "9/16"}" data-dur="${toSec(p.duration)}">
        ${mediaHTML(p)}
        ${p.duration ? `<span class="clip__dur">${esc(p.duration)}</span>` : ""}
        <span class="clip__scrub"></span><span class="clip__bar"></span><span class="clip__tc">00:00:00</span>
      </div>
      <div class="clip__meta"><span class="clip__name">${esc(p.title)}</span><span class="clip__sub">${esc(p.client || "")}</span></div>
    </article>`;
  }

  /* ------------------------------------------------------------------ build content */
  const list = (k) => PROJECTS[k] || [];

  // UGC ads: phone-sized ad cards, fanned out like a hand of cards
  const ICON = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M14 5l6 6-6 6M20 11H9a5 5 0 0 0-5 5v3"/></svg>',
  };
  const deck = $("#deck");
  if (deck) deck.innerHTML = list("ugc").map((p, i) => `
    <article class="clip ugccard" tabindex="0" role="button" aria-label="Play ${esc(p.title)}" data-genre="ugc" data-index="${i}">
      <div class="clip__media" style="--ratio:9/16" data-dur="${toSec(p.duration)}">
        ${mediaHTML(p)}
        <span class="clip__scrub"></span><span class="clip__bar"></span><span class="clip__tc">00:00:00</span>
        <span class="ugccard__top"><b>Sponsored</b>${p.duration ? `<span>${esc(p.duration)}</span>` : ""}</span>
        <span class="ugccard__rail" aria-hidden="true">${ICON.heart}${ICON.chat}${ICON.share}</span>
        <span class="ugccard__foot">
          <span class="ugccard__handle">@${esc((p.client || "brand").toLowerCase().replace(/\s+/g, ""))}</span>
          <span class="ugccard__title">${esc(p.title)}</span>
        </span>
      </div>
    </article>`).join("");

  const stripTrack = $("#stripTrack");
  if (stripTrack) {
    const one = (hidden) => list("short").map((p, i) => clipHTML(p, "short", i, hidden)).join("");
    stripTrack.innerHTML = one(false) + one(true);
  }

  // long-form: a grid of 16:9 cards, the first one large
  const reelGrid = $('[data-grid="long"]');
  if (reelGrid) reelGrid.innerHTML = list("long").map((p, i) => clipHTML(p, "long", i)).join("");

  Object.keys(GENRES).forEach((k) => $$(`[data-count="${k}"]`).forEach((el) => (el.textContent = list(k).length)));

  if (SITE.email) {
    $("#mailText").textContent = SITE.email;
    $("#mailLink").href = $("#mailBtn").href = `mailto:${SITE.email}`;
  }
  // Discord card: with a user ID it opens the profile (Message button there);
  // without one it copies the username and opens Discord's DMs so you can paste it.
  {
    const card = $("#discordCard");
    const dc = SITE.discord || {};
    if (card && dc.username) $("#discordName").textContent = dc.username;
    if (card && dc.id) card.href = `https://discord.com/users/${encodeURIComponent(dc.id)}`;
    else if (card) card.addEventListener("click", () => {
      const name = dc.username || "di4bolical._";
      if (navigator.clipboard) navigator.clipboard.writeText(name).catch(() => {});
      setTimeout(() => showToast(`Copied ${name}. Paste it in Discord to start a DM`), 50);
    });
  }
  $("#specs").innerHTML = `<div><dt>Formats</dt><dd class="is-small">9:16, 1:1, 16:9</dd></div>` +
    (SITE.stats || []).map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join("");
  $("#tools").innerHTML = (SITE.tools || []).map((t) => `<span>${esc(t)}</span>`).join("");
  $("#year").textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ hero timeline (the portfolio as a sequence) */
  const seq = [];
  let total = 0;
  {
    let t = 0;
    ORDER.forEach((key, k) => {
      if (k > 0) t = Math.max(0, t - 14); // overlap the next track like a real edit
      list(key).forEach((p, i) => {
        const d = Math.min(toSec(p.duration), 80); // cap long videos so every clip stays visible on the timeline
        seq.push({ key, idx: i, start: t, dur: d, p });
        t += d + 3;
      });
    });
    total = Math.max(t, 1);
  }
  const lanes = { ugc: $("#laneUgc"), short: $("#laneShort"), long: $("#laneLong") };
  seq.forEach((c) => {
    const lane = lanes[c.key];
    if (!lane) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = `tl__clip tl__clip--${c.key}`;
    b.style.left = `${(c.start / total) * 100}%`;
    b.style.width = `${(c.dur / total) * 100}%`;
    b.dataset.genre = c.key;
    b.dataset.index = c.idx;
    b.setAttribute("aria-label", `Play ${c.p.title}`);
    b.innerHTML = `<span>${esc(c.p.title)}</span>`;
    lane.appendChild(b);
    c.el = b;
  });
  {
    const steps = [5, 10, 15, 30, 60, 120, 300];
    const step = steps.find((s) => total / s <= 9) || 600;
    let html = "";
    for (let s = 0; s < total - step * 0.4; s += step) html += `<span style="left:${(s / total) * 100}%">${mmss(s)}</span>`;
    $("#tlRuler").innerHTML = html;
    let bars = "";
    for (let i = 0; i < 150; i++) {
      const h = 18 + 62 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.113)) + ((i * 7919) % 13);
      bars += `<i style="--h:${Math.min(96, h).toFixed(0)}%"></i>`;
    }
    $("#laneAudio").innerHTML = bars;
  }

  /* ------------------------------------------------------------------ intro */
  const intro = $("#intro");
  {
    let w = "";
    for (let i = 0; i < 64; i++) w += `<i style="--i:${i};--h:${(25 + 70 * Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.17))).toFixed(0)}%"></i>`;
    $("#introWave").innerHTML = w;
  }
  let seen = false;
  try { seen = sessionStorage.getItem("alonso-intro") === "1"; sessionStorage.setItem("alonso-intro", "1"); } catch (e) { /* storage blocked */ }
  const INTRO_MS = reduced ? 300 : seen ? 1100 : 2400;
  const introStart = performance.now();
  const introTc = $("#introTc"), introPct = $("#introPct");
  let introDone = false;
  let readyAt = performance.now();

  // everything in the intro runs off one clock (p = 0 → 1) so it stays in sync
  // clips are "laid down" as the playhead reaches them
  const introClips = $$(".ic", intro).map((el) => ({ el, at: parseFloat(el.style.getPropertyValue("--l")) / 100 + 0.01 }));
  const introBars = $$(".intro__track--audio i", intro).map((el, i) => ({ el, at: i / 64 }));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  intro.classList.add("is-started");
  function introTick(now) {
    if (introDone) return;
    const p = clamp((now - introStart) / INTRO_MS, 0, 1);
    const e = ease(p);
    intro.style.setProperty("--p", e.toFixed(4));
    introClips.forEach((c) => c.el.classList.toggle("is-on", e >= c.at));
    introBars.forEach((b) => b.el.classList.toggle("is-on", e >= b.at));
    introTc.textContent = tc(p * 4.5);
    introPct.textContent = `${Math.round(p * 100)}%`;
    if (p < 1) requestAnimationFrame(introTick);
    else endIntro();
  }
  function endIntro() {
    if (introDone) return;
    introDone = true;
    intro.style.setProperty("--p", 1);
    $$(".ic, .intro__track--audio i", intro).forEach((el) => el.classList.add("is-on"));
    introTc.textContent = tc(4.5);
    introPct.textContent = "100%";
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 900))]).then(() => {
      intro.classList.add("is-cutting");
      setTimeout(() => intro.classList.add("is-cut"), 380);
      setTimeout(() => { body.classList.remove("is-intro"); body.classList.add("is-ready"); readyAt = performance.now(); }, 520);
      setTimeout(() => intro.remove(), 1700);
    });
  }
  $("#introSkip").addEventListener("click", endIntro);
  setTimeout(endIntro, INTRO_MS + 2500); // safety net for throttled background tabs
  requestAnimationFrame(introTick);

  /* ------------------------------------------------------------------ cursor */
  const cursor = $("#cursor"), cursorDot = $("#cursorDot"), cursorLabel = $("#cursorLabel");
  const ring = { x: mouse.x, y: mouse.y };
  if (fine) {
    body.classList.add("has-cursor");
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      let state = "", label = "";
      if (t.closest(".player")) {
        if (t.closest("button, a")) state = "link";
        else if (t.hasAttribute("data-close")) { state = "close"; label = "Close"; }
      } else if (t.closest(".strip")) { state = "drag"; label = "Drag"; }
      else if (t.closest(".tl__body")) state = "scrub";
      else if (t.closest(".avatar__stage")) { state = "play"; label = "Spin"; }
      else if (t.closest(".clip")) { state = "play"; label = "Play"; }
      else if (t.closest("a, button, [role=button]")) state = "link";
      body.dataset.cursor = state;
      cursorLabel.textContent = label;
    });
    document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
    document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => { cursor.classList.add("is-hidden"); cursorDot.classList.add("is-hidden"); });
    document.addEventListener("mouseenter", () => { cursor.classList.remove("is-hidden"); cursorDot.classList.remove("is-hidden"); });
  }

  /* ------------------------------------------------------------------ animated background: deep-space starfield
     Three depths of stars that drift, twinkle and parallax with the cursor and
     scroll, the odd shooting star, and a lightspeed jump when you click empty space. */
  const cv = $("#bg"), ctx = cv.getContext("2d");
  let W = 0, H = 0, DPR = 1, stars = [];
  const STAR_COLORS = ["255,255,255", "216,243,220", "183,228,199", "149,213,178", "205,225,255"];
  function sizeBg() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.round(Math.min(560, (W * H) / 3000));
    stars = Array.from({ length: count }, () => {
      const z = Math.random() ** 1.8; // most stars are far away
      return {
        x: Math.random(), y: Math.random(), z,
        r: 0.35 + z * 1.5, a: 0.3 + z * 0.65,
        tw: Math.random() * Math.PI * 2, ts: 0.6 + Math.random() * 2.4,
        c: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0],
      };
    });
  }
  sizeBg();

  let hyperT = -1; // seconds since a lightspeed jump started (-1 = none)
  addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, input, [role=button], .player, .menu, .strip, .tl__body, .avatar__stage, .deck, .reel-grid, .dcard")) return;
    if (hyperT < 0 && !reduced) hyperT = 0;
  });
  const shooters = [];
  let nextShooter = 2.5, bgTime = 0;
  const par = { x: 0, y: 0 };

  function drawBg(dt) {
    bgTime += dt;
    ctx.clearRect(0, 0, W, H);
    par.x = lerp(par.x, mouse.active ? mouse.x / W - 0.5 : 0, 0.04);
    par.y = lerp(par.y, mouse.active ? mouse.y / H - 0.5 : 0, 0.04);

    // lightspeed: ramps up fast, settles slowly
    let hk = 0;
    if (hyperT >= 0) {
      hyperT += dt;
      hk = hyperT < 0.28 ? hyperT / 0.28 : Math.max(0, 1 - (hyperT - 0.28) / 1.0);
      hk = hk * hk * (3 - 2 * hk);
      if (hyperT > 1.3) hyperT = -1;
    }
    const cx = W / 2, cy = H / 2, sy = scrollY;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x = (s.x + dt * 0.0025 * (0.3 + s.z) * (1 + hk * 30)) % 1;
      let x = s.x * W - par.x * 42 * s.z;
      const y = (((s.y * H - sy * 0.08 * s.z - par.y * 28 * s.z) % H) + H) % H;
      x = ((x % W) + W) % W;
      const alpha = s.a * (0.62 + 0.38 * Math.sin(bgTime * s.ts + s.tw));
      if (hk > 0.02) {
        const len = hk * (0.12 + s.z) * 0.85;
        ctx.strokeStyle = `rgba(${s.c},${Math.min(1, alpha + hk * 0.45)})`;
        ctx.lineWidth = s.r;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x - cx) * len, y + (y - cy) * len); ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${s.c},${alpha})`;
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
        if (s.z > 0.82) {
          // the brightest stars get a small cross-shaped flare
          ctx.fillStyle = `rgba(${s.c},${alpha * 0.35})`;
          ctx.fillRect(x - s.r * 3.2, y - 0.3, s.r * 6.4, 0.6);
          ctx.fillRect(x - 0.3, y - s.r * 3.2, 0.6, s.r * 6.4);
        }
      }
    }

    // shooting stars every few seconds
    nextShooter -= dt;
    if (nextShooter <= 0) {
      nextShooter = 4 + Math.random() * 6;
      const fromLeft = Math.random() < 0.5;
      shooters.push({
        x: fromLeft ? Math.random() * W * 0.5 : W * (0.5 + Math.random() * 0.5), y: Math.random() * H * 0.45,
        vx: (fromLeft ? 1 : -1) * (520 + Math.random() * 380), vy: 160 + Math.random() * 160, life: 0, max: 0.9 + Math.random() * 0.5,
      });
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const sh = shooters[i];
      sh.life += dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt;
      const k = sh.life / sh.max;
      if (k >= 1) { shooters.splice(i, 1); continue; }
      const fade = Math.sin(k * Math.PI), tail = 0.13;
      const g = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * tail, sh.y - sh.vy * tail);
      g.addColorStop(0, `rgba(216,243,220,${0.95 * fade})`);
      g.addColorStop(1, "rgba(116,198,157,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x - sh.vx * tail, sh.y - sh.vy * tail); ctx.stroke();
    }
    if (hk > 0.55) { ctx.fillStyle = `rgba(216,243,220,${(hk - 0.55) * 0.22})`; ctx.fillRect(0, 0, W, H); }
  }

  /* ------------------------------------------------------------------ timeline playhead + scrub */
  const tlBody = $("#tlBody"), playhead = $("#tlPlayhead");
  let live = null;
  let phT = 0, phTarget = 0, scrubbing = false, laneLeft = 44, laneW = 1;
  function measureTl() {
    const lane = $("#laneUgc");
    laneLeft = lane.offsetLeft;
    laneW = lane.offsetWidth || 1;
    playhead.style.left = laneLeft + "px";
  }
  measureTl();
  tlBody.addEventListener("pointerenter", () => { scrubbing = true; });
  tlBody.addEventListener("pointerleave", () => { scrubbing = false; });
  tlBody.addEventListener("pointermove", (e) => {
    const r = tlBody.getBoundingClientRect();
    phTarget = clamp((e.clientX - r.left - laneLeft) / laneW, 0, 1) * total;
    if (e.pointerType !== "mouse") phT = phTarget;
  });
  function updateLive(time) {
    let found = null;
    for (const key of ["long", "short", "ugc"]) {
      found = seq.find((c) => c.key === key && time >= c.start && time < c.start + c.dur);
      if (found) break;
    }
    if (found !== live) {
      if (live && live.el) live.el.classList.remove("is-live");
      live = found;
      if (live && live.el) live.el.classList.add("is-live");
    }
  }

  /* ------------------------------------------------------------------ nav: scroll state, active link, menu */
  const nav = $("#nav"), navScrub = $("#navScrub"), navTc = $("#navTc");
  const navLinks = $$(".nav__links a");
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.dataset.section === en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["top", "ugc", "short", "long", "about", "process", "contact"].forEach((id) => { const el = document.getElementById(id); el && secObs.observe(el); });

  const burger = $("#burger"), menu = $("#menu");
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", !open);
  }
  burger.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  $$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ------------------------------------------------------------------ bin hover-scrub */
  document.addEventListener("pointermove", (e) => {
    const media = e.target.closest && e.target.closest(".clip__media");
    if (!media || (e.pointerType !== "mouse")) return;
    const r = media.getBoundingClientRect();
    const x = clamp((e.clientX - r.left) / r.width, 0, 1);
    media.style.setProperty("--scrub", x.toFixed(4));
    media.classList.add("is-scrubbing");
    const dur = +media.dataset.dur || 30;
    media.querySelector(".clip__tc").textContent = tc(dur * x).slice(3);
    const v = media.querySelector(".m-scrub") || media.querySelector("video.m-thumb");
    if (v) {
      if (v.preload === "none") v.preload = "auto";
      if (v.duration) v.currentTime = v.duration * x;
    }
  });
  document.addEventListener("pointerout", (e) => {
    const media = e.target.closest && e.target.closest(".clip__media");
    if (media && !media.contains(e.relatedTarget)) media.classList.remove("is-scrubbing");
  });

  /* ------------------------------------------------------------------ filmstrip: drifts on its own, drag to browse */
  const strip = $("#strip");
  let sx = 0, setW = 0, drag = null, moved = 0, stripHover = false, stripVisible = false;
  const measureStrip = () => { setW = stripTrack.scrollWidth / 2; };
  measureStrip();
  new IntersectionObserver(([en]) => { stripVisible = en.isIntersecting; }).observe(strip);
  strip.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") stripHover = true; });
  strip.addEventListener("pointerleave", () => { stripHover = false; });
  strip.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, sx }; moved = 0; });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (e.pointerType !== "mouse" && Math.abs(e.clientY - drag.y) > Math.abs(dx) + 4 && moved < 6) { drag = null; return; }
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 6) strip.classList.add("is-dragging");
    sx = drag.sx + dx;
  });
  addEventListener("pointerup", () => { if (!drag) return; drag = null; setTimeout(() => strip.classList.remove("is-dragging"), 0); });
  addEventListener("pointercancel", () => { drag = null; strip.classList.remove("is-dragging"); });
  strip.addEventListener("click", (e) => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);

  /* ------------------------------------------------------------------ UGC deck: fanned cards, hovered card lifts out */
  const deckCards = deck ? $$(".ugccard", deck) : [];
  let deckHover = -1;
  function layoutDeck() {
    if (!deckCards.length) return;
    if (innerWidth < 760) { deckCards.forEach((c) => { c.style.transform = ""; c.style.zIndex = ""; }); return; }
    const n = deckCards.length, cw = deckCards[0].offsetWidth, W = deck.clientWidth;
    const spread = n > 1 ? Math.min(cw * 0.62, (W - cw - 40) / (n - 1)) : 0;
    deckCards.forEach((c, i) => {
      const o = i - (n - 1) / 2;
      let x = o * spread, y = o * o * 3.5, rot = o * 3.2, s = 1, z = i + 1;
      if (deckHover >= 0) {
        const d = i - deckHover;
        if (d === 0) { y = -36; rot = 0; s = 1.06; z = 50; }
        else x += Math.sign(d) * Math.max(0, cw * 0.32 - (Math.abs(d) - 1) * cw * 0.08);
      }
      c.style.transform = `translateX(${x.toFixed(1)}px) translateY(${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${s})`;
      c.style.zIndex = z;
    });
  }
  deckCards.forEach((c, i) => {
    c.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { deckHover = i; layoutDeck(); } });
    c.addEventListener("focus", () => { deckHover = i; layoutDeck(); });
  });
  if (deck) {
    deck.addEventListener("pointerleave", () => { deckHover = -1; layoutDeck(); });
    deck.addEventListener("focusout", (e) => { if (!deck.contains(e.relatedTarget)) { deckHover = -1; layoutDeck(); } });
  }
  layoutDeck();

  /* ------------------------------------------------------------------ player: playhead wipe + card-to-stage flight */
  const player = $("#player"), stage = $(".player__stage"), frame = $("#playerFrame"), info = $(".player__info");
  const pGenre = $("#pGenre"), pTitle = $("#pTitle"), pClient = $("#pClient"), pDesc = $("#pDesc"), pCount = $("#pCount");
  const pControls = $("#pControls"), pClose = $("#pClose");
  let session = null, busy = false, lastFocus = null, closeQueued = false;

  function frameContent(p, autoplay) {
    const v = parseVideo(p.video);
    if (v.type === "file") return `<video src="${esc(v.src)}" ${p.thumb ? `poster="${esc(p.thumb)}"` : ""} controls playsinline preload="metadata" ${autoplay ? "autoplay" : ""}></video>`;
    if (v.embed) return `<iframe src="${esc(v.embed)}" title="${esc(p.title)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`;
    return `<div class="ph-player"><b>Media offline</b><span>Add a link to this clip's <code>video</code> field in <code>js/projects.js</code> and it plays here.</span></div>`;
  }
  function fillInfo() {
    const p = session.list[session.idx];
    pGenre.textContent = session.label;
    pTitle.textContent = p.title || "";
    pClient.textContent = p.client || "";
    pDesc.textContent = p.desc || "";
    pCount.textContent = `${session.idx + 1} / ${session.list.length}`;
    pControls.classList.toggle("is-hidden", session.list.length < 2);
  }
  function applyRatio() {
    const h = session.ratio === "16/9";
    frame.classList.toggle("is-horizontal", h);
    frame.classList.toggle("is-vertical", !h);
    stage.classList.toggle("is-horizontal", h);
  }

  /* Clicking a clip: the card lifts off the page, flies to the centre and flips
     over. Its other side is a playing card with the video inside
     (rank = clip number, suit = genre). Closing flips it back into place;
     next/previous flicks the playing card away and deals the next one. */
  const view = $("#playerView"), flip = $("#playerFlip"), front = $("#playerFront");
  const pcard = $("#pcard"), pcardLabel = $("#pcardLabel");
  const SUITS = { ugc: ["♥", true], short: ["♦", true], long: ["♠", false] };
  const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let flipAnim = null, cardAnim = null, srcEl = null;

  function dressCard() {
    const [suit, red] = session.key ? SUITS[session.key] || ["♣", false] : ["", false];
    const rank = session.key ? RANKS[session.idx % 13] : "★";
    $$(".pcard__rank", pcard).forEach((el) => (el.textContent = rank));
    $$(".pcard__suit", pcard).forEach((el) => (el.textContent = suit));
    pcard.classList.toggle("is-red", red);
    pcardLabel.textContent = session.key ? session.label : "Joker: showreel";
  }
  function sourceFor(key, idx) {
    const el = $(`.clip[data-genre="${key}"][data-index="${idx}"]:not([aria-hidden="true"])`);
    return el ? el.querySelector(".clip__media") : null;
  }
  // centre, untransformed size and tilt of a card on the page (null if off-screen)
  function describe(m) {
    if (!m) return null;
    const r = m.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null;
    const card = m.closest(".ugccard");
    let rot = 0, s = 1;
    if (card) {
      const mr = /rotate\(([-\d.]+)deg\)/.exec(card.style.transform); if (mr) rot = +mr[1];
      const ms = /scale\(([\d.]+)\)/.exec(card.style.transform); if (ms) s = +ms[1];
    }
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: m.offsetWidth * s, h: m.offsetHeight * s, rot };
  }
  // While the card is flying/flipping, the window shows a still cover image only.
  // The real <video> / Drive player is loaded once the card has landed: playing
  // video or an iframe inside a 3D-transformed element is what made pages crash.
  function posterHTML(p) {
    const v = parseVideo(p.video);
    const thumb = p.thumb || v.thumb;
    return thumb
      ? `<img class="player__poster" src="${esc(thumb)}" alt="" referrerpolicy="no-referrer">`
      : `<div class="ph-player"><b>Loading…</b></div>`;
  }
  // stop a video and let the browser free its memory
  function unloadFrame() {
    $$("video", frame).forEach((v) => { v.pause(); v.removeAttribute("src"); v.load(); });
    frame.innerHTML = "";
  }

  // front face = a copy of the clip that was clicked, or a playing-card back for the showreel
  function cardFace(m) {
    front.innerHTML = "";
    if (m) {
      const c = m.cloneNode(true);
      c.removeAttribute("id");
      c.classList.add("player__card");
      c.classList.remove("is-scrubbing");
      $$("video", c).forEach((v) => v.remove()); // never clone video elements (each would load the file)
      front.appendChild(c);
    } else {
      front.innerHTML = `<div class="pcard-back"><span>A</span></div>`;
    }
  }
  function setLaunching(el) {
    if (srcEl) (srcEl.closest(".clip") || srcEl).classList.remove("is-launching");
    srcEl = el;
    if (srcEl) (srcEl.closest(".clip") || srcEl).classList.add("is-launching");
  }
  function flyKeyframes(d, to, reverse) {
    const dx = d.cx - (to.left + to.width / 2), dy = d.cy - (to.top + to.height / 2);
    const sx = d.w / to.width, sy = d.h / to.height;
    const atCard = `translate(${dx}px, ${dy}px) rotateZ(${d.rot}deg) scale(${sx}, ${sy}) rotateY(${reverse ? 360 : 0}deg)`;
    const lift = `translate(${dx * 0.55}px, ${dy * 0.55 - 70}px) rotateZ(${d.rot * 0.4}deg) scale(${sx * 1.3}, ${sy * 1.3}) rotateX(10deg) rotateY(${reverse ? 300 : -22}deg)`;
    const atStage = "translate(0px, 0px) rotateZ(0deg) scale(1, 1) rotateY(180deg)";
    return reverse
      ? [{ transform: atStage }, { transform: lift, offset: 0.55 }, { transform: atCard }]
      : [{ transform: atCard }, { transform: lift, offset: 0.32 }, { transform: atStage }];
  }

  function openPlayer(s, sourceEl) {
    if (busy || player.classList.contains("is-open")) return;
    busy = true;
    closeQueued = false;
    session = s;
    lastFocus = document.activeElement;
    const d = describe(sourceEl);
    applyRatio(); fillInfo(); dressCard();
    cardFace(d ? sourceEl : null);
    unloadFrame();
    frame.innerHTML = posterHTML(session.list[session.idx]);
    flip.classList.remove("is-flat");
    flip.style.transform = "";
    view.classList.add("is-flipping");
    setLaunching(d ? sourceEl : null);
    player.classList.add("is-open");
    player.setAttribute("aria-hidden", "false");
    body.classList.add("is-locked");
    body.dataset.cursor = "";

    // start on the next frame, or after 120 ms if the tab isn't painting (backgrounded)
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      player.classList.add("is-revealed");
      const to = flip.getBoundingClientRect();
      const from = d || { cx: innerWidth / 2, cy: innerHeight * 0.85, w: to.width * 0.4, h: to.height * 0.4, rot: -14 };
      let landed = false;
      const done = () => {
        if (landed) return;
        landed = true;
        if (flipAnim) { flipAnim.cancel(); flipAnim = null; }
        flip.classList.add("is-flat");
        view.classList.remove("is-flipping");
        // card has landed flat: now load the actual video
        frame.innerHTML = frameContent(session.list[session.idx], true);
        const v = frame.querySelector("video");
        if (v) v.play().catch(() => {});
        pClose.focus({ preventScroll: true });
        busy = false;
        if (closeQueued) { closeQueued = false; closePlayer(); } // Esc pressed mid-flight
      };
      if (reduced || !flip.animate) { done(); return; }
      flipAnim = flip.animate(flyKeyframes(from, to, false), { duration: 1100, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" });
      flipAnim.onfinish = done;
      setTimeout(done, 1500); // safety net: never leave the player half-open
    };
    requestAnimationFrame(start);
    setTimeout(start, 120);
  }

  function closePlayer() {
    if (!player.classList.contains("is-open")) return;
    if (busy) { closeQueued = true; return; } // run once the open animation lands
    busy = true;
    if (cardAnim) { cardAnim.cancel(); cardAnim = null; }
    // swap the live player for a still before the card flies back (no video in 3D)
    unloadFrame();
    frame.innerHTML = posterHTML(session.list[session.idx]);
    const target = session.key ? sourceFor(session.key, session.idx) : null;
    const d = describe(target);
    player.classList.remove("is-revealed");

    const finish = () => {
      if (flipAnim) { flipAnim.cancel(); flipAnim = null; }
      unloadFrame(); front.innerHTML = "";
      flip.style.transform = ""; flip.style.opacity = ""; flip.style.transition = "";
      flip.classList.remove("is-flat");
      view.classList.remove("is-flipping");
      setLaunching(null);
      player.classList.remove("is-open");
      player.setAttribute("aria-hidden", "true");
      body.classList.remove("is-locked");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      busy = false;
    };

    if (d && !reduced && flip.animate) {
      cardFace(target);
      setLaunching(target);
      flip.classList.remove("is-flat");
      view.classList.add("is-flipping");
      flip.style.transform = "rotateY(180deg)";
      const to = flip.getBoundingClientRect();
      flipAnim = flip.animate(flyKeyframes(d, to, true), { duration: 850, easing: "cubic-bezier(.5,0,.25,1)", fill: "forwards" });
      let closed = false;
      const once = () => { if (!closed) { closed = true; finish(); } };
      flipAnim.onfinish = () => setTimeout(once, 20);
      setTimeout(once, 1200); // safety net
    } else {
      flip.style.transition = "opacity .3s, transform .4s";
      flip.style.opacity = "0";
      flip.style.transform = "translateY(60px) rotate(8deg)";
      setTimeout(finish, reduced ? 30 : 380);
    }
  }

  const flick = (keyframes, opts) => {
    if (cardAnim) cardAnim.cancel();
    cardAnim = pcard.animate ? pcard.animate(keyframes, Object.assign({ fill: "forwards" }, opts)) : null;
    return cardAnim ? cardAnim.finished.catch(() => {}) : Promise.resolve();
  };
  function stepPlayer(dir) {
    if (busy || !session || session.list.length < 2) return;
    busy = true;
    unloadFrame();
    info.classList.add("is-swapping");
    const out = reduced ? Promise.resolve() : flick([
      { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
      { transform: `translate(${-dir * 140}px, 30px) rotate(${-dir * 14}deg)`, opacity: 0 },
    ], { duration: 240, easing: "cubic-bezier(.5,0,.75,0)" });
    out.then(() => {
      session.idx = (session.idx + dir + session.list.length) % session.list.length;
      if (session.key) { const t = sourceFor(session.key, session.idx); setLaunching(describe(t) ? t : null); }
      fillInfo(); dressCard();
      frame.innerHTML = frameContent(session.list[session.idx], true);
      info.classList.remove("is-swapping");
      const back = reduced ? Promise.resolve() : flick([
        { transform: `translate(${dir * 160}px, 40px) rotate(${dir * 16}deg)`, opacity: 0 },
        { transform: "translate(0px, -8px) rotate(-1.5deg)", opacity: 1, offset: 0.7 },
        { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
      ], { duration: 460, easing: "cubic-bezier(.22,1,.36,1)" });
      back.then(() => { busy = false; });
    });
  }

  function openFrom(key, idx, sourceEl) {
    const g = GENRES[key] || {};
    if (!list(key)[idx]) return;
    openPlayer({ key, list: list(key), idx, label: g.label || key, ratio: g.ratio || "9/16" }, sourceEl);
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-genre][data-index]");
    if (!el || el.closest(".player")) return;
    let src = el.querySelector(".clip__media");
    openFrom(el.dataset.genre, +el.dataset.index, src || el);
  });
  document.addEventListener("keydown", (e) => {
    const card = e.target.closest && e.target.closest(".clip[role=button]");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); card.click(); return; }
    if (!player.classList.contains("is-open")) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) setMenu(false);
      return;
    }
    if (e.key === "Escape") closePlayer();
    else if (e.key === "ArrowRight") stepPlayer(1);
    else if (e.key === "ArrowLeft") stepPlayer(-1);
    else if (e.key === "Tab") {
      const f = $$("button, a, iframe, video[controls]", player).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  player.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closePlayer(); });
  pClose.addEventListener("click", closePlayer);
  $("#pPrev").addEventListener("click", () => stepPlayer(-1));
  $("#pNext").addEventListener("click", () => stepPlayer(1));
  $("#showreelBtn").addEventListener("click", () => {
    openPlayer({
      list: [{ title: "Showreel", client: SITE.name || "Alonso", desc: "Selected UGC ads, short-form and long-form work in one cut.", video: SITE.showreel || "" }],
      idx: 0, label: `Showreel ${new Date().getFullYear()}`, ratio: "16/9",
    }, null);
  });

  /* ------------------------------------------------------------------ copy email */
  const toast = $("#toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
  }
  $("#copyMail").addEventListener("click", () => {
    const mail = SITE.email || $("#mailText").textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(() => showToast("Address copied"), () => showToast(mail));
    else showToast(mail);
  });

  /* ------------------------------------------------------------------ text animations
     data-anim="rise"     letters lift in out of a blur, one after another
     data-anim="type"     typed out with a blinking keyboard cursor (data-speed ms/char,
                          data-keep-caret leaves the cursor blinking afterwards)
     data-anim="words"    words drift up out of a blur
     data-anim="scramble" code-like glyphs settle into the real text
     data-delay="ms"      wait before starting. Everything plays once, when it scrolls into view;
                          text in the hero waits for the intro to finish. */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFXZ";
  function splitText(el, mode) {
    const chars = [], words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "ta-w";
            if (mode === "words") w.textContent = part;
            else [...part].forEach((ch) => {
              const s = document.createElement("span");
              s.className = "ta-ch"; s.textContent = ch; w.appendChild(s); chars.push(s);
            });
            words.push(w); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches("br, svg, img, .caret")) walk(n);
      });
    };
    walk(el);
    chars.forEach((c, i) => c.style.setProperty("--i", i));
    words.forEach((w, i) => w.style.setProperty("--i", i));
    return { chars, words };
  }
  function typeText(el, parts, delay) {
    const speed = +el.dataset.speed || 34;
    const caret = document.createElement("span");
    caret.className = "caret is-typing"; caret.setAttribute("aria-hidden", "true");
    el.classList.add("is-on");
    setTimeout(() => {
      const chars = parts.chars;
      if (!chars.length) return;
      chars[0].before(caret);
      let i = 0;
      const step = () => {
        if (i >= chars.length) {
          caret.classList.remove("is-typing");
          if (!el.hasAttribute("data-keep-caret")) setTimeout(() => caret.classList.add("is-done"), 1600);
          return;
        }
        const c = chars[i++];
        c.classList.add("on"); c.after(caret);
        const pause = /[.,:?!]/.test(c.textContent) ? speed * 5 : 0;
        setTimeout(step, speed * (0.55 + Math.random() * 0.9) + pause);
      };
      step();
    }, delay);
  }
  function scrambleText(el, parts, delay) {
    const chars = parts.chars, finals = chars.map((c) => c.textContent);
    el.classList.add("is-on");
    setTimeout(() => {
      const t0 = performance.now(), dur = 520 + chars.length * 38;
      const tick = (now) => {
        const k = (now - t0) / dur;
        chars.forEach((c, i) => {
          const at = (i / Math.max(1, chars.length)) * 0.65;
          if (k >= at + 0.35) { c.textContent = finals[i]; c.classList.add("on"); c.classList.remove("scr"); }
          else if (k >= at) { c.classList.add("on", "scr"); if (/\S/.test(finals[i])) c.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
        });
        if (k < 1) requestAnimationFrame(tick);
        else chars.forEach((c, i) => { c.textContent = finals[i]; c.classList.add("on"); c.classList.remove("scr"); });
      };
      requestAnimationFrame(tick);
    }, delay);
  }
  function playText(el) {
    if (el._played) return;
    el._played = true;
    const mode = el.dataset.anim, delay = +el.dataset.delay || 0;
    if (mode === "type") typeText(el, el._parts, delay);
    else if (mode === "scramble") scrambleText(el, el._parts, delay);
    else { el.style.setProperty("--d", `${delay}ms`); requestAnimationFrame(() => el.classList.add("is-on")); }
  }
  const animated = $$("[data-anim]");
  animated.forEach((el) => {
    if (reduced) { el.classList.add("is-on", "ta-static"); return; }
    // gradient text: give the gradient to each letter so moving letters keep it
    if (getComputedStyle(el).backgroundClip === "text" || getComputedStyle(el).webkitBackgroundClip === "text") el.classList.add("ta-grad");
    el._parts = splitText(el, el.dataset.anim);
    el.classList.add("ta-ready");
  });
  const whenReady = (fn) => {
    if (body.classList.contains("is-ready")) { fn(); return; }
    const mo = new MutationObserver(() => { if (body.classList.contains("is-ready")) { mo.disconnect(); fn(); } });
    mo.observe(body, { attributes: true, attributeFilter: ["class"] });
  };
  if (!reduced) {
    const textObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        textObs.unobserve(en.target);
        if (en.target.closest(".hero")) whenReady(() => playText(en.target));
        else playText(en.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    animated.forEach((el) => textObs.observe(el));
  }

  /* ------------------------------------------------------------------ Millennium Falcon orbiting the name
     models/falcon.bin is the user's Falcon OBJ, decimated with colours baked in
     (format: 'AVT2' | u32 nv | u32 ni | f32 bbox x6 | u16 pos x3 | u8 rgba | u16/u32 idx;
     forward = +Z, length 1). It flies a tilted orbit, banking into the turn, and
     its canvas swaps in front of / behind the letters on the near / far side. */
  const falconOrbit = $("#falconOrbit"), heroName = $("#heroName"), heroTitle = $("#heroTitle");
  let falconTick = null;
  if (falconOrbit && heroName) {
    falconOrbit.innerHTML = `<canvas class="falcon__trail"></canvas><canvas class="falcon__gl"></canvas>`;
    const trailCv = $(".falcon__trail", falconOrbit), tctx = trailCv.getContext("2d");
    const glCv = $(".falcon__gl", falconOrbit);
    // engine smoke: soft see-through puffs that drift back, swell and fade
    const smoke = [];
    let smokeDebt = 0;
    const puff = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(0.35, "rgba(255,255,255,.55)"); grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
      return c;
    })();
    const tint = (() => {
      // a mint-tinted copy for the hot exhaust right behind the engine
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d"); g.drawImage(puff, 0, 0);
      g.globalCompositeOperation = "source-in"; g.fillStyle = "#b7f5d2"; g.fillRect(0, 0, 64, 64);
      return c;
    })();
    const TILT_X = 1.05;   // how far the orbit plane leans toward the viewer
    const TILT_Z = 0.16;   // slight roll of the whole orbit
    let ang = Math.PI * 0.85, appear = 0, started = false, box = null, f3d = null, loading = false;

    const measure = () => {
      const tr = heroTitle.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(heroName);
      const r = range.getBoundingClientRect();
      const pad = 90, d = Math.min(devicePixelRatio || 1, 2);
      // keep the whole orbit on screen: nudge its centre right if the name sits
      // near the left edge, and only shrink it if the screen is too narrow
      const len = clamp(r.width * 0.2, 50, 96), margin = len * 0.6 + 8;
      let rx = r.width / 2 + Math.max(30, r.width * 0.1);
      rx = Math.min(rx, (innerWidth - margin * 2) / 2);
      let cxScreen = r.left + r.width / 2;
      cxScreen = clamp(cxScreen, margin + rx, innerWidth - margin - rx);
      const cx = cxScreen - tr.left;
      box = { cx, cy: r.top - tr.top + r.height * 0.55, rx, ry: r.height * 0.42, pad, w: tr.width + pad * 2, h: tr.height + pad * 2,
        len };
      trailCv.width = box.w * d; trailCv.height = box.h * d;
      trailCv.style.width = glCv.style.width = `${box.w}px`;
      trailCv.style.height = glCv.style.height = `${box.h}px`;
      tctx.setTransform(d, 0, 0, d, 0, 0);
      if (f3d) f3d.resize();
    };

    function initFalcon3D() {
      const T = window.THREE;
      loading = true;
      const renderer = new T.WebGLRenderer({ canvas: glCv, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
      camera.position.z = 1000;
      scene.add(new T.HemisphereLight(0xe6f2ec, 0x0b1611, 0.55));
      const key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(0.4, 1, 0.7); scene.add(key);
      const rim = new T.DirectionalLight(0x95d5b2, 1.2); rim.position.set(-0.6, 0.4, -1); scene.add(rim);

      // orbit frame: roll (Z) then lean the plane toward the viewer (X)
      const roll = new T.Group(); roll.rotation.z = -TILT_Z; scene.add(roll);
      const plane = new T.Group(); plane.rotation.x = TILT_X; roll.add(plane);
      const ship = new T.Group(); ship.rotation.order = "YXZ"; plane.add(ship);

      const api = {
        resize() {
          renderer.setSize(box.w, box.h, false);
          camera.left = 0; camera.right = box.w; camera.top = 0; camera.bottom = -box.h;
          camera.updateProjectionMatrix();
          roll.position.set(box.cx + box.pad, -(box.cy + box.pad), 0);
        },
        render(a, depth, bank) {
          const rz = box.ry / Math.sin(TILT_X);
          ship.position.set(Math.cos(a) * box.rx, 0, Math.sin(a) * rz);
          const vx = -Math.sin(a) * box.rx, vz = Math.cos(a) * rz;
          ship.rotation.set(0, Math.atan2(vx, vz), bank);
          ship.scale.setScalar(box.len * (0.72 + depth * 0.4));
          renderer.render(scene, camera);
          const p = new T.Vector3(); ship.getWorldPosition(p);
          // engine exhaust: the back edge of the saucer (model length 1, rear at z = -0.5)
          const e = ship.localToWorld(new T.Vector3(0, 0, -0.52));
          return { x: p.x, y: -p.y, ex: e.x, ey: -e.y };
        },
      };

      fetch("models/falcon.bin")
        .then((res) => { if (!res.ok) throw new Error(`falcon.bin ${res.status}`); return res.arrayBuffer(); })
        .then((buf) => {
          const dv = new DataView(buf);
          const nv = dv.getUint32(4, true), ni = dv.getUint32(8, true);
          const bb = new Float32Array(buf.slice(12, 36));
          let off = 36;
          const q = new Uint16Array(buf.slice(off, off + nv * 6)); off += nv * 6;
          const rgba = new Uint8Array(buf.slice(off, off + nv * 4)); off += nv * 4;
          const idx = nv < 65536 ? new Uint16Array(buf.slice(off, off + ni * 2)) : new Uint32Array(buf.slice(off, off + ni * 4));
          const pos = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
          const lin = (v) => Math.pow(v / 255, 2.2);
          for (let i = 0; i < nv; i++) {
            for (let k = 0; k < 3; k++) {
              pos[i * 3 + k] = bb[k] + (q[i * 3 + k] / 65535) * (bb[3 + k] - bb[k]);
              col[i * 3 + k] = lin(rgba[i * 4 + k]);
            }
          }
          const hull = [], glow = [];
          for (let i = 0; i < ni; i += 3) {
            const g = rgba[idx[i] * 4 + 3] && rgba[idx[i + 1] * 4 + 3] && rgba[idx[i + 2] * 4 + 3];
            (g ? glow : hull).push(idx[i], idx[i + 1], idx[i + 2]);
          }
          const P = new T.BufferAttribute(pos, 3), C = new T.BufferAttribute(col, 3);
          const hg = new T.BufferGeometry(); hg.setAttribute("position", P); hg.setAttribute("color", C); hg.setIndex(hull);
          ship.add(new T.Mesh(hg, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.55, metalness: 0.3 })));
          if (glow.length) {
            const gg = new T.BufferGeometry(); gg.setAttribute("position", P); gg.setIndex(glow);
            ship.add(new T.Mesh(gg, new T.MeshBasicMaterial({ color: new T.Color(0xc8ffe2).multiplyScalar(1.4), toneMapped: false })));
          }
          f3d = api;
          if (box) api.resize();
        })
        .catch((err) => console.warn("Falcon model failed to load:", err));
    }

    whenReady(() => setTimeout(() => { measure(); started = true; }, reduced ? 0 : 1300));
    addEventListener("resize", () => started && measure());

    falconTick = (dt) => {
      if (!started || !box) return;
      if (!f3d) { if (!loading && window.THREE) initFalcon3D(); return; }
      if (!reduced) ang += dt * (Math.PI * 2 / 8);
      appear = Math.min(1, appear + dt * 1.2);
      const depth = (Math.sin(ang) + 1) / 2; // 1 = nearest the viewer
      const bank = -Math.cos(ang) * 0.32;    // lean into the turn
      const s = f3d.render(ang, depth, bank);
      glCv.style.opacity = (appear * (0.6 + depth * 0.4)).toFixed(3);
      falconOrbit.classList.toggle("is-front", Math.sin(ang) > 0);
      // engine smoke: emit puffs at the exhaust, pushed backwards away from the heading
      const k = 0.72 + depth * 0.4;
      let bx = s.ex - s.x, by = s.ey - s.y;
      const bl = Math.hypot(bx, by) || 1; bx /= bl; by /= bl;
      smokeDebt += dt * (reduced ? 0 : 70);
      while (smokeDebt >= 1) {
        smokeDebt -= 1;
        const jitter = (Math.random() - 0.5) * box.len * 0.35 * k;
        smoke.push({
          x: s.ex + -by * jitter, y: s.ey + bx * jitter,
          vx: bx * (14 + Math.random() * 16) + (Math.random() - 0.5) * 8,
          vy: by * (14 + Math.random() * 16) + (Math.random() - 0.5) * 8 - 4,
          r: box.len * (0.07 + Math.random() * 0.05) * k, grow: box.len * (0.22 + Math.random() * 0.18) * k,
          life: 0, max: 1.1 + Math.random() * 0.9, spin: Math.random() * 6.28,
        });
      }
      if (smoke.length > 220) smoke.splice(0, smoke.length - 220);
      tctx.clearRect(0, 0, box.w, box.h);
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i];
        p.life += dt;
        const t = p.life / p.max;
        if (t >= 1) { smoke.splice(i, 1); continue; }
        p.vx *= 1 - dt * 0.9; p.vy *= 1 - dt * 0.9; p.vy -= dt * 3;   // slow down, rise a little
        p.x += p.vx * dt + Math.sin(p.spin + p.life * 2.2) * dt * 4;
        p.y += p.vy * dt;
        const r = p.r + p.grow * Math.sqrt(t);
        const a = (t < 0.12 ? t / 0.12 : Math.pow(1 - (t - 0.12) / 0.88, 1.6)) * 0.16 * appear;
        tctx.globalAlpha = a;
        tctx.drawImage(puff, p.x - r, p.y - r, r * 2, r * 2);
        if (t < 0.25) { // hot mint exhaust just behind the engine
          tctx.globalAlpha = a * (1 - t / 0.25) * 2.2;
          tctx.drawImage(tint, p.x - r * 0.7, p.y - r * 0.7, r * 1.4, r * 1.4);
        }
      }
      tctx.globalAlpha = 1;
    };
  }

  /* ------------------------------------------------------------------ resize */
  let rT, lastW = innerWidth;
  addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      if (innerWidth !== lastW || Math.abs(innerHeight - H) > 120) { lastW = innerWidth; sizeBg(); }
      measureTl(); measureStrip(); layoutDeck();
    }, 120);
  });
  if (document.fonts) document.fonts.ready.then(() => { measureStrip(); measureTl(); });

  /* ------------------------------------------------------------------ main loop */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!document.hidden) {
      if (fine) {
        ring.x = lerp(ring.x, mouse.x, 0.2); ring.y = lerp(ring.y, mouse.y, 0.2);
        cursor.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
        cursorDot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }
      // the starfield sleeps while a video is open, to keep playback smooth
      if (!reduced && !body.classList.contains("is-locked")) drawBg(dt);

      // hero: avatar + timeline (only while visible)
      if (scrollY < innerHeight * 1.4 && !body.classList.contains("is-locked")) {
        if (scrubbing && fine) phT = lerp(phT, phTarget, 0.3);
        else if (body.classList.contains("is-ready") && !reduced) phT = (phT + dt * (total / 36)) % total;
        playhead.style.transform = `translateX(${(phT / total) * laneW}px)`;
        if (falconTick) falconTick(dt);
        updateLive(phT);
      }

      // filmstrip drift
      if (stripVisible && setW) {
        if (!drag && !stripHover && !reduced) sx -= 28 * dt;
        while (sx <= -setW) { sx += setW; if (drag) drag.sx += setW; }
        while (sx > 0) { sx -= setW; if (drag) drag.sx -= setW; }
        stripTrack.style.transform = `translate3d(${sx}px,0,0)`;
        strip.style.setProperty("--sp", `${sx % 24}px`);
      }

      // nav
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      const prog = max > 0 ? y / max : 0;
      nav.classList.toggle("is-scrolled", y > 30);
      navScrub.style.transform = `scaleX(${prog})`;
      navTc.textContent = tc(prog * total);
    }
    requestAnimationFrame(loop);
  }
  if (reduced) drawBg(0);
  requestAnimationFrame(loop);
})();