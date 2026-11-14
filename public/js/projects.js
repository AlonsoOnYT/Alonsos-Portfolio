/* ==========================================================================
   ALONSO — PORTFOLIO CONTENT
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to add your work.

   To add a video: copy one { ... } block inside a genre, paste it, and
   change the values. Cards, counts and the player update automatically.

   video  →  any of these:
             "videos/my-ad.mp4"                       (file in the /videos folder)
             "https://youtu.be/XXXXXXXXXXX"            (YouTube / Shorts link)
             "https://vimeo.com/123456789"             (Vimeo link)
             "https://drive.google.com/file/d/ID/view" (Google Drive, shared publicly)
             ""                                        (empty = styled placeholder)

   thumb  →  optional cover image, e.g. "thumbs/my-ad.jpg".
             Left empty: YouTube links use their thumbnail, video files use
             their first frame (and play as a preview on hover).

   ========================================================================== */

window.SITE = {
  name: "Alonso",
  role: "Video Editor",
  email: "skywalker4lonso@gmail.com",    // ← your email
  showreel: "",                          // ← showreel video link (opens from the hero button)
  // Discord card in the Contact section.
  // Add your numeric Discord user ID to open your profile directly (Discord → Settings →
  // Advanced → turn on Developer Mode → right-click your name → Copy User ID).
  discord: { username: "di4bolical._", id: "" },
  socials: [
    { label: "Instagram", url: "#" },
    { label: "TikTok",    url: "#" },
    { label: "YouTube",   url: "#" },
    { label: "LinkedIn",  url: "#" },
  ],
  // Numbers shown in the About section — change to your real figures
  stats: [
    { value: "4+",   label: "Years editing" },
    { value: "300+", label: "Videos delivered" },
    { value: "50M+", label: "Views generated" },
    { value: "40+",  label: "Brands & creators" },
  ],
  tools: ["Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut", "Photoshop", "Illustrator"],
};

/* Genre settings: ratio = card/player shape, track = its lane on the hero timeline */
window.GENRES = {
  ugc:    { label: "UGC ads",         ratio: "9/16", track: "V1" },
  short:  { label: "Short-form",      ratio: "9/16", track: "V2" },
  long:   { label: "Long-form",       ratio: "16/9", track: "V3" },
};

window.PROJECTS = {
  /* ---------------- UGC ADS ----------------
     Picked from the "Examples" Drive folder (creator-style, vertical ads).
     Files live in /videos/ugc, covers in /assets/thumbs. */
  ugc: [
    { title: "Never buy a SIM again", client: "eSIM IO", duration: "0:31", video: "videos/ugc/ugc-1.mp4", thumb: "assets/thumbs/ugc-1.jpg", desc: "POV-hook UGC ad for a travel eSIM." },
    { title: "No way they made Invincible a game", client: "Invincible: Guarding the Globe", duration: "0:38", video: "videos/ugc/ugc-2.mp4", thumb: "assets/thumbs/ugc-2.jpg", desc: "Creator-led mobile game ad." },
    { title: "POV: you found OOC", client: "OOC", duration: "0:25", video: "videos/ugc/ugc-3.mp4", thumb: "assets/thumbs/ugc-3.jpg", desc: "Reaction-hook UGC app ad." },
    { title: "Titan Rush", client: "Titan Rush", duration: "0:21", video: "videos/ugc/ugc-4.mp4", thumb: "assets/thumbs/ugc-4.jpg", desc: "Green-screen gameplay ad with captions." },
    { title: "Brownlad", client: "Creator ad", duration: "0:32", video: "videos/ugc/ugc-5.mp4", thumb: "assets/thumbs/ugc-5.jpg", desc: "Talking-head creator ad." },
    { title: "Phone hook", client: "JV", duration: "0:29", video: "videos/ugc/ugc-6.mp4", thumb: "assets/thumbs/ugc-6.jpg", desc: "Hook-first phone ad." },
  ],

  /* ---------------- SHORT-FORM ---------------- */
  short: [
    { title: "Reel 4", client: "Short-form edit", duration: "1:53", video: "videos/short/short-1.mp4", thumb: "assets/thumbs/short-1.jpg", desc: "" },
    { title: "WS video", client: "Short-form edit", duration: "1:21", video: "videos/short/short-2.mp4", thumb: "assets/thumbs/short-2.jpg", desc: "" },
    { title: "Disney's", client: "Short-form edit", duration: "0:44", video: "videos/short/short-3.mp4", thumb: "assets/thumbs/short-3.jpg", desc: "" },
    { title: "Kkneen", client: "Short-form edit", duration: "1:46", video: "videos/short/short-4.mp4", thumb: "assets/thumbs/short-4.jpg", desc: "" },
    { title: "Dandilan", client: "Short-form edit", duration: "1:15", video: "videos/short/short-5.mp4", thumb: "assets/thumbs/short-5.jpg", desc: "" },
    { title: "DreamPainter 2", client: "Short-form edit", duration: "0:40", video: "videos/short/short-6.mp4", thumb: "assets/thumbs/short-6.jpg", desc: "" },
    { title: "DreamPainter 1", client: "Short-form edit", duration: "0:43", video: "videos/short/short-7.mp4", thumb: "assets/thumbs/short-7.jpg", desc: "" },
    { title: "MC edit", client: "Short-form edit", duration: "0:27", video: "videos/short/short-8.mp4", thumb: "assets/thumbs/short-8.jpg", desc: "" },
  ],

  /* ---------------- LONG-FORM ----------------
     From the CutClarity site. Files live in /videos/long, posters in /videos/posters.
     The first one is shown large. */
  long: [
    { title: "Invincible variants", client: "Animation breakdown", duration: "13:03", video: "videos/long/01-invincible-variants.mp4", thumb: "videos/posters/long-01-invincible-variants.jpg", desc: "Long-form YouTube breakdown, paced to hold attention for 13 minutes." },
    { title: "Most loved vs most hated", client: "Animation breakdown", duration: "12:02", video: "videos/long/03-most-loved-vs-most-hated.mp4", thumb: "videos/posters/long-03-most-loved-vs-most-hated.jpg", desc: "Ranking-style breakdown with b-roll and on-screen callouts." },
    { title: "Fousey edit", client: "Creator edit", duration: "0:55", video: "videos/long/02-fousey.mp4", thumb: "videos/posters/long-02-fousey.jpg", desc: "Creator edit." },
    { title: "Outlaw", client: "Gaming", duration: "0:30", video: "videos/long/04-outlaw.mp4", thumb: "videos/posters/long-04-outlaw.jpg", desc: "Gaming edit." },
    { title: "King Julian edit", client: "Anime edit", duration: "0:16", video: "videos/long/05-sexy-king-julian.mp4", thumb: "videos/posters/long-05-sexy-king-julian.jpg", desc: "Anime-style edit." },
  ],
};