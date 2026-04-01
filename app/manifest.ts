import type { MetadataRoute } from "next";
import { seoConfig } from "./seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.siteName,
    short_name: seoConfig.siteName,
    description: seoConfig.defaultDescription,
    start_url: "/uz",
    display: "standalone",
    background_color: "#f7fbfb",
    theme_color: "#15959b",
    icons: [
      {
        src: "/icon.png",
        sizes: "380x380",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "380x380",
        type: "image/png",
      },
    ],
  };
}
