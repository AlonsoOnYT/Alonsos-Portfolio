/* ==========================================================================
   ALONSO — 3D figure (models/anakin.bin)
   The statue is converted from the user's STL into a compact mesh
   (see the header comment format below). It's rendered as a dark polished
   statue; the lightsaber blade glows neon lime. The head turns toward the
   cursor: vertices above the neck are rotated in the vertex shader with a
   soft falloff, so there's no seam at the neck. Click for a spin.

   anakin.bin: 'AVT1' | u32 nVerts | u32 nIndices | f32 x8 meta
               (height, neckY, headTopY, headX, headZ, headR, -, -)
               | u16 x3 x nVerts quantised positions | f32 x6 bbox | u32 indices
   ========================================================================== */
(() => {
  "use strict";
  const host = document.getElementById("avatarStage");
  if (!host || !window.THREE) return;
  const T = window.THREE;
  const MODEL = "models/anakin.bin";
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const LIME = 0x95D5B2;
  const lin = (hex) => new T.Color(hex).convertSRGBToLinear();

  /* ---------------- renderer / scene ---------------- */
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(27, 1, 0.1, 100);
  const CAM_Z = 15.5;
  camera.position.set(0, 3.4, CAM_Z);
  camera.lookAt(0, 3.0, 0);

  // soft studio environment for reflections on the polished statue
  {
    const pmrem = new T.PMREMGenerator(renderer);
    const env = new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(30, 30, 30), new T.MeshBasicMaterial({ color: 0x050a08, side: T.BackSide })));
    const panel = (w, h, color, pos) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color, side: T.DoubleSide }));
      m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(12, 6, 0xffffff, [0, 12, 8]);
    panel(6, 10, 0x8e97bb, [-12, 4, 4]);
    panel(4, 10, 0x74c69d, [-10, 3, -10]);
    panel(5, 10, 0x2d6a4f, [10, 3, -10]);
    scene.environment = pmrem.fromScene(env, 0.04).texture;
  }

  scene.add(new T.HemisphereLight(0xcfe8d6, 0x081c15, 0.45));
  const key = new T.DirectionalLight(0xffffff, 2.2);
  key.position.set(3.5, 8, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 8, bottom: -1, near: 1, far: 30 });
  scene.add(key);
  const fillL = new T.DirectionalLight(0xb7e4c7, 0.45); fillL.position.set(-7, 3, 6); scene.add(fillL);
  const limeRim = new T.DirectionalLight(LIME, 0.9); limeRim.position.set(-6, 5, -6); scene.add(limeRim);
  const redRim = new T.DirectionalLight(0x40916c, 1.8); redRim.position.set(6, 4, -6); scene.add(redRim);
  const saberLight = new T.PointLight(LIME, 0, 6, 2); scene.add(saberLight);

  const ground = new T.Mesh(new T.PlaneGeometry(20, 20), new T.ShadowMaterial({ opacity: 0.5 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------------- materials ---------------- */
  const head = {
    rot: { value: new T.Matrix3() },
    pivot: { value: new T.Vector3(0, 5.2, 0) },
    neck: { value: 5.2 },
    radius: { value: 0.42 },
  };
  // rotate everything above the neck (and near the head's axis) around the neck pivot
  function headDeform(material) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uHeadRot = head.rot;
      shader.uniforms.uPivot = head.pivot;
      shader.uniforms.uNeck = head.neck;
      shader.uniforms.uHeadR = head.radius;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>
          uniform mat3 uHeadRot; uniform vec3 uPivot; uniform float uNeck; uniform float uHeadR;`)
        .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>
          float hw = smoothstep(uNeck - 0.14, uNeck + 0.16, position.y)
                   * (1.0 - smoothstep(uHeadR, uHeadR + 0.28, length(position.xz - uPivot.xz)));
          objectNormal = normalize(mix(objectNormal, uHeadRot * objectNormal, hw));`)
        .replace("#include <begin_vertex>", `#include <begin_vertex>
          transformed = mix(transformed, uPivot + uHeadRot * (transformed - uPivot), hw);`);
    };
    return material;
  }
  const statue = headDeform(new T.MeshStandardMaterial({ color: lin(0x1d2a24), metalness: 0.55, roughness: 0.36, envMapIntensity: 1.1 }));
  // the blade is pure light: unlit and not tone-mapped so it reads as a glow
  const BLADE = new T.Color(0xb7ffd2).convertSRGBToLinear();
  const blade = new T.MeshBasicMaterial({ color: BLADE.clone().multiplyScalar(1.6), toneMapped: false });
  const bladeHalo = new T.MeshBasicMaterial({ color: lin(LIME), transparent: true, opacity: 0.18, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });

  const root = new T.Group(); scene.add(root);
  let ready = false, headCenter = new T.Vector3(0, 5.6, 0);

  function build(buf) {
    const dv = new DataView(buf);
    const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
    if (magic !== "AVT1") throw new Error("Unexpected model format");
    const nv = dv.getUint32(4, true), ni = dv.getUint32(8, true);
    const meta = new Float32Array(buf.slice(12, 12 + 32));
    let off = 44;
    const q = new Uint16Array(buf.slice(off, off + nv * 6)); off += nv * 6;
    const bb = new Float32Array(buf.slice(off, off + 24)); off += 24;
    const idx = new Uint32Array(buf.slice(off, off + ni * 4));

    const pos = new Float32Array(nv * 3);
    for (let i = 0; i < nv; i++) {
      for (let a = 0; a < 3; a++) pos[i * 3 + a] = bb[a] + (q[i * 3 + a] / 65535) * (bb[3 + a] - bb[a]);
    }
    const [, neckY, topY, hx, hz, headR] = meta;
    head.neck.value = neckY;
    head.pivot.value.set(hx, neckY, hz);
    head.radius.value = headR;
    headCenter.set(hx, (neckY + topY) / 2 + 0.05, hz);

    // find the lightsaber blade: the long thin part held away from the body
    const far = [];
    for (let i = 0; i < nv; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
      if (Math.hypot(x - hx, z - hz) > 1.25 && y > 3.6) far.push([x, y, z]);
    }
    let bladeLine = null;
    if (far.length > 20) {
      const c = far.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0]).map((v) => v / far.length);
      const tip = far.reduce((b, p) => (p[1] > b[1] ? p : b), far[0]);
      const dir = new T.Vector3(tip[0] - c[0], tip[1] - c[1], tip[2] - c[2]).normalize();
      bladeLine = { c: new T.Vector3(...c), dir, tipT: new T.Vector3(...tip).sub(new T.Vector3(...c)).dot(dir) };
    }
    const isBlade = new Uint8Array(nv);
    if (bladeLine) {
      const p = new T.Vector3();
      for (let i = 0; i < nv; i++) {
        p.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).sub(bladeLine.c);
        const t = p.dot(bladeLine.dir);
        const d = p.clone().sub(bladeLine.dir.clone().multiplyScalar(t)).length();
        // blade runs from a little above the hilt up to the tip
        if (d < 0.11 && t > -bladeLine.tipT * 1.15 && pos[i * 3 + 1] > 2.9) isBlade[i] = 1;
      }
      const mid = bladeLine.c;
      saberLight.position.copy(mid);
      saberLight.intensity = 2.2;
    }
    const bodyIdx = [], bladeIdx = [];
    for (let i = 0; i < ni; i += 3) {
      const a = idx[i], b = idx[i + 1], c = idx[i + 2];
      (isBlade[a] && isBlade[b] && isBlade[c] ? bladeIdx : bodyIdx).push(a, b, c);
    }
    const posAttr = new T.BufferAttribute(pos, 3);
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", posAttr);
    geo.setIndex(bodyIdx);
    geo.computeVertexNormals();
    const statueMesh = new T.Mesh(geo, statue);
    statueMesh.castShadow = true; statueMesh.receiveShadow = true;
    root.add(statueMesh);
    if (bladeIdx.length) {
      const bg = new T.BufferGeometry();
      bg.setAttribute("position", posAttr);
      bg.setIndex(bladeIdx);
      bg.computeVertexNormals();
      root.add(new T.Mesh(bg, blade));
      // soft halo: a slightly fattened copy of the blade, additive
      const halo = bg.clone();
      const hp = halo.getAttribute("position").clone(); halo.setAttribute("position", hp);
      const n = halo.getAttribute("normal");
      const used = new Set(bladeIdx);
      used.forEach((i) => hp.setXYZ(i, hp.getX(i) + n.getX(i) * 0.06, hp.getY(i) + n.getY(i) * 0.06, hp.getZ(i) + n.getZ(i) * 0.06));
      root.add(new T.Mesh(halo, bladeHalo));
    }
    ready = true;
    host.classList.add("is-loaded");
  }

  fetch(MODEL)
    .then((r) => { if (!r.ok) throw new Error(`${MODEL}: ${r.status}`); return r.arrayBuffer(); })
    .then(build)
    .catch((err) => { console.warn("Avatar model failed to load:", err); host.classList.add("is-error"); });

  /* ---------------- sizing ---------------- */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.75 ? CAM_Z / (w / h / 0.75) : CAM_Z;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  /* ---------------- interaction ---------------- */
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; } }, { passive: true });
  document.addEventListener("mouseleave", () => { mouse.active = false; });
  let spinAt = 0;
  host.addEventListener("click", () => { if (!spinAt) spinAt = performance.now(); });
  const hint = document.querySelector(".avatar__hint");
  if (hint && !fine) hint.textContent = "Tap him for a spin";

  const track = document.getElementById("avatarTrack");
  const conf = document.getElementById("avatarConf");
  const avatarEl = document.getElementById("avatar");
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(host);

  const look = { yaw: 0, pitch: 0 };
  const tmp = new T.Vector3();
  const qHead = new T.Quaternion(), eHead = new T.Euler(0, 0, 0, "YXZ"), mHead = new T.Matrix4();
  let tx = 0, ty = 0, confAt = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || document.body.classList.contains("is-locked")) return;
    const t = now / 1000;

    tmp.copy(headCenter);
    root.localToWorld(tmp);
    tmp.project(camera);
    const r = host.getBoundingClientRect();
    const hx = r.left + (tmp.x * 0.5 + 0.5) * r.width;
    const hy = r.top + (-tmp.y * 0.5 + 0.5) * r.height;

    let yawT, pitchT;
    if (fine && mouse.active) {
      yawT = clamp((mouse.x - hx) / (innerWidth * 0.35), -1, 1) * 0.75;
      pitchT = clamp((mouse.y - hy) / (innerHeight * 0.45), -1, 1) * 0.38;
    } else {
      yawT = reduced ? 0 : Math.sin(t * 0.6) * 0.55;
      pitchT = reduced ? 0 : Math.sin(t * 0.37) * 0.1;
    }
    look.yaw = lerp(look.yaw, yawT, 0.1);
    look.pitch = lerp(look.pitch, pitchT, 0.1);
    eHead.set(look.pitch, look.yaw, -look.yaw * 0.06);
    qHead.setFromEuler(eHead);
    mHead.makeRotationFromQuaternion(qHead);
    head.rot.value.setFromMatrix4(mHead);
    root.rotation.y = look.yaw * 0.12;

    // saber hum: the glow flickers very slightly
    if (!reduced) {
      blade.color.copy(BLADE).multiplyScalar(1.6 + Math.sin(t * 31) * 0.06 + Math.sin(t * 7.3) * 0.1);
      bladeHalo.opacity = 0.16 + Math.sin(t * 19) * 0.03;
      saberLight.intensity = ready ? 2.0 + Math.sin(t * 23) * 0.15 : 0;
    }

    let hop = 0;
    if (spinAt) {
      const k = (now - spinAt) / 1100;
      if (k >= 1) { spinAt = 0; }
      else {
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        root.rotation.y += e * Math.PI * 2;
        hop = Math.sin(k * Math.PI);
      }
    }
    root.position.y = hop * 0.6;

    renderer.render(scene, camera);

    if (track && ready) {
      const near = fine && mouse.active && Math.hypot(mouse.x - hx, mouse.y - hy) < r.height * 0.3;
      avatarEl.classList.toggle("is-near", near);
      const bw = track.offsetWidth, bh = track.offsetHeight;
      const ar = avatarEl.getBoundingClientRect();
      tx = lerp(tx, hx - ar.left - bw / 2 + (reduced ? 0 : (Math.random() - 0.5) * 0.8), 0.18);
      ty = lerp(ty, hy - ar.top - bh / 2, 0.18);
      track.style.setProperty("--tx", `${tx.toFixed(1)}px`);
      track.style.setProperty("--ty", `${ty.toFixed(1)}px`);
      if (now - confAt > 350) { confAt = now; conf.textContent = `${near ? 99 : 94 + Math.floor(Math.random() * 5)}%`; }
    }
  }
  requestAnimationFrame(frame);
})();
