import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  functions: {
    "api-posts": {
      runtime: "edge" as const,
      routes: ["app/api/posts/route"] as const,
      patterns: ["/api/posts"],
    },
    "api-discover": {
      runtime: "edge" as const,
      routes: ["app/api/discover/route"] as const,
      patterns: ["/api/discover"],
    },
    "api-comments": {
      runtime: "edge" as const,
      routes: ["app/api/comments/[id]/route"] as const,
      patterns: ["/api/comments/*"],
    },
  },
};
