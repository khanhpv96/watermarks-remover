import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "Googlebot",
          "Googlebot-Image",
          "Bingbot",
          "PerplexityBot",
          "Bytespider",
          "CCBot",
          "Diffbot",
          "FacebookBot",
          "Applebot",
          "Applebot-Extended",
          "cohere-ai",
          "Omgilibot",
          "Amazonbot",
          "YouBot",
        ],
        disallow: "/",
      },
    ],
  };
}
