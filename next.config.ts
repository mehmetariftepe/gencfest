import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Yerel geliştirmedeki PGlite (wasm) paketlenmeden Node'dan yüklensin.
  serverExternalPackages: ["@electric-sql/pglite"],
  async headers() {
    return [
      {
        // Bilet URL'si token içerdiği için başka sitelere Referer ile sızmasın.
        source: "/bilet/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
