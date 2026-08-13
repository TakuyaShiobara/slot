import type { NextConfig } from "next";

// GitHub Pages はプロジェクトサイトの場合 https://<user>.github.io/<repo>/ 配下に
// 配信されるため、リポジトリ名をbasePathとして付与する。それ以外(Vercel等)では
// GITHUB_PAGES を立てずに従来通りルート配信する。
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/slot" : "";

const nextConfig: NextConfig = {
  // GitHub Pagesにはサーバーがないため静的出力(output: "export")にする。
  // Vercel等サーバー機能が使えるホストでは通常のNext.jsビルドのままにしておく。
  ...(isGithubPages ? { output: "export" as const } : {}),
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
