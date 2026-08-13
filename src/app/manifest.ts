import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/slot" : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "人生クエスト",
    short_name: "人生クエスト",
    description: "日々の行動が経験値になる、レトロRPG風ライフログアプリ",
    start_url: `${basePath}/home/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "ja",
    icons: [
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${basePath}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
