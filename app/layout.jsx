import "./globals.css";

export const metadata = {
  title: "Alonso — Video Editor",
  description: "Alonso edits UGC ads, short-form content, motion graphics and long-form videos for brands and creators.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030605",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet" />
      </head>
      {/* the page scripts add/remove classes on <body> (intro, ready, locked) */}
      <body className="is-intro" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
