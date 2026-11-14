import { MARKUP } from "./markup";
import SiteScripts from "./SiteScripts";

// The page markup (sections, cards, player) is rendered on the server, so every
// section — including the UGC ads — is in the HTML before any script runs.
// SiteScripts then loads the interactions (starfield, deck, player, 3D, animations).
export default function Home() {
  return (
    <>
      <div className="site-root" dangerouslySetInnerHTML={{ __html: MARKUP }} />
      <SiteScripts />
    </>
  );
}
