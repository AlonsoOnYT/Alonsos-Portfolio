# Alonso — video editing portfolio (Next.js)

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For the production version locally:

```bash
npm run build
npm start
```

## Deploy to Vercel

**From GitHub:** push this folder to a GitHub repository (use GitHub Desktop or `git push` — the website upload page can't take the larger videos), then on vercel.com choose **Add New → Project**, import it and click **Deploy**. Vercel detects Next.js automatically.

**From your computer:** run `npx vercel --prod` inside this folder.

## Where things are

```
app/
  layout.jsx        page <head>, fonts
  page.jsx          renders the page
  markup.js         the page's HTML (all sections, UGC cards, player)
  SiteScripts.jsx   loads the site's scripts in order
  globals.css       all styles
public/
  js/projects.js    ← your content: videos, titles, email, Discord card
  js/main.js        interactions, starfield, player, text animations
  js/avatar.js      3D statue
  models/           statue + Millennium Falcon
  videos/ugc/       UGC ad videos
  videos/short/     short-form videos
  videos/long/      long-form videos
  videos/posters/   long-form covers
  assets/thumbs/    UGC + short-form covers
```

## Changing videos

Edit `public/js/projects.js`. A video can be a file in `public/videos/` (e.g. `"videos/ugc/my-ad.mp4"`) or a YouTube / Vimeo / Google Drive link. Keep each file under 100 MB (GitHub's limit).

All videos in this project are stored as files inside it, so they don't depend on Google Drive sharing.
