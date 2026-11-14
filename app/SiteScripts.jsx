"use client";

import { useEffect } from "react";

// Loaded in this exact order: content → interactions → three.js → 3D statue.
const SCRIPTS = [
  "/js/projects.js",
  "/js/main.js",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "/js/avatar.js",
];

export default function SiteScripts() {
  useEffect(() => {
    if (window.__alonsoScripts) return; // run once
    window.__alonsoScripts = true;
    let i = 0;
    const next = () => {
      if (i >= SCRIPTS.length) return;
      const s = document.createElement("script");
      s.src = SCRIPTS[i++];
      s.async = false;
      s.onload = next;
      s.onerror = () => { console.error("Failed to load", s.src); next(); };
      document.body.appendChild(s);
    };
    next();
  }, []);
  return null;
}
